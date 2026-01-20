import { NextResponse } from 'next/server';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwenUJmN6UupyOxq3knpvkx-qDIMgK6sdyg47kW6XbVaSaSK7uEsBYSeCyFdMfYA549/exec';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'customers';
    const id = searchParams.get('id');

    const targetUrl = new URL(GAS_URL);
    targetUrl.searchParams.set('type', type);
    if (id) targetUrl.searchParams.set('id', id);

    try {
        const response = await fetch(targetUrl.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            cache: 'no-store' // Ensure fresh data from GAS
        });

        const data = await response.json();

        // Ensure customers/list returns an array to prevent .map() errors on frontend
        if (type === 'customers' && !Array.isArray(data)) {
            console.warn('Proxy received non-array data for customers:', data);
            return NextResponse.json([]);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('GAS GET Proxy Error:', error);
        // Fallback to empty array for customers to avoid crashing the dashboard
        return NextResponse.json(type === 'customers' ? [] : { error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const response = await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // GAS POST might redirect or return text/json
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('GAS POST Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to process request to GAS' }, { status: 500 });
    }
}
