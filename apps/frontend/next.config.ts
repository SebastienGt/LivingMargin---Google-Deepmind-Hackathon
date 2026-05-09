import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Load the repo-root .env so vars defined there are visible to next.config.ts
// and the dev/prod runtime. Next still reads `apps/frontend/.env` after this.
loadEnvConfig(path.resolve(__dirname, "../.."));

const nextConfig: NextConfig = {};

export default nextConfig;
