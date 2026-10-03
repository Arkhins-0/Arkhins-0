import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      { source: "/hygieia", destination: "/projects/hygieia", permanent: true },
      // The first post was renamed once it became about the other portfolio.
      { source: "/blog/hello-world", destination: "/blog/two-portfolios", permanent: true },
    ]
  },
}

export default nextConfig
