import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/**/*": ["./src/generated/prisma/**/*"],
    "/mon-espace/**/*": ["./src/generated/prisma/**/*"],
    "/admin/**/*": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;