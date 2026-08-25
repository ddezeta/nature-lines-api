import path from "node:path";
import express, { type Request, type Response, type NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { isHttpError } from "./errors";
import { RegisterRoutes } from "./routes";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

RegisterRoutes(app);

app.get("/swagger.json", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/swagger.json"));
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(undefined, {
  swaggerOptions: { url: "/swagger.json" },
}));

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status = isHttpError(err) ? err.status : 500;
  const message = err instanceof Error ? err.message : "Internal Server Error";
  res.status(status).json({ message });
});

app.listen(env.port, () => {
  console.log(`nature-lines-api listening on port ${env.port}`);
});
