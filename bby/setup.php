<?php
/**
 * Galaxy Repository Setup Script
 * Run this file once to set up the initial environment
 */

class GalaxySetup {
    private $directories = [
        'uploads',
        'uploads/thumbnails',
        'data',
        'api',
        'assets',
        'assets/css',
        'assets/js'
    ];

    public function __construct() {
        $this->setupDirectories();
        $this->setupDataFile();
        $this->createSampleData();
        $this->displaySuccess();
    }

    private function setupDirectories() {
        foreach ($this->directories as $dir) {
            if (!file_exists($dir)) {
                mkdir($dir, 0755, true);
                echo "Created directory: $dir\n";
            }
        }
    }

    private function setupDataFile() {
        $dataFile = 'data/files.json';
        if (!file_exists($dataFile)) {
            file_put_contents($dataFile, json_encode([], JSON_PRETTY_PRINT));
            echo "Created data file: $dataFile\n";
        }
    }

    private function createSampleData() {
        // Create some sample cosmic objects for demonstration
        $sampleData = [
            [
                'id' => 'sample_1',
                'name' => 'Nebula_001.jpg',
                'filename' => 'sample_nebula.jpg',
                'path' => 'assets/images/sample_nebula.jpg',
                'thumbnail' => 'assets/images/sample_nebula_thumb.jpg',
                'size' => 245760,
                'type' => 'image/jpeg',
                'upload_date' => date('Y-m-d H:i:s', strtotime('-3 days')),
                'dimensions' => ['width' => 800, 'height' => 600]
            ],
            [
                'id' => 'sample_2',
                'name' => 'Galaxy_Spiral.png',
                'filename' => 'sample_galaxy.png',
                'path' => 'assets/images/sample_galaxy.png',
                'thumbnail' => 'assets/images/sample_galaxy_thumb.png',
                'size' => 512000,
                'type' => 'image/png',
                'upload_date' => date('Y-m-d H:i:s', strtotime('-1 day')),
                'dimensions' => ['width' => 1024, 'height' => 768]
            ],
            [
                'id' => 'sample_3',
                'name' => 'Cosmic_Dust.webp',
                'filename' => 'sample_dust.webp',
                'path' => 'assets/images/sample_dust.webp',
                'thumbnail' => 'assets/images/sample_dust_thumb.webp',
                'size' => 128000,
                'type' => 'image/webp',
                'upload_date' => date('Y-m-d H:i:s', strtotime('-5 hours')),
                'dimensions' => ['width' => 640, 'height' => 480]
            ]
        ];

        $dataFile = 'data/files.json';
        $existingData = json_decode(file_get_contents($dataFile), true);
        
        if (empty($existingData)) {
            file_put_contents($dataFile, json_encode($sampleData, JSON_PRETTY_PRINT));
            echo "Created sample cosmic objects for demonstration\n";
        }
    }

    private function displaySuccess() {
        echo "\n" . str_repeat("=", 50) . "\n";
        echo "🌌 GALAXY REPOSITORY SETUP COMPLETE! 🌌\n";
        echo str_repeat("=", 50) . "\n\n";
        echo "Your cosmic repository is ready to explore!\n\n";
        echo "📁 Upload Page: http://localhost/bby/\n";
        echo "🌟 Galaxy View: http://localhost/bby/galaxy.html\n\n";
        echo "Features Ready:\n";
        echo "✅ File upload with drag & drop\n";
        echo "✅ 3D galaxy visualization\n";
        echo "✅ Particle-based cosmic debris\n";
        echo "✅ Zoom transitions (close-up ↔ galaxy view)\n";
        echo "✅ Auto zoom-out on inactivity\n";
        echo "✅ Constellation line overlays\n";
        echo "✅ Interactive orbital motion\n";
        echo "✅ Shareable galaxy links\n";
        echo "✅ Mobile responsive design\n";
        echo "✅ Real-time hover effects\n\n";
        echo "🎯 Click anywhere on galaxy view to toggle zoom states\n";
        echo "⏱️  Galaxy auto-zooms out after 5 seconds of inactivity\n";
        echo "🎨 Use control panels to customize your cosmic experience\n\n";
        echo "Ready to upload your memories and watch them become\n";
        echo "beautiful cosmic debris orbiting in your personal galaxy!\n";
        echo str_repeat("=", 50) . "\n";
    }
}

// Check if running from command line or web
if (php_sapi_name() === 'cli') {
    new GalaxySetup();
} else {
    echo "<pre>";
    new GalaxySetup();
    echo "</pre>";
}
?>
