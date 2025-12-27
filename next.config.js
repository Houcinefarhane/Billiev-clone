/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('xlsx')
    }
    return config
  },
  // Configuration expérimentale désactivée pour compatibilité
  // experimental: {
  //   forceSwcTransforms: true,
  // },
}

module.exports = nextConfig

