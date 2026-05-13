import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // Get symbol from query params
        const { searchParams } = new URL(request.url);
        const symbol = searchParams.get('symbol');

        if (!symbol) {
            return NextResponse.json(
                { error: 'Symbol query parameter is required' },
                { status: 400 }
            );
        }

        // Fetch MCX option chain page
        const response = await fetch(
            'https://www.mcxindia.com/market-data/option-chain',
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                },
                cache: 'no-store',
            }
        );

        const html = await response.text();

        // Extract vTick array
        const vTickMatch = html.match(
            /var\s+vTick\s*=\s*(\[.*?\]);/s
        );

        if (!vTickMatch) {
            return NextResponse.json(
                { error: 'vTick data not found' },
                { status: 500 }
            );
        }

        // Parse JSON data
        const vTick = JSON.parse(vTickMatch[1]);

        // Filter expiries by symbol
        const expiries = vTick
            .filter(
                (item) =>
                    item.SymbolValue?.toUpperCase() ===
                    symbol.toUpperCase()
            )
            .map((item) => item.ExpiryDate)
            .filter(Boolean);

        // Remove duplicates
        const uniqueExpiries = [...new Set(expiries)];

        // Sort expiries
        uniqueExpiries.sort();

        return NextResponse.json(uniqueExpiries);

    } catch (error) {
        console.error('MCX Expiry API Error:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch expiry dates',
                message: error.message,
            },
            { status: 500 }
        );
    }
}