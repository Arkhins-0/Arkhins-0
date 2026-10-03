import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [{ source: "/hygieia", destination: "/projects/hygieia", permanent: true }]
  },
}

export default nextConfig
