/**
 * Optimizes image URLs for performance.
 * Supports: Unsplash, Supabase Storage (if transformation is enabled)
 */
export const getOptimizedImageUrl = (url: string, width = 800, quality = 80): string => {
    if (!url) return '';

    // Unsplash Optimization
    if (url.includes('images.unsplash.com')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}w=${width}&q=${quality}&auto=format`;
    }

    // Supabase Storage Optimization (Requires Transform Feature enabled on project)
    // Example pattern: /storage/v1/object/public/bucket/image.jpg
    // Transform pattern: /storage/v1/render/image/public/bucket/image.jpg?width=500...
    // For now, we return original as we can't guarantee transforms are enabled on this plan

    return url;
};
