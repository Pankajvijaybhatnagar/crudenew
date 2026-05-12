import { NextResponse } from "next/server";

const MCX_BASE = "https://www.mcxindia.com";

export async function GET() {
    try {
        const response = await fetch(
            `${MCX_BASE}/market-data/option-chain`
        );

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const html = await response.text();

        // Extract vTick from HTML
        const vTickMatch = html.match(/vTick\s*=\s*(\[[\s\S]*?\]);/);

        if (!vTickMatch || !vTickMatch[1]) {
            return NextResponse.json(
                { error: "vTick not found in HTML" },
                { status: 500 }
            );
        }

        const vTick = JSON.parse(vTickMatch[1]);

        // Extract unique expiry dates for CRUDEOIL
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