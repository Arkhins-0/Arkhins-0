/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // The case study moved under /projects so more can be added beside it.
      { source: '/hygieia', destination: '/projects/hygieia', permanent: true },
    ];
  },
};

module.exports = nextConfig;
