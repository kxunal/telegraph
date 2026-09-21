import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsData } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const stats = await getAnalyticsData();
        return NextResponse.json({ success: true, data: stats });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
