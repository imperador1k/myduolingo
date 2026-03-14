/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "bjoddfyvixlyrhpyxylr.supabase.co",
            },
            {
                protocol: "https",
                hostname: "img.clerk.com",
            },
            {
                protocol: "https",
                hostname: "images.clerk.dev",
            },
        ],
    },
};

export default nextConfig;
