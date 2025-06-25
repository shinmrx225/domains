# 🌟 Galaxy Repository - Deployment Guide

## 🚀 Quick Deployment Steps

### 1. **Upload to Web Server**
Upload all files to your web server's public directory (e.g., `public_html`, `www`, or `htdocs`).

### 2. **Set Permissions**
Ensure these directories are writable by the web server:
```bash
chmod 755 data/
chmod 755 uploads/
chmod 755 uploads/thumbnails/
chmod 644 data/*.json
```

### 3. **Test Your Deployment**
Visit your deployed site:
- Main upload page: `https://yourdomain.com/`
- Galaxy view: `https://yourdomain.com/galaxy.html`

### 4. **Share Feature**
The share functionality will automatically:
- Generate unique shareable links
- Save gallery states to server storage
- Work across different devices and browsers
- Track view counts for shared galleries

## 🌐 Supported Hosting Platforms

### **Free Hosting (Perfect for Testing)**
- **Netlify**: Drag & drop deployment
- **Vercel**: Git-based deployment
- **GitHub Pages**: Static hosting (requires PHP alternatives)
- **000webhost**: Free PHP hosting
- **InfinityFree**: Free PHP & MySQL hosting

### **Paid Hosting (Production Ready)**
- **DigitalOcean**: $5/month droplets
- **SiteGround**: Optimized for PHP
- **Hostinger**: Budget-friendly
- **AWS**: Scalable cloud hosting

## 📁 File Structure
```
/
├── index.html              # Upload page
├── galaxy.html            # Galaxy visualization
├── assets/
│   ├── css/
│   │   ├── upload.css     # Upload page styles
│   │   └── galaxy.css     # Galaxy page styles
│   └── js/
│       ├── upload.js      # Upload functionality
│       └── galaxy.js      # Galaxy visualization
├── api/
│   ├── upload.php         # File upload handler
│   ├── files.php          # File listing API
│   └── share.php          # Share functionality API
├── data/
│   ├── files.json         # File metadata
│   └── shared_galleries.json # Shared galleries
├── uploads/               # Uploaded images
│   └── thumbnails/        # Generated thumbnails
└── .htaccess             # Apache configuration
```

## 🔧 Configuration for Different Domains

### **Update Base URLs**
If deploying to a subdirectory, update these files:

**In `assets/js/upload.js`:**
```javascript
// Change API endpoints if needed
const apiBase = '/your-subdirectory/api/';
```

**In `assets/js/galaxy.js`:**
```javascript
// Update API paths if in subdirectory
const apiBase = '/your-subdirectory/api/';
```

### **Custom Domain Setup**
1. Point your domain to your hosting provider
2. Upload files to the web root
3. Test all functionality
4. The share links will automatically use your custom domain

## 🛡️ Security Considerations

### **File Upload Security**
- File type validation is implemented
- File size limits are enforced
- Uploaded files are stored outside web root when possible

### **Share Gallery Security**
- Gallery IDs are hashed and time-stamped
- No sensitive data in shareable links
- View tracking without personal data collection

## 📱 Mobile Optimization

The galaxy repository is fully responsive and works on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile devices (iOS Safari, Android Chrome)
- Tablets (iPad, Android tablets)

## 🎨 Customization

### **Change Colors/Theme**
Edit `assets/css/galaxy.css` and `assets/css/upload.css`:
```css
:root {
    --primary-color: #your-color;
    --secondary-color: #your-color;
    --accent-color: #your-color;
}
```

### **Modify Text Messages**
Update romantic messages in:
- `index.html` (upload page text)
- `galaxy.html` (galaxy page text)
- `assets/js/galaxy.js` (dynamic messages)

## 🔗 Share Link Examples

**Local Development:**
`http://localhost/bby/galaxy.html?gallery=abc123xyz`

**Production:**
`https://yourdomain.com/galaxy.html?gallery=abc123xyz`

**Subdirectory:**
`https://yourdomain.com/galaxy-app/galaxy.html?gallery=abc123xyz`

## 📊 Analytics (Optional)

Add Google Analytics or similar to track:
- Gallery views
- Share link usage
- Popular upload times

## 🆘 Troubleshooting

### **Images Not Loading**
- Check file permissions on `uploads/` directory
- Verify PHP file upload settings
- Check browser console for errors

### **Share Links Not Working**
- Ensure `data/` directory is writable
- Check if `api/share.php` is accessible
- Verify JSON files are being created

### **Galaxy Not Rendering**
- Ensure Three.js CDN is accessible
- Check browser WebGL support
- Verify all JavaScript files are loading

## 💝 Final Notes

Your Galaxy Repository is now ready to share beautiful memories with loved ones! The romantic, space-themed interface creates a magical experience for viewing uploaded photos as a cosmic love story.

**Enjoy your galaxy! ✨💖**
