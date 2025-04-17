export const TEMPLATES = [
	{
		name: "TAO App",
		img: "https://www.bity.com.br/blog/wp-content/uploads/2024/08/bittensor.jpg",
		img_dark: "",
		img_light: "",
		description: "Uses tao.app endpoints with Bittensor onchain analytics",
		allowCustomization: true,
		tabs: {
			explorer: {
				id: "explorer",
				name: "Explorer",
				layout: [
					{
						i: "tao_tao_info",
						x: 0,
						y: 2,
						w: 20,
						h: 10,
					},
					{
						i: "taoudf_",
						x: 0,
						y: 20,
						w: 40,
						h: 11,
					},
					{
						i: "tao_subnet_screener",
						x: 0,
						y: 12,
						w: 40,
						h: 8,
						state: {
							chartView: {
								enabled: false,
								chartType: "line",
							},
							columnState: {
								default_undefined: {
									columnVisibility: {
										hiddenColIds: [
											"buy_volume_tao_1d",
											"total_volume_pct_change",
											"root_prop",
											"alpha_prop",
										],
									},
								},
							},
						},
					},
					{
						i: "tao_subnet_info",
						x: 20,
						y: 2,
						w: 20,
						h: 10,
					},
				],
			},
			portfolio: {
				id: "portfolio",
				name: "Portfolio",
				layout: [
					{
						i: "tao_portfolio_allocation",
						x: 0,
						y: 2,
						w: 20,
						h: 15,
						state: {
							params: {
								coldkey: "5CcH9xVPJY2Nc9Wovft6Lr2qoQzefEEJfqgVhSrXdAx2ixGr",
							},
							chartView: {
								enabled: false,
								chartType: "line",
							},
						},
					},
					{
						i: "tao_portfolio_balance",
						x: 20,
						y: 2,
						w: 20,
						h: 15,
						state: {
							params: {
								coldkey: "5DyV8a62E2t2C4FoSqjihdV5USVXPEZYvZtUjXxZq1Mnvwwg",
							},
							chartView: {
								enabled: true,
								chartType: "line",
							},
						},
					},
					{
						i: "tao_portfolio_transactions",
						x: 0,
						y: 17,
						w: 40,
						h: 11,
						state: {
							params: {
								coldkey: "5CcH9xVPJY2Nc9Wovft6Lr2qoQzefEEJfqgVhSrXdAx2ixGr",
								start: "2025-04-01",
								end: "2025-04-17",
							},
							chartView: {
								enabled: false,
								chartType: "line",
							},
						},
					},
				],
			},
		},
		groups: [
			{
				name: "Group 1",
				type: "param",
				paramName: "coldkey",
				defaultValue: "5CcH9xVPJY2Nc9Wovft6Lr2qoQzefEEJfqgVhSrXdAx2ixGr",
				widgetIds: [
					"tao_portfolio_allocation",
					"tao_portfolio_balance",
					"tao_portfolio_transactions",
				],
			},
		],
	},
];

export const WIDGETS = {
	tao_subnet_screener: {
		name: "TAO Subnet Screener",
		description: "Overview of all TAO subnets with key metrics",
		endpoint: "/tao/subnet_screener",
		gridData: { w: 40, h: 8 },
		source: "tao",
		params: [
			{
				paramName: "currency",
				description: "Currency to display prices in",
				type: "text",
				value: "USD",
				options: [
					{ label: "TAO", value: "TAO" },
					{ label: "USD", value: "USD" },
				],
			},
		],
		data: {
			table: {
				columnsDefs: [
					{
						field: "netuid",
						headerName: "Subnet",
						cellDataType: "number",
						width: 60,
					},
					{
						field: "price",
						headerName: "Price",
						cellDataType: "number",
						formatterFn: "normalized",
						width: 100,
					},
					{
						field: "price_1h_pct_change",
						headerName: "1H%",
						cellDataType: "number",
						formatterFn: "percent",
						renderFn: "greenRed",
						width: 100,
					},
					{
						field: "price_1d_pct_change",
						headerName: "1D%",
						cellDataType: "number",
						formatterFn: "percent",
						renderFn: "greenRed",
						width: 100,
					},
					{
						field: "price_7d_pct_change",
						headerName: "7D%",
						cellDataType: "number",
						formatterFn: "percent",
						renderFn: "greenRed",
						width: 100,
					},
					{
						field: "market_cap_tao",
						headerName: "M.Cap.",
						cellDataType: "number",
						formatterFn: "int",
						width: 120,
					},
					{
						field: "fdv_tao",
						headerName: "FDV",
						cellDataType: "number",
						formatterFn: "int",
						width: 100,
					},
					{
						field: "emission_pct",
						headerName: "Emission %",
						cellDataType: "number",
						formatterFn: "percent",
						width: 120,
					},
					{
						field: "buy_volume_tao_1d",
						headerName: "TAO Liq.",
						cellDataType: "number",
						formatterFn: "int",
						width: 120,
						hide: true,
					},
					{
						field: "total_volume_tao_1d",
						headerName: "Total Vol 1D",
						cellDataType: "number",
						formatterFn: "int",
						width: 140,
					},
					{
						field: "total_volume_pct_change",
						headerName: "Total Vol 1D%",
						cellDataType: "number",
						formatterFn: "percent",
						renderFn: "greenRed",
						width: 150,
						hide: true,
					},
					{
						field: "root_prop",
						headerName: "Root Prop",
						cellDataType: "number",
						formatterFn: "percent",
						width: 120,
						hide: true,
					},
					{
						field: "alpha_prop",
						headerName: "Alpha Prop",
						cellDataType: "number",
						formatterFn: "percent",
						width: 120,
						hide: true,
					},
				],
			},
		},
	},
	tao_subnet_info: {
		name: "TAO Subnet Info",
		description: "Detailed information about a TAO subnet",
		endpoint: "/tao/subnet_info",
		gridData: { w: 20, h: 6 },
		source: "tao",
		type: "markdown",
		params: [
			{
				paramName: "netuid",
				type: "endpoint",
				optionsEndpoint: "/tao/subnets_symbols",
				value: 1,
				label: "Subnet UID",
			},
		],
	},
	tao_tao_info: {
		name: "TAO Info",
		description: "Detailed information about TAO",
		endpoint: "/tao/tao_info",
		gridData: { w: 20, h: 6 },
		source: "tao",
		type: "markdown",
	},
	tao_portfolio_transactions: {
		name: "TAO Portfolio Transactions",
		description: "View historical transactions for a TAO portfolio",
		endpoint: "/tao/portfolio_transactions",
		gridData: { w: 40, h: 11 },
		source: "tao",
		params: [
			{
				paramName: "coldkey",
				description: "Portfolio Coldkey",
				type: "text",
				value: "",
				label: "Coldkey",
			},
			{
				paramName: "start",
				description: "Start date (YYYY-MM-DDTHH:mm:ss)",
				type: "date",
				value: "",
				label: "Start Date",
			},
			{
				paramName: "end",
				description: "End date (YYYY-MM-DDTHH:mm:ss)",
				type: "date",
				value: "",
				label: "End Date",
			},
		],
		data: {
			table: {
				columnsDefs: [
					{ field: "timestamp", headerName: "Timestamp", cellDataType: "text" },
					{ field: "netuid", headerName: "Subnet", chartDataType: "category" },
					{ field: "price", headerName: "Price", cellDataType: "number" },
					{ field: "event_id", headerName: "Event ID", cellDataType: "text" },
					{ field: "coldkey", headerName: "Coldkey", cellDataType: "text" },
					{ field: "hotkey", headerName: "Hotkey", cellDataType: "text" },
					{
						field: "amount_in",
						headerName: "Amount In",
						cellDataType: "number",
					},
					{
						field: "amount_out",
						headerName: "Amount Out",
						cellDataType: "number",
					},
					{
						field: "extrinsics",
						headerName: "Extrinsics",
						cellDataType: "text",
					},
				],
			},
		},
	},
	tao_portfolio_balance: {
		name: "TAO Portfolio Balance",
		description: "View historical balance for a TAO portfolio",
		endpoint: "/tao/portfolio_balance",
		gridData: { w: 20, h: 15 },
		source: "tao",
		params: [
			{
				paramName: "coldkey",
				description: "Portfolio Coldkey",
				type: "text",
				value: "",
				label: "Coldkey",
			},
		],
		data: {
			table: {
				columnsDefs: [
					{ field: "timestamp", headerName: "Timestamp", cellDataType: "text" },
					{
						field: "total_balance",
						headerName: "Portfolio Value",
						cellDataType: "number",
					},
				],
			},
		},
	},
	tao_portfolio_allocation: {
		name: "TAO Portfolio Allocation",
		description:
			"View current stake allocation for a TAO portfolio, aggregated by subnet",
		endpoint: "/tao/portfolio_allocation",
		gridData: { w: 20, h: 15 },
		source: "tao",
		params: [
			{
				paramName: "coldkey",
				description: "Portfolio Coldkey",
				type: "text",
				value: "",
				label: "Coldkey",
			},
		],
		data: {
			table: {
				columnsDefs: [
					{ field: "netuid", headerName: "Subnet", chartDataType: "category" },
					{
						field: "tao_staked",
						headerName: "Total TAO",
						cellDataType: "number",
					},
				],
			},
		},
	},
	taoudf_: {
		name: "Charting - TAO Subnets",
		description:
			"Charting for TAO Subnets, historical price data for any subnet",
		type: "advanced_charting",
		endpoint: "/taoudf",
		data: { defaultSymbol: "64" },
		source: "taoudf",
	},
};
