import { NextResponse } from "next/server";

const MCX_BASE = "https://www.mcxindia.com";

export async function POST(request) {
    try {
        const body = await request.json();

        const { commodity, expiry } = body;

        if (!commodity || !expiry) {
            return NextResponse.json(
                { error: "commodity and expiry are required" },
                { status: 400 }
            );
        }

        const response = await fetch(
            `${MCX_BASE}/backpage.aspx/GetOptionChain`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "application/json, text/plain, */*",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Connection": "keep-alive",
                    "Referer": "https://www.mcxindia.com/market-data/option-chain",
                    "Origin": "https://www.mcxindia.com",
                },
                body: JSON.stringify({
                    Commodity: commodity.toUpperCase(),
                    Expiry: expiry,
                }),
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error fetching MCX option chain:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}