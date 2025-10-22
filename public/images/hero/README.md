# Hero Images

## Current Images

### collaboration.jpg
- **Size**: Optimized for web (~1200px wide)
- **Format**: JPEG (consider converting to WebP for better compression)
- **Usage**: Main hero banner for homepage
- **Description**: Professional team collaboration scene

## Optimization Recommendations

### Format Conversion
Convert JPEG to WebP for better compression:
```bash
# Using cwebp (if available)
cwebp -q 80 collaboration.jpg -o collaboration.webp

# Or use online tools like:
# - squoosh.app
# - tinypng.com
# - cloudconvert.com
```

### Multiple Formats
Provide fallback formats for better browser support:
- WebP (modern browsers, smaller file size)
- JPEG (fallback for older browsers)

### Responsive Images
Consider multiple sizes for different screen sizes:
- `collaboration-mobile.webp` (768px width)
- `collaboration-tablet.webp` (1024px width) 
- `collaboration-desktop.webp` (1200px+ width)

## Next.js Image Usage

Use Next.js `<Image />` component for automatic optimization:

```tsx
import Image from 'next/image'

<Image
  src="/images/hero/collaboration.jpg"
  alt="Professional team collaboration"
  width={1200}
  height={600}
  priority={true}
  className="w-full h-full object-cover"
/>
```

Benefits:
- Automatic WebP conversion
- Lazy loading (except when `priority={true}`)
- Responsive srcSet generation
- Better performance metrics