import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'http://streamline-api-env.eba-pagqw7xn.eu-west-3.elasticbeanstalk.com/api/:path*',
      },
    ];
  },
}

export default nextConfig
