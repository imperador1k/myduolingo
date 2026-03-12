/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "bjoddfyvixlyrhpyxylr.supabase.co",
            },
        ],
    },
};

export default nextConfig;
