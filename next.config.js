/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['@andresaya/edge-tts', 'ws'],
    },
};

module.exports = nextConfig;
