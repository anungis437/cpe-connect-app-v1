# CPE Connect - Hero Images Guide

## 🎨 Current Implementation

The hero section now includes a professional learning image from Unsplash. The current setup uses:

### **Active Hero Image:**
- **Source**: Unsplash (Professional team collaboration)
- **URL**: `https://images.unsplash.com/photo-1522202176988-66273c2fd55f`
- **Alt Text**: Professional team collaborating and learning
- **Dimensions**: Responsive (400px mobile, 500px desktop height)

## 📁 Image Directory Structure

```
public/
  images/
    hero/          # Hero banner images
    courses/       # Course category images  
    features/      # Feature section images
    testimonials/  # User testimonials
    logos/         # Partner/certification logos
```

## 🖼️ Recommended Hero Images

### **For Learning Platform Theme:**

1. **Professional Collaboration** (Current)
   - Team meetings, workshops, brainstorming
   - Diverse professionals working together

2. **Individual Learning**
   - Person using laptop/tablet for online learning
   - Library/study environment setings

3. **Technology Focus**
   - Modern workspace with multiple screens
   - Digital learning tools and interfaces

4. **Certification Success**
   - Graduation ceremonies, certificate presentations
   - Professional achievement moments

## 🎯 Image Requirements

### **Technical Specs:**
- **Format**: WebP (preferred), JPEG, PNG
- **Dimensions**: 1920x1080px (16:9 ratio)
- **File Size**: < 500KB (optimized)
- **Quality**: High resolution for retina displays

### **Content Guidelines:**
- **Professional**: Business/educational context
- **Diverse**: Inclusive representation
- **Engaging**: Positive, aspirational mood
- **Clear**: Good contrast for text overlay

## 🔗 Free Image Sources

### **Recommended Platforms:**

1. **Unsplash** - `https://unsplash.com`
   - Search: "professional learning", "team collaboration", "online education"
   - High quality, completely free
   - Direct CDN integration available

2. **Pexels** - `https://pexels.com`  
   - Search: "business training", "professional development"
   - Free for commercial use
   - Good variety of business photos

3. **Pixabay** - `https://pixabay.com`
   - Search: "education", "professional", "learning"
   - Vector graphics also available
   - Multiple format options

## 📝 Implementation Options

### **Option 1: CDN Images (Current)**
```jsx
<img 
  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1471&q=80"
  alt="Professional team collaborating"
  className="w-full h-[400px] lg:h-[500px] object-cover"
/>
```

### **Option 2: Local Images**
```jsx
<img 
  src="/images/hero/professional-learning.webp"
  alt="Professional team collaborating"
  className="w-full h-[400px] lg:h-[500px] object-cover"
/>
```

### **Option 3: Next.js Image Optimization**
```jsx
import Image from 'next/image'

<Image
  src="/images/hero/professional-learning.webp"
  alt="Professional team collaborating"
  width={1471}
  height={500}
  className="w-full h-[400px] lg:h-[500px] object-cover"
  priority
/>
```

## 🚀 Quick Setup Instructions

### **To Add Local Hero Images:**

1. **Download Images**: Choose from recommended sources
2. **Optimize**: Use tools like TinyPNG or ImageOptim  
3. **Place Files**: Save to `/public/images/hero/`
4. **Update Components**: Replace CDN URLs with local paths
5. **Test**: Verify images load correctly in both themes

### **Suggested File Names:**
- `hero-main.webp` - Primary hero image
- `hero-learning.webp` - Learning focused variant
- `hero-collaboration.webp` - Team collaboration variant
- `hero-technology.webp` - Technology focused variant

## 🎨 Design Enhancement Ideas

### **Advanced Features:**
- **Image Carousel**: Multiple hero images with rotation
- **Dynamic Images**: Different images based on course categories
- **Parallax Effect**: Subtle scroll-based animation
- **Video Background**: Hero video instead of static image
- **Dark Mode Variants**: Different images for light/dark themes

## 📱 Mobile Considerations

- **Responsive Design**: Hero adapts to screen sizes
- **Touch Optimization**: Ensure CTAs remain accessible
- **Performance**: Implement lazy loading for mobile
- **Bandwidth**: Provide smaller images for mobile devices

The current implementation provides a solid foundation with professional imagery that enhances the learning platform's credibility and appeal.