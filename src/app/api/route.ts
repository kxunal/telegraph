import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'Welcome to the Telegraph API',
        version: 'v1',
        documentation: '/docs',
        endpoints: {
            v1: '/api/v1'
        }
    });
}
