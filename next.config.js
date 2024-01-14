const transpilePackages = []

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages,
  webpack (config, { isServer }, options) {

    config.module.rules.push({
      test: /\.glsl$/,
      use: {
        loader: 'webpack-glsl-loader',
      },
    })

    return config;
  },
}

module.exports = nextConfig
