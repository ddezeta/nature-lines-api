import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  mapboxAccessToken: requireEnv("MAPBOX_ACCESS_TOKEN"),
  port: Number(process.env.PORT ?? 4000),
};
