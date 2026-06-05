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
  basePath,
  allowedDevOrigins: ["192.168.24.74"],
  images: {
    remotePatterns: [{ protocol: "http", hostname: "localhost" }],
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
