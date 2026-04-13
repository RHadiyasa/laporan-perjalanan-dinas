/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["formidable"],
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
