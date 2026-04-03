import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {},
  webpack(config) {
    if (config.resolve?.alias) {
      config.resolve.alias['@'] = path.resolve(__dirname, 'src');
      config.resolve.alias['@/lib'] = path.resolve(__dirname, 'src/lib');
    }
    return config;
  },
};

export default nextConfig;
