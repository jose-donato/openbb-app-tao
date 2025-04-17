import { Hono } from "hono";
import { taoApiCall } from "../utils";

export type Bindings = {
	TAO_API_KEY: string;
};
const tao = new Hono<{ Bindings: Bindings }>();

tao.get("/subnets_symbols", async (c) => {
	const data = await taoApiCall(c.env.TAO_API_KEY, "/api/beta/subnet_screener");
	return c.json(
		data.map((item) => ({
			label: `SN${item.netuid} ${item.subnet_name}`,
			value: item.netuid.toString(),
		})),
	);
});

tao.get("/subnet_screener", async (c) => {
	try {
		const { currency } = c.req.query();

		const data = await taoApiCall(
			c.env.TAO_API_KEY,
			"/api/beta/subnet_screener",
		);

		const priceData = await taoApiCall(c.env.TAO_API_KEY, "/api/beta/current");
		const taoPrice = priceData.price;

		if (currency === "TAO") {
			return c.json(data);
		}
		const convertedData = data.map((item) => ({
			...item,
			price: item.price * taoPrice,
			market_cap_tao: item.market_cap_tao * taoPrice,
			fdv_tao: item.fdv_tao * taoPrice,
			netuid: `SN${item.netuid} ${item.subnet_name}`,
		}));
		return c.json(convertedData);
	} catch (error) {
		return c.json({ error: error.message }, 500);
	}
});

tao.get("/subnet_info", async (c) => {
	try {
		const { netuid } = c.req.query();

		const data = await taoApiCall(
			c.env.TAO_API_KEY,
			`/api/beta/analytics/subnets/info/${netuid}`,
		);
		return c.text(`# Bittensor Subnet ${netuid}

## Overview
- **Price:** ${data.price} TAO
- **TAO In:** ${data.tao_in}
- **TAO Out:** ${data.tao_out}
- **Alpha In:** ${data.alpha_in}
- **Alpha Out:** ${data.alpha_out}

- **Owner:** ${data.owner_hotkey}
- **Name:** ${data.subnet_name}

## Links
- **GitHub:** [${data.github_repo}](${data.github_repo})
- **Discord:** [${data.discord}](${data.discord})
- **Website:** [${data.subnet_website}](${data.subnet_website})
`);
	} catch (error) {
		return c.json({ error: error.message }, 500);
	}
});

tao.get("/tao_info", async (c) => {
	const data = await taoApiCall(c.env.TAO_API_KEY, "/api/beta/current");
	return c.text(`## Overview
- **Price:** $${data.price.toFixed(2)} USD
- **Market Cap:** $${(data.market_cap / 1000000).toFixed(2)}M USD
- **24h Change:** ${data.percent_change_24h.toFixed(2)}%
- **24h Volume:** $${(data.volume_24h / 1000000).toFixed(2)}M USD
- **Volume Change 24h:** ${data.volume_change_24h.toFixed(2)}%

## Supply
- **Circulating Supply:** ${data.circulating_supply.toLocaleString()} TAO
- **Total Supply:** ${data.total_supply.toLocaleString()} TAO
- **Max Supply:** ${data.max_supply.toLocaleString()} TAO

## Additional Info
- **Fully Diluted Valuation:** $${(data.fdv / 1000000000).toFixed(2)}B USD
- **Latest Block:** ${data.max_block_number.toLocaleString()}
- **Last Updated:** ${new Date(data.timestamp).toLocaleString()}
`);
});

// Route handler for Portfolio Transactions
tao.get("/portfolio_transactions", async (c) => {
	try {
		const { coldkey, start, end, page = 1, page_size = 100 } = c.req.query();

		console.log(start, end);
		if (!coldkey) {
			return c.json({ error: "Coldkey parameter is required" }, 400);
		}
		const params = {
			coldkey,
			page: page.toString(),
			page_size: page_size.toString(),
			...(start && { start: new Date(start).getTime() }),
			...(end && { end: new Date(end).getTime() }),
		};
		const response = await taoApiCall(
			c.env.TAO_API_KEY,
			"/api/beta/portfolio/transactions",
			params,
		);
		// The API returns pagination info alongside data, extract only the data array
		const data = response.data || [];

		// Format netuid
		const result = data.map((item) => ({
			...item,
			netuid: `SN${item.netuid}`,
		}));

		return c.json(result);
	} catch (error) {
		return c.json({ error: error.message }, 500);
	}
});

tao.get("/portfolio_balance", async (c) => {
	try {
		const { coldkey } = c.req.query();
		if (!coldkey) {
			return c.json({ error: "Coldkey parameter is required" }, 400);
		}

		const params = { coldkey: coldkey.toString() };
		const data = await taoApiCall(
			c.env.TAO_API_KEY,
			"/api/beta/portfolio/balance",
			params,
		);

		// Filter out zero values
		const filteredData = data.filter(
			(item: { dtao_value: number }) => item.dtao_value !== 0,
		);

		// let's group by timestamp and ignore the subnet uid
		const groupedData = filteredData.reduce((acc, item) => {
			const timestamp = item.timestamp;
			if (!acc[timestamp]) {
				acc[timestamp] = { timestamp, total_balance: 0 };
			}
			acc[timestamp].total_balance += item.dtao_value;
			return acc;
		}, {});

		// Convert grouped data back to array format
		const result = Object.values(groupedData);

		return c.json(result);
	} catch (error) {
		return c.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			500,
		);
	}
});

// Route handler for Portfolio Allocation
tao.get("/portfolio_allocation", async (c) => {
	try {
		const { coldkey } = c.req.query();
		if (!coldkey) {
			return c.json({ error: "Coldkey parameter is required" }, 400);
		}
		const params = { coldkey };
		const data: {
			coldkey: string;
			hotkey: string;
			netuid: number;
			stake: number;
			tao_staked: number;
		}[] = await taoApiCall(
			c.env.TAO_API_KEY,
			"/api/beta/portfolio/allocation",
			params,
		);

		const subnets = await taoApiCall(
			c.env.TAO_API_KEY,
			"/api/beta/subnet_screener",
		);
		const subnetsMap = new Map(subnets.map((item) => [item.netuid, item]));

		// Aggregate data by netuid
		const aggregatedData: Record<
			number,
			{ netuid: number; stake: number; tao_staked: number }
		> = {};

		for (const item of data) {
			const { netuid, stake, tao_staked } = item;
			if (!aggregatedData[netuid]) {
				aggregatedData[netuid] = { netuid, stake: 0, tao_staked: 0 };
			}
			aggregatedData[netuid].stake += stake;
			aggregatedData[netuid].tao_staked += tao_staked;
		}

		// Convert aggregated object back to an array and format netuid
		const result = Object.values(aggregatedData).map((item) => ({
			...item,
			netuid: `SN${item.netuid} ${subnetsMap.get(item.netuid)?.subnet_name ?? "Root"}`,
		}));

		return c.json(result);
	} catch (error) {
		return c.json({ error: error.message }, 500);
	}
});

export default tao;
