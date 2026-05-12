'use client';
import { useCallback, useEffect, useState } from "react";
import CrudeOilFilters from "../components/CrudeOilFilters";
import CrudeOilTable from "../components/CrudeOilTable";

const CrudeOil = () => {
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        type: "OPTION_CHAIN",
        symbol: "CRUDEOIL",
        expiry: "",
    });

    const [expiryList, setExpiryList] = useState([]);

    const [optionChainData, setOptionChainData] = useState([]);

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    const unwrapRows = (response) => {
        const rows =
            response?.d?.Data ??
            response?.Data ??
            (Array.isArray(response) ? response : []);

        if (!Array.isArray(rows)) {
            console.warn("Unexpected MCX response shape:", response);
            return [];
        }

        return rows;
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Load expiry dates — calls Next.js API route directly
    // ─────────────────────────────────────────────────────────────────────────

    const loadExpiries = async () => {
        try {
            setLoading(true);

            const response = await fetch("/api/mcx/market-data/option-chain");

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();

            const expiries = data.expiries ?? [];

            setExpiryList(expiries);

            if (expiries.length) {
                setFilters((prev) => ({
                    ...prev,
                    expiry: expiries[0],
                }));
            }
        } catch (error) {
            console.error("Error loading expiries:", error);
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Load option chain data — calls Next.js API route directly
    // ─────────────────────────────────────────────────────────────────────────

    const loadOptionChainData = async (commodity, expiry) => {
        try {
            if (!commodity || !expiry) return;

            setLoading(true);

            const response = await fetch(
                "/api/mcx/backpage.aspx/GetOptionChain",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        commodity,
                        expiry,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const result = await response.json();

            console.log("MCX Option Chain Response:", result);

            const rows = unwrapRows(result);

            console.log(`MCX rows: ${rows.length}, spot: ${rows[0]?.UnderlyingValue}`);

            setOptionChainData(rows);
        } catch (error) {
            console.error("Error loading option chain:", error);
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // fetchOptionChain — passed to CrudeOilTable for 2-second self-polling
    // ─────────────────────────────────────────────────────────────────────────

    const fetchOptionChain = useCallback(async () => {
        const { symbol, expiry } = filters;
        if (!symbol || !expiry) return undefined;

        try {
            const response = await fetch(
                "/api/mcx/backpage.aspx/GetOptionChain",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        commodity: symbol,
                        expiry,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const result = await response.json();

            const rows = unwrapRows(result);

            return rows.length ? rows : undefined;
        } catch (error) {
            console.error("Error in fetchOptionChain:", error);
            return undefined;
        }
    }, [filters.symbol, filters.expiry]);

    // ─────────────────────────────────────────────────────────────────────────
    // Effects
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        loadExpiries();
    }, []);

    useEffect(() => {
        if (filters.expiry) {
            loadOptionChainData(filters.symbol, filters.expiry);
        }
    }, [filters.expiry, filters.symbol]);

    // ─────────────────────────────────────────────────────────────────────────
    // Filter change handler
    // ─────────────────────────────────────────────────────────────────────────

    const handleFilterChange = (updatedFilters) => {
        setFilters(updatedFilters);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div>
            <h1 style={{ marginBottom: "20px" }}>Crude Oil Option Chain</h1>

            <CrudeOilFilters
                expiryList={expiryList}
                onChange={handleFilterChange}
            />

            <CrudeOilTable
                loading={loading}
                data={optionChainData}
                fetchOptionChain={filters.expiry ? fetchOptionChain : undefined}
            />
        </div>
    );
};

export default CrudeOil;