<?php
// Galaxy Repository Configuration
// Edit these settings to customize your deployment

return [
    // Site Configuration
    'site_name' => '💖 Our Galaxy of Love 💖',
    'site_description' => 'A romantic, cosmic visualization of our precious memories',
    
    // Upload Settings
    'max_file_size' => 10 * 1024 * 1024, // 10MB per file
    'allowed_extensions' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    'max_files_per_upload' => 10,
    'thumbnail_size' => 300, // pixels
    'thumbnail_quality' => 85, // JPEG quality (1-100)
    
    // Gallery Settings
    'max_shared_galleries' => 100, // Keep last 100 shared galleries
    'gallery_expiry_days' => 365, // Days before shared galleries expire
    'default_galaxy_title' => '💖 Our Galaxy of Love 💖',
    
    // 3D Visualization Settings
    'particle_count' => 300,
    'orbit_radius_min' => 25,
    'orbit_radius_max' => 45,
    'spiral_arms' => 4,
    'galaxy_radius' => 100,
    'rotation_speed' => 0.3,
    'zoom_level' => 65,
    'auto_zoom_timeout' => 1500, // milliseconds
    
    // Romantic Messages
    'upload_title' => '💖 Add to Our Universe 💖',
    'upload_subtitle' => 'Upload your precious memories to create our cosmic love story',
    'upload_message' => '💫 Drop your memories here or click to choose 💫',
    'upload_description' => 'Each photo becomes a star in our galaxy of love',
    
    'loading_messages' => [
        'Preparing your surprise',
        'Loading Memories of us...',
        'Creating our cosmic love story...',
        'Assembling stars of our journey...'
    ],
    
    'galaxy_welcome' => [
        'title' => '✨ Welcome to Our Galaxy ✨',
        'message' => 'Every memory orbits around our love...'
    ],
    
    'shared_galaxy_welcome' => [
        'title' => '💕 Welcome to a Special Galaxy 💕',
        'message' => 'Someone has shared their precious memories with you...'
    ],
    
    // Social Sharing
    'social_share_title' => '💖 Check out our Galaxy of Love! 💖',
    'social_share_description' => 'Every memory orbits around our love in this cosmic visualization ✨',
    
    // Development Settings
    'debug_mode' => false, // Set to true for development
    'enable_error_logging' => true,
    'log_file' => 'data/error.log',
    
    // Security Settings
    'enable_file_validation' => true,
    'enable_image_processing' => true,
    'sanitize_filenames' => true,
    'max_filename_length' => 100,
    
    // Performance Settings
    'enable_caching' => true,
    'cache_expiry' => 3600, // 1 hour
    'optimize_images' => true,
    'enable_compression' => true,
];
?>
