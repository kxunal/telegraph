import { NextRequest, NextResponse } from 'next/server';
import { uploadToTelegram, sendLog } from '@/lib/telegram';
import { saveImage, generateId, rateLimit } from '@/lib/db';

async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const limit = await rateLimit(`upload:${ip}`, 500, 60);

    if (!limit.success) {
        return NextResponse.json({
            success: false,
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: `Too many uploads. Try again in ${limit.remaining === 0 ? 'a minute' : 'a moment'}.`
            }
        }, {
            status: 429,
            headers: {
                'X-RateLimit-Limit': (limit.limit ?? 500).toString(),
                'X-RateLimit-Remaining': (limit.remaining ?? 0).toString()
            }
        });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const customId = formData.get('customId') as string;
        const password = formData.get('password') as string;
        const expiration = formData.get('expiration') as string; // 'never' | '1view' | '10mins' | '1hour' | '1day'

        if (!file) {
            return NextResponse.json({
                success: false,
                error: { code: 'MISSING_FILE', message: 'No file provided in request' }
            }, { status: 400 });
        }

        // Enforce 50MB limit
        const MAX_SIZE = 50 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json({
                success: false,
                error: { code: 'FILE_TOO_LARGE', message: 'File too large. Max size is 50MB.' }
            }, { status: 400 });
        }

        // 1. Upload to Telegram
        let mediaType: 'photo' | 'animation' | 'video' | 'document' = 'photo';
        const fileType = file.type || '';
        let fileName = file.name || 'document.dat';
        try {
            fileName = decodeURIComponent(fileName);
        } catch (e) {
            // Keep original if decode fails
        }

        if (fileType.startsWith('video/')) mediaType = 'video';
        else if (fileType === 'image/gif') mediaType = 'animation';
        else if (fileType.startsWith('text/') || fileType === 'application/json') mediaType = 'document';
        else if (!fileType.startsWith('image/')) mediaType = 'document'; // Default non-image to document

        const telegramResult = await uploadToTelegram(file, fileName, '📦 <b>Uploaded in web</b>', mediaType);

        // 2. Generate ID
        const id = customId ? customId.toLowerCase().replace(/[^a-z0-9-]/g, '-') : generateId();

        // 3. Process password and expiration
        let hashedPassword = undefined;
        if (password && password.trim().length > 0) {
            hashedPassword = await hashPassword(password);
        }

        let expires_at = undefined;
        let max_views = undefined;

        if (expiration === '1view') {
            max_views = 1;
        } else if (expiration === '10mins') {
            expires_at = Date.now() + 10 * 60 * 1000;
        } else if (expiration === '1hour') {
            expires_at = Date.now() + 60 * 60 * 1000;
        } else if (expiration === '1day') {
            expires_at = Date.now() + 24 * 60 * 60 * 1000;
        }

        const record = {
            id,
            telegram_file_id: telegramResult.file_id,
            created_at: Date.now(),
            expires_at,
            max_views,
            password: hashedPassword,
            metadata: {
                size: file.size,
                type: file.type,
                name: fileName,
                version: 'v1'
            }
        };

        // Save to DB
        await saveImage(record);

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
            (req.headers.get('host') ? `http://${req.headers.get('host')}` : '');

        const publicUrl = `${baseUrl}/i/${id}`;

        // Log to Telegram
        await sendLog(`🌐 <b>New Web Upload</b>\n\nType: ${file.type}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB\nLink: ${publicUrl}`);

        return NextResponse.json({
            success: true,
            data: {
                id,
                url: `${baseUrl}/i/${id}`,
                direct_url: `${baseUrl}/i/${id}.jpg`,
                timestamp: record.created_at
            }
        });

    } catch (error: any) {
        console.error('Upload API Error:', error);
        await sendLog(`❌ <b>Web Upload Error</b>\n\nError: ${error.message || error}`);
        return NextResponse.json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: error.message || 'Server processed request failed' }
        }, { status: 500 });
    }
}
