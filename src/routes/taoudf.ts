import { Hono } from "hono";
import { taoApiCall } from "../utils";
import type { Bindings } from "./tao";

const taoUdf = new Hono<{ Bindings: Bindings }>();

// Type definitions for UDF responses
type UDFConfigurationData = {
	supported_resolutions: string[];
	supports_group_request: boolean;
	supports_marks: boolean;
	supports_search: boolean;
	supports_timescale_marks: boolean;
	supports_time: boolean;
	exchanges: { value: string; name: string; desc: string }[];
	symbols_types: { name: string; value: string }[];
};

type UDFSymbolInfo = {
	name: string;
	ticker: string;
	description: string;
	type: string;
	exchange: string;
	listed_exchange: string;
	timezone: string;
	session: string;
	minmov: number;
	pricescale: number;
	has_intraday: boolean;
	has_daily: boolean;
	has_weekly_and_monthly: boolean;
	supported_resolutions: string[];
	currency_code: string;
	original_currency_code: string;
	volume_precision: number;
};

type UDFSearchResult = {
	symbol: string;
	full_name: string;
	description: string;
	exchange: string;
	ticker: string;
	type: string;
};

type UDFBar = {
	s: "ok" | "error" | "no_data";
	errmsg?: string;
	t?: number[];
	c?: number[];
	o?: number[];
	h?: number[];
	l?: number[];
	v?: number[];
	nextTime?: number;
};

// Map TradingView resolutions to TAO intervals
const resolutionToInterval = (resolution: string): number => {
	switch (resolution) {
		case "1":
			return 1;
		case "5":
			return 5;
		case "15":
			return 15;
		case "30":
			return 30;
		case "60":
			return 60;
		case "240":
			return 240;
		case "D":
		case "1D":
			return 1440; // 24 * 60 minutes
		case "W":
		case "1W":
			return 10080; // 7 * 24 * 60 minutes
		default:
			return 15; // Default to 15 minutes
	}
};

// UDF API endpoints

// 1. Configuration data
taoUdf.get("/config", async (c) => {
	const config: UDFConfigurationData = {
		supported_resolutions: ["1", "5", "15", "30", "60", "240", "D", "W"],
		supports_group_request: false,
		supports_marks: false,
		supports_search: true,
		supports_timescale_marks: false,
		supports_time: true,
		exchanges: [
			{ value: "", name: "All Exchanges", desc: "" },
			{ value: "TAO", name: "TAO", desc: "TAO Subnets" },
		],
		symbols_types: [
			{ name: "All types", value: "" },
			{ name: "Subnet", value: "subnet" },
		],
	};

	return c.json(config);
});

// 2. Symbol search
taoUdf.get("/search", async (c) => {
	const query = c.req.query("query") || "";
	const limit = Number.parseInt(c.req.query("limit") || "30");

	try {
		// Get all subnets info
		const subnetsInfo = await taoApiCall(
			c.env.TAO_API_KEY,
			"/api/beta/subnet_screener",
		);

		// Filter subnets based on query
		const filteredSubnets = subnetsInfo
			.filter(
				(subnet: any) =>
					subnet.subnet_name.toLowerCase().includes(query.toLowerCase()) ||
					subnet.netuid.toString().includes(query),
			)
			.slice(0, limit);

		// Format results for UDF
		const results: UDFSearchResult[] = filteredSubnets.map((subnet: any) => ({
			symbol: subnet.netuid.toString(),
			full_name: `TAO:${subnet.netuid}`,
			description: subnet.subnet_name,
			exchange: "TAO",
			ticker: subnet.netuid.toString(),
			type: "subnet",
		}));

		return c.json(results);
	} catch (error) {
		console.error(`Error in subnet search: ${error}`);
		return c.json([]);
	}
});

// 3. Symbol info
taoUdf.get("/symbols", async (c) => {
	const symbol = c.req.query("symbol") || "";

	// Extract netuid directly from symbol
	let netuid = symbol;

	// Still support legacy format for backward compatibility
	if (symbol.startsWith("TAO-")) {
		netuid = symbol.substring(4);
	} else if (symbol.includes(":")) {
		netuid = symbol.split(":")[1];
	}

	try {
		// Get subnet info
		const subnetsInfo = await taoApiCall(
			c.env.TAO_API_KEY,
			"/api/beta/subnet_screener",
		);
		const subnetInfo = subnetsInfo.find(
			(subnet: any) => subnet.netuid.toString() === netuid,
		);

		if (!subnetInfo) {
			return c.json({ s: "error", errmsg: "Subnet not found" });
		}

		// Format symbol info for UDF
		const result: UDFSymbolInfo = {
			name: subnetInfo.netuid.toString(),
			ticker: subnetInfo.netuid.toString(),
			description: subnetInfo.subnet_name,
			type: "subnet",
			exchange: "TAO",
			listed_exchange: "TAO",
			timezone: "Etc/UTC",
			session: "24x7",
			minmov: 1,
			pricescale: 1000000000, // High precision
			has_intraday: true,
			has_daily: true,
			has_weekly_and_monthly: true,
			supported_resolutions: ["1", "5", "15", "30", "60", "240", "D", "W"],
			currency_code: "TAO",
			original_currency_code: "TAO",
			volume_precision: 8,
		};

		return c.json(result);
	} catch (error) {
		console.error(`Error in subnet info: ${error}`);
		return c.json({ s: "error", errmsg: "Failed to fetch subnet info" });
	}
});

// 4. History data (bars)
taoUdf.get("/history", async (c) => {
	const symbol = c.req.query("symbol") || "";
	const resolution = c.req.query("resolution") || "D";
	const from = Number.parseInt(c.req.query("from") || "0");
	const to = Number.parseInt(c.req.query("to") || "0");

	// Extract netuid directly from symbol
	let netuid = symbol;

	// Still support legacy format for backward compatibility
	if (symbol.startsWith("TAO-")) {
		netuid = symbol.substring(4);
	} else if (symbol.includes(":")) {
		netuid = symbol.split(":")[1];
	}

	// Convert TradingView resolution to minutes
	const intervalMinutes = resolutionToInterval(resolution);

	try {
		// Convert Unix seconds to milliseconds for the API
		const startTimestamp = from * 1000;
		const endTimestamp = to * 1000;

		// Fetch OHLC data from TAO API using timestamp parameters
		const ohlcData = await taoApiCall(
			c.env.TAO_API_KEY,
			"/api/beta/subnets/ohlc",
			{
				netuid,
				start: startTimestamp.toString(),
				end: endTimestamp.toString(),
				interval_minutes: intervalMinutes.toString(),
			},
		);

		// Check if we have data
		if (!ohlcData.data || ohlcData.data.length === 0) {
			return c.json({ s: "no_data" });
		}

		// Format OHLC data for UDF
		const result: UDFBar = {
			s: "ok",
			t: [], // time
			o: [], // open
			h: [], // high
			l: [], // low
			c: [], // close
			v: [], // volume
		};

		ohlcData.data.forEach((bar: any) => {
			result.t!.push(Math.floor(bar.time_window_unix_ms / 1000)); // Convert from ms to s
			result.o!.push(Number.parseFloat(bar.open));
			result.h!.push(Number.parseFloat(bar.high));
			result.l!.push(Number.parseFloat(bar.low));
			result.c!.push(Number.parseFloat(bar.close));
			result.v!.push(Number.parseFloat(bar.volume));
		});

		return c.json(result);
	} catch (error) {
		console.error(`Error in history data: ${error}`);
		return c.json({ s: "error", errmsg: "Failed to fetch history data" });
	}
});

// 5. Server time
taoUdf.get("/time", async (c) => {
	try {
		// We don't have a specific TAO time endpoint, so use current time
		return c.text(Math.floor(Date.now() / 1000).toString());
	} catch (error) {
		console.error(`Error in server time: ${error}`);
		return c.text(Math.floor(Date.now() / 1000).toString());
	}
});

export default taoUdf;
