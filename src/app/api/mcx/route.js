import { NextResponse } from "next/server";

const MCX_BASE = "https://www.mcxindia.com";

// GET /api/mcx — fetches raw option chain HTML
export async function GET() {
    try {
        const response = await fetch(
            `${MCX_BASE}/market-data/option-chain`
        );

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const html = await response.text();

        return new NextResponse(html, {
            status: 200,
            headers: { "Content-Type": "text/html" },
        });
    } catch (error) {
        console.error("Error fetching MCX HTML:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

// POST /api/mcx — fetches option chain data by commodity + expiry
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
                },
                body: JSON.stringify({
                    Commodity: commodity.toUpperCase(),
                    Expiry: expiry,
                }),
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