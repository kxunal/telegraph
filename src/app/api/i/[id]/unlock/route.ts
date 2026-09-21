import { NextRequest, NextResponse } from 'next/server';
import { getImage } from '@/lib/db';

async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await req.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
        }

        const record = await getImage(id, false);
        if (!record) {
            return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
        }

        if (!record.password) {
            return NextResponse.json({ success: true, message: 'File is not password protected' });
        }

        const hashedPassword = await hashPassword(password);
        if (hashedPassword === record.password) {
            const response = NextResponse.json({ success: true });
            
            // Set cookie so the browser is authenticated to see the image/text
            response.cookies.set(`unlocked_${id}`, 'true', {
                path: '/',
                httpOnly: true,
                maxAge: 3600, // 1 hour
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            });

            return response;
        }

        return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message || 'Internal server error' }, { status: 500 });
    }
}
