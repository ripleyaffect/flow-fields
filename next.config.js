const transpilePackages = []

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',

  basePath: '/flow-fields',

  images: {
    unoptimized: true,
  },

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
