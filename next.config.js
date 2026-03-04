/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude proxy.js from Next.js processing
  serverExternalPackages: ['@prisma/client'],
}

module.exports = nextConfig
