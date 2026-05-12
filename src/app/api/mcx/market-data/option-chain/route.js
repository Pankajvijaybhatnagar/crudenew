import { NextResponse } from "next/server";

const MCX_BASE = "https://www.mcxindia.com";

export async function GET() {
    try {
        const response = await fetch(
            `${MCX_BASE}/market-data/option-chain`,
            {
                method: "GET",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Connection": "keep-alive",
                    "Upgrade-Insecure-Requests": "1",
                    "Cache-Control": "max-age=0",
                    "Referer": "https://www.mcxindia.com/",
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const html = await response.text();

        const vTickMatch = html.match(/vTick\s*=\s*(\[[\s\S]*?\]);/);

        if (!vTickMatch || !vTickMatch[1]) {
            return NextResponse.json(
                { error: "vTick not found in HTML" },
                { status: 500 }
            );
        }

        const vTick = JSON.parse(vTickMatch[1]);

        const expiries = [
            ...new Set(
                vTick
                    .filter((item) => item.SymbolValue === "CRUDEOIL")
                    .map((item) => item.ExpiryDate)
                    .filter(Boolean)
            ),
        ].sort();

        return NextResponse.json({ vTick, expiries }, { status: 200 });
    } catch (error) {
        console.error("Error fetching MCX HTML:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}