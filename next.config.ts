import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "/*": ["./public/uploads/**/*"],
    "/api/*": ["./public/uploads/**/*"],
  },
};

export default withNextIntl(nextConfig);
