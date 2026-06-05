import type { NextConfig } from "next";

function normalizeBasePath(basePath: string | undefined): string {
  if (!basePath || basePath === "/") {
    return "";
  }

  const withLeadingSlash = basePath.startsWith("/") ? basePath : `/${basePath}`;

  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["192.168.1.37", "192.168.24.18"],
  basePath,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_API_URL ?? "http://localhost:4000"}/:path*`,
      },
    ];
  },
  async redirects() {
    if (!basePath) {
      return [];
    }

    return [
      {
        source: "/",
        destination: basePath,
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
