/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    // The admin icon picker lists this folder at runtime, so ship it with that route.
    outputFileTracingIncludes: { '/api/admin/icons': ['./public/images/skills/**'] },
  },
  async redirects() {
    return [
      // The case study moved under /projects so more can be added beside it.
      { source: '/hygieia', destination: '/projects/hygieia', permanent: true },
    ];
  },
};

module.exports = nextConfig;
