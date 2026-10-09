import type { NextConfig } from "next";
const sha = (process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 7);
const nextConfig: NextConfig = { serverExternalPackages: ["unpdf"], env: { NEXT_PUBLIC_COMMIT: sha || "local", NEXT_PUBLIC_BUILD_AT: new Date().toISOString() } };
export default nextConfig;
