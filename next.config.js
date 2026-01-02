/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone出力モードを有効化（Dockerイメージの最小化）
  output: 'standalone',
  
  // 本番環境でのReactの最適化
  reactStrictMode: true,
  
  // パフォーマンス最適化
  compress: true,
  
  // セキュリティヘッダーの設定
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;