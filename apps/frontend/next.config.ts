import type { NextConfig } from "next";

const grafanaOrigin =
  process.env.GRAFANA_BROWSER_ORIGIN ?? "http://localhost:3002";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/grafana", destination: `${grafanaOrigin}/` },
      { source: "/grafana/:path*", destination: `${grafanaOrigin}/:path*` },
    ];
  },
};

export default nextConfig;
