import { Hono } from "hono";
import { cache } from "hono/cache";
import { cors } from "hono/cors";
import { TEMPLATES, WIDGETS } from "./constants";
import tao from "./routes/tao";
import taoUdf from "./routes/taoudf";

const app = new Hono().use(cors());

app.get(
	"*",
	cache({
		cacheName: "openbb-app-tao",
		cacheControl: "max-age=3600", // 1 hour
	}),
);

app.get("/", (c) => {
	return c.text("OpenBB Workspace App - tao.app");
});

app.get("/widgets.json", (c) => {
	return c.json(WIDGETS);
});

app.get("/templates.json", (c) => {
	return c.json(TEMPLATES);
});

app.route("/tao", tao); // for other widgets (subnet screener, portfolio, etc)
app.route("/taoudf", taoUdf); // for advanced charting widget (tradingview udf-compatible)

export default app;
