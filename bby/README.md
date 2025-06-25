# 🌌 Galaxy Repository - Cosmic File Visualization

A visually stunning, galaxy-themed file repository that transforms uploaded images into cosmic debris orbiting a central sphere in an immersive 3D visualization.

![Galaxy Repository Demo](https://via.placeholder.com/800x400/0a0a1a/6366f1?text=Galaxy+Repository)

## ✨ Features

### 🚀 Upload Experience
- **Intuitive Interface**: Clean, space-themed upload page with drag & drop
- **Real-time Progress**: Visual upload progress with cosmic animations
- **File Management**: View thumbnails, metadata, and manage uploaded files
- **Responsive Design**: Optimized for desktop and mobile devices

### 🌟 3D Galaxy Visualization
- **Dynamic 3D Scene**: Real-time rendered galaxy using Three.js
- **Cosmic Debris**: Uploaded images become glowing particles orbiting a central sphere
- **Dual View States**:
  - **Close-up**: Images visible as detailed thumbnails
  - **Galaxy View**: Images transform into cosmic particles with spiral arms
- **Auto Zoom-out**: Automatically transitions to galaxy view after 5 seconds of inactivity
- **Interactive Controls**: Click to toggle between zoom states

### 🎨 Visual Effects
- **Constellation Lines**: Procedurally generated animated lines connecting particles
- **Particle Systems**: Dynamic background stars and nebula effects
- **Smooth Animations**: Fluid transitions between all states
- **Hover Effects**: Interactive object highlighting and information display
- **Orbital Motion**: Mathematically accurate spiral galaxy patterns

### 🔧 Customization
- **Zoom Control**: Adjust camera distance in real-time
- **Rotation Speed**: Control orbital velocity
- **Particle Density**: Modify background star field intensity
- **Constellation Toggle**: Show/hide connecting lines
- **Share Links**: Generate unique URLs to share your galaxy

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **3D Graphics**: Three.js with TWEEN.js for animations
- **Backend**: PHP 7.4+ with file upload handling
- **Server**: Apache with XAMPP
- **Features**: 
  - WebGL-accelerated 3D rendering
  - Responsive CSS Grid layouts
  - Progressive Web App capabilities
  - Cross-browser compatibility

## 📦 Installation

### Prerequisites
- XAMPP (Apache + PHP 7.4+)
- Modern web browser with WebGL support
- At least 2GB available disk space

### Quick Setup

1. **Clone or Download** this repository to your XAMPP htdocs directory:
   ```bash
   cd C:\xampp\htdocs
   git clone [repository-url] bby
   ```

2. **Start XAMPP** services:
   - Start Apache
   - Ensure PHP 7.4+ is enabled

3. **Run Setup Script**:
   ```bash
   # Via browser:
   http://localhost/bby/setup.php
   
   # Or via command line:
   cd C:\xampp\htdocs\bby
   php setup.php
   ```

4. **Access Your Galaxy**:
   - Upload Page: `http://localhost/bby/`
   - Galaxy View: `http://localhost/bby/galaxy.html`

## 🎮 Usage Guide

### Uploading Files
1. Navigate to the upload page
2. Drag & drop images or click to select files
3. Supported formats: JPG, PNG, GIF, WebP (max 10MB each)
4. Watch real-time upload progress
5. View uploaded files in the grid below

### Exploring Your Galaxy
1. Visit the Galaxy Repository page
2. **Close-up View**: See your images as detailed thumbnails orbiting the center
3. **Galaxy View**: Click anywhere or wait 5 seconds for auto zoom-out
4. **Interactive Controls**:
   - Use sliders to adjust zoom, speed, and particle density
   - Toggle constellation lines on/off
   - Hover over objects to see file details
   - Reset view to return to defaults

### Sharing Your Galaxy
1. Click the "Share Galaxy" button
2. Copy the generated link
3. Share via social media or email
4. Recipients can view your cosmic collection

## 🎨 Customization

### Visual Themes
Edit `assets/css/galaxy.css` to modify:
- Color schemes (CSS custom properties)
- Particle effects
- Animation timings
- UI component styling

### 3D Parameters
Modify `assets/js/galaxy.js` configuration:
```javascript
this.config = {
    autoZoomTimeout: 5000,     // Auto zoom-out delay
    orbitRadius: { min: 15, max: 35 }, // Orbit distances
    particleCount: 200,        // Background stars
    spiralArms: 4,            // Galaxy spiral arms
    galaxyRadius: 100,        // Galaxy size
    rotationSpeed: 1,         // Default rotation speed
    zoomLevel: 30            // Default camera distance
};
```

### Upload Limits
Adjust in `api/upload.php`:
```php
private $maxFileSize = 10 * 1024 * 1024; // 10MB
private $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
```

## 🚀 Performance Optimization

### For Large Collections (100+ images):
1. **Enable instancing** for particle rendering
2. **Implement LOD** (Level of Detail) for distant objects
3. **Use texture atlasing** for multiple small images
4. **Add progressive loading** for initial page load

### Browser Compatibility:
- **Chrome/Edge**: Full feature support
- **Firefox**: Full feature support
- **Safari**: WebGL required (iOS 13+)
- **Mobile**: Touch gestures supported

## 🔧 Development

### File Structure
```
bby/
├── index.html              # Upload page
├── galaxy.html            # 3D visualization
├── setup.php             # Installation script
├── .htaccess            # Apache configuration
├── assets/
│   ├── css/
│   │   ├── upload.css   # Upload page styles
│   │   └── galaxy.css   # Galaxy visualization styles
│   └── js/
│       ├── upload.js    # Upload functionality
│       └── galaxy.js    # 3D galaxy engine
├── api/
│   ├── upload.php      # File upload handler
│   └── files.php       # File management API
├── uploads/            # User uploaded files
├── data/              # JSON data storage
└── .github/
    └── copilot-instructions.md # Development guidelines
```

### API Endpoints

#### Upload File
```http
POST /api/upload.php
Content-Type: multipart/form-data

FormData: file (image file)
```

#### Get Files
```http
GET /api/files.php
Response: {
  "success": true,
  "files": [...],
  "total": number
}
```

#### Get Single File
```http
GET /api/files.php?id=file_id
Response: {
  "success": true,
  "file": {...}
}
```

## 🐛 Troubleshooting

### Common Issues

**Upload not working:**
- Check PHP file upload settings in `php.ini`
- Ensure `uploads/` directory has write permissions
- Verify file size limits

**3D visualization not loading:**
- Ensure WebGL is enabled in browser
- Check browser console for JavaScript errors
- Verify Three.js CDN is accessible

**Slow performance:**
- Reduce particle count in settings
- Enable hardware acceleration in browser
- Close other WebGL applications

**Files not displaying:**
- Check `data/files.json` permissions
- Verify uploaded files exist in `uploads/` directory
- Clear browser cache

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly across browsers
5. Submit a pull request

### Development Guidelines
- Follow the coding style in existing files
- Test 3D performance on various devices
- Ensure responsive design works on mobile
- Add comments for complex 3D calculations
- Optimize for both visual quality and performance

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🌟 Credits

- **Three.js**: 3D graphics library
- **TWEEN.js**: Animation library
- **Orbitron & Exo 2 Fonts**: Google Fonts
- **Inspiration**: The beauty of the cosmos and the desire to make file management magical

---

**Transform your digital memories into a living, breathing galaxy of cosmic beauty!** ✨🌌
