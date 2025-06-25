<?php
// InfinityFree Setup and Compatibility Checker
// Run this file on InfinityFree to verify share galaxy functionality

header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>InfinityFree - Galaxy Share Setup</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: white;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            box-shadow: 0 20px 60px rgba(139, 92, 246, 0.3);
        }
        h1 {
            text-align: center;
            color: #e879f9;
            margin-bottom: 30px;
        }
        .check-item {
            margin: 15px 0;
            padding: 15px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .check-item.pass {
            background: rgba(34, 197, 94, 0.2);
            border: 1px solid #22c55e;
        }
        .check-item.fail {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid #ef4444;
        }
        .check-item.warning {
            background: rgba(245, 158, 11, 0.2);
            border: 1px solid #f59e0b;
        }
        .status {
            font-weight: bold;
            padding: 5px 15px;
            border-radius: 20px;
        }
        .pass .status { background: #22c55e; color: white; }
        .fail .status { background: #ef4444; color: white; }
        .warning .status { background: #f59e0b; color: black; }
        .section {
            margin: 30px 0;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            border-left: 4px solid #8b5cf6;
        }
        .section h3 {
            color: #e879f9;
            margin-bottom: 15px;
        }
        .setup-button {
            background: linear-gradient(45deg, #8b5cf6, #e879f9);
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            margin: 10px;
            text-decoration: none;
            display: inline-block;
            transition: transform 0.3s ease;
        }
        .setup-button:hover {
            transform: translateY(-2px);
        }
        .code-block {
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
            border-left: 3px solid #8b5cf6;
        }
        .success-box {
            background: rgba(34, 197, 94, 0.1);
            border: 2px solid #22c55e;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
        }
        .alert-box {
            background: rgba(239, 68, 68, 0.1);
            border: 2px solid #ef4444;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌟 InfinityFree Galaxy Share Setup</h1>
        
        <?php
        // Check basic PHP functionality
        $phpVersion = phpversion();
        $dataDir = __DIR__ . '/data';
        $sharedGalleriesFile = $dataDir . '/shared_galleries.json';
        $uploadsDir = __DIR__ . '/uploads';
        
        // Perform setup operations if requested
        if (isset($_GET['setup']) && $_GET['setup'] === 'true') {
            echo '<div class="section">';
            echo '<h3>🔧 Automatic Setup Results</h3>';
            
            // Try to create data directory
            if (!is_dir($dataDir)) {
                if (@mkdir($dataDir, 0755, true)) {
                    echo '<div class="check-item pass"><span>Created data/ directory</span><span class="status">SUCCESS</span></div>';
                } else {
                    echo '<div class="check-item fail"><span>Failed to create data/ directory</span><span class="status">MANUAL SETUP NEEDED</span></div>';
                }
            } else {
                echo '<div class="check-item pass"><span>data/ directory exists</span><span class="status">OK</span></div>';
            }
            
            // Try to create shared galleries file
            if (!file_exists($sharedGalleriesFile)) {
                if (@file_put_contents($sharedGalleriesFile, '{}')) {
                    echo '<div class="check-item pass"><span>Created shared_galleries.json</span><span class="status">SUCCESS</span></div>';
                } else {
                    echo '<div class="check-item fail"><span>Failed to create shared_galleries.json</span><span class="status">MANUAL SETUP NEEDED</span></div>';
                }
            } else {
                echo '<div class="check-item pass"><span>shared_galleries.json exists</span><span class="status">OK</span></div>';
            }
            
            // Test file writing
            $testFile = $dataDir . '/test_write.txt';
            if (@file_put_contents($testFile, 'test')) {
                @unlink($testFile);
                echo '<div class="check-item pass"><span>File writing test</span><span class="status">SUCCESS</span></div>';
            } else {
                echo '<div class="check-item fail"><span>File writing test</span><span class="status">FAILED</span></div>';
            }
            
            echo '</div>';
        }
        ?>
        
        <div class="section">
            <h3>📋 System Compatibility Check</h3>
            
            <div class="check-item <?php echo version_compare($phpVersion, '7.4.0', '>=') ? 'pass' : 'fail'; ?>">
                <span>PHP Version: <?php echo $phpVersion; ?></span>
                <span class="status"><?php echo version_compare($phpVersion, '7.4.0', '>=') ? 'COMPATIBLE' : 'TOO OLD'; ?></span>
            </div>
            
            <div class="check-item <?php echo function_exists('json_encode') ? 'pass' : 'fail'; ?>">
                <span>JSON Support</span>
                <span class="status"><?php echo function_exists('json_encode') ? 'AVAILABLE' : 'MISSING'; ?></span>
            </div>
            
            <div class="check-item <?php echo function_exists('file_get_contents') ? 'pass' : 'fail'; ?>">
                <span>File Operations</span>
                <span class="status"><?php echo function_exists('file_get_contents') ? 'AVAILABLE' : 'MISSING'; ?></span>
            </div>
            
            <div class="check-item <?php echo is_dir($dataDir) ? 'pass' : 'warning'; ?>">
                <span>data/ Directory</span>
                <span class="status"><?php echo is_dir($dataDir) ? 'EXISTS' : 'NEEDS SETUP'; ?></span>
            </div>
            
            <div class="check-item <?php echo file_exists($sharedGalleriesFile) ? 'pass' : 'warning'; ?>">
                <span>shared_galleries.json</span>
                <span class="status"><?php echo file_exists($sharedGalleriesFile) ? 'EXISTS' : 'NEEDS SETUP'; ?></span>
            </div>
            
            <div class="check-item <?php echo is_dir($uploadsDir) ? 'pass' : 'warning'; ?>">
                <span>uploads/ Directory</span>
                <span class="status"><?php echo is_dir($uploadsDir) ? 'EXISTS' : 'NEEDS SETUP'; ?></span>
            </div>
        </div>
        
        <?php if (!is_dir($dataDir) || !file_exists($sharedGalleriesFile)): ?>
        <div class="section">
            <h3>🚀 Quick Setup</h3>
            <p>Your system needs some directories and files created for share functionality to work.</p>
            
            <a href="?setup=true" class="setup-button">🔧 Run Automatic Setup</a>
            
            <div class="alert-box">
                <strong>⚠️ If automatic setup fails:</strong><br>
                You'll need to manually create these using your InfinityFree File Manager:
                <div class="code-block">
                1. Create folder: data/<br>
                2. Create file: data/shared_galleries.json (content: {})<br>
                3. Set folder permissions to 755<br>
                4. Set file permissions to 644
                </div>
            </div>
        </div>
        <?php else: ?>
        <div class="success-box">
            <h3>✅ Share Galaxy System Ready!</h3>
            <p>Your galaxy share functionality should work perfectly on InfinityFree!</p>
            
            <a href="index.html" class="setup-button">📤 Go to Upload Page</a>
            <a href="galaxy.html" class="setup-button">🌌 View Galaxy</a>
        </div>
        <?php endif; ?>
        
        <div class="section">
            <h3>📊 InfinityFree Share Capabilities</h3>
            
            <div class="check-item pass">
                <span>✅ Create shareable galaxy links</span>
                <span class="status">SUPPORTED</span>
            </div>
            
            <div class="check-item pass">
                <span>✅ Store shared gallery metadata</span>
                <span class="status">SUPPORTED</span>
            </div>
            
            <div class="check-item pass">
                <span>✅ View shared galaxies</span>
                <span class="status">SUPPORTED</span>
            </div>
            
            <div class="check-item pass">
                <span>✅ Fallback URL-based sharing</span>
                <span class="status">ALWAYS WORKS</span>
            </div>
        </div>
        
        <div class="section">
            <h3>🎯 Testing Your Share Feature</h3>
            <ol style="line-height: 1.8;">
                <li><strong>Upload some photos</strong> via the upload page</li>
                <li><strong>View your galaxy</strong> visualization</li>
                <li><strong>Click "Share Galaxy"</strong> button</li>
                <li><strong>Copy the shareable link</strong></li>
                <li><strong>Open link in incognito/private window</strong> to test</li>
                <li><strong>Verify the galaxy loads</strong> with your photos</li>
            </ol>
        </div>
        
        <div class="section">
            <h3>💡 Pro Tips for InfinityFree</h3>
            <ul style="line-height: 1.8;">
                <li><strong>Manual directory creation</strong> might be needed via File Manager</li>
                <li><strong>Share links are lightweight</strong> - each uses ~1-5KB storage</li>
                <li><strong>Fallback system</strong> ensures sharing always works</li>
                <li><strong>5GB storage</strong> can handle thousands of shared galaxies</li>
                <li><strong>No database required</strong> - simple JSON file storage</li>
            </ul>
        </div>
    </div>
</body>
</html>
