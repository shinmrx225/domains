<?php
// Reset and clean the galaxy repository

echo "<h1>Galaxy Repository Reset</h1>";

// Paths
$projectRoot = dirname(__DIR__);
$uploadsDir = $projectRoot . '/uploads/';
$thumbsDir = $projectRoot . '/uploads/thumbnails/';
$dataFile = $projectRoot . '/data/files.json';

echo "<h2>Current State</h2>";

// Check files.json
if (file_exists($dataFile)) {
    $files = json_decode(file_get_contents($dataFile), true) ?: [];
    echo "<p>Files in database: " . count($files) . "</p>";
    if (count($files) > 0) {
        echo "<details><summary>Show file list</summary><pre>";
        foreach ($files as $i => $file) {
            echo ($i + 1) . ". " . $file['name'] . " (" . $file['filename'] . ")\n";
            echo "   Path: " . $file['path'] . "\n";
            echo "   Exists: " . (file_exists($projectRoot . '/' . $file['path']) ? 'YES' : 'NO') . "\n\n";
        }
        echo "</pre></details>";
    }
} else {
    echo "<p>Files database doesn't exist</p>";
}

// Check upload directories
echo "<p>Uploads directory: " . (is_dir($uploadsDir) ? 'EXISTS' : 'MISSING') . "</p>";
if (is_dir($uploadsDir)) {
    $uploadFiles = glob($uploadsDir . '*');
    echo "<p>Files in uploads: " . count($uploadFiles) . "</p>";
}

echo "<p>Thumbnails directory: " . (is_dir($thumbsDir) ? 'EXISTS' : 'MISSING') . "</p>";
if (is_dir($thumbsDir)) {
    $thumbFiles = glob($thumbsDir . '*');
    echo "<p>Files in thumbnails: " . count($thumbFiles) . "</p>";
}

// Reset button
if (isset($_POST['reset'])) {
    echo "<h2>Resetting...</h2>";
    
    // Clear files.json
    file_put_contents($dataFile, json_encode([], JSON_PRETTY_PRINT));
    echo "<p>✓ Cleared files database</p>";
    
    // Clear upload directories
    if (is_dir($uploadsDir)) {
        $files = glob($uploadsDir . '*');
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
        echo "<p>✓ Cleared uploads directory (" . count($files) . " files)</p>";
    }
    
    if (is_dir($thumbsDir)) {
        $files = glob($thumbsDir . '*');
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
        echo "<p>✓ Cleared thumbnails directory (" . count($files) . " files)</p>";
    }
    
    echo "<p><strong>Reset complete! You can now upload fresh images.</strong></p>";
    echo "<p><a href='../index.html'>Go to Upload Page</a> | <a href='../galaxy.html'>Go to Galaxy</a></p>";
}

if (!isset($_POST['reset'])) {
    echo "<h2>Reset Repository</h2>";
    echo "<form method='post'>";
    echo "<button type='submit' name='reset' onclick='return confirm(\"Are you sure you want to clear all uploaded files?\")' style='background: #ef4444; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;'>Reset Everything</button>";
    echo "</form>";
}

echo "<h2>Test Upload</h2>";
echo "<p><a href='../test_upload.html'>Test Upload Page</a></p>";
echo "<p><a href='../debug_upload.php'>Debug Upload Endpoint</a></p>";
?>
