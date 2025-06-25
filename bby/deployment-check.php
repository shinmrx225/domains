<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galaxy Repository - Deployment Check</title>
    <style>
        body {
            font-family: Arial, sans-serif;
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
            border-left: 4px solid #22c55e;
        }
        .check-item.fail {
            background: rgba(239, 68, 68, 0.2);
            border-left: 4px solid #ef4444;
        }
        .check-item.warning {
            background: rgba(245, 158, 11, 0.2);
            border-left: 4px solid #f59e0b;
        }
        .status {
            font-weight: bold;
            padding: 5px 10px;
            border-radius: 15px;
        }
        .pass .status { background: #22c55e; color: white; }
        .fail .status { background: #ef4444; color: white; }
        .warning .status { background: #f59e0b; color: white; }
        .info {
            margin-top: 30px;
            padding: 20px;
            background: rgba(59, 130, 246, 0.1);
            border-radius: 10px;
            border-left: 4px solid #3b82f6;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6, #e879f9);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 25px;
            margin: 10px 5px;
            transition: transform 0.3s ease;
        }
        .button:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌟 Galaxy Repository - Deployment Check 🌟</h1>
        
        <?php
        $checks = [];
        $config = include 'config.php';
        
        // Check PHP version
        $phpVersion = phpversion();
        if (version_compare($phpVersion, '7.4.0', '>=')) {
            $checks[] = ['PHP Version', "✅ $phpVersion", 'pass'];
        } else {
            $checks[] = ['PHP Version', "❌ $phpVersion (7.4+ required)", 'fail'];
        }
        
        // Check directories
        $dirs = ['data', 'uploads', 'uploads/thumbnails'];
        foreach ($dirs as $dir) {
            if (is_dir($dir)) {
                if (is_writable($dir)) {
                    $checks[] = ["Directory: $dir", '✅ Exists & Writable', 'pass'];
                } else {
                    $checks[] = ["Directory: $dir", '⚠️ Exists but not writable', 'warning'];
                }
            } else {
                if (mkdir($dir, 0755, true)) {
                    $checks[] = ["Directory: $dir", '✅ Created successfully', 'pass'];
                } else {
                    $checks[] = ["Directory: $dir", '❌ Cannot create', 'fail'];
                }
            }
        }
        
        // Check files
        $files = [
            'index.html',
            'galaxy.html',
            'assets/css/upload.css',
            'assets/css/galaxy.css',
            'assets/js/upload.js',
            'assets/js/galaxy.js',
            'api/upload.php',
            'api/files.php',
            'api/share.php'
        ];
        
        foreach ($files as $file) {
            if (file_exists($file)) {
                $checks[] = ["File: $file", '✅ Found', 'pass'];
            } else {
                $checks[] = ["File: $file", '❌ Missing', 'fail'];
            }
        }
        
        // Check PHP extensions
        $extensions = ['gd', 'json', 'fileinfo'];
        foreach ($extensions as $ext) {
            if (extension_loaded($ext)) {
                $checks[] = ["PHP Extension: $ext", '✅ Loaded', 'pass'];
            } else {
                $checks[] = ["PHP Extension: $ext", '❌ Missing', 'fail'];
            }
        }
        
        // Check file upload settings
        $maxFileSize = ini_get('upload_max_filesize');
        $maxPostSize = ini_get('post_max_size');
        $checks[] = ['Upload Max Filesize', "📁 $maxFileSize", 'pass'];
        $checks[] = ['Post Max Size', "📦 $maxPostSize", 'pass'];
        
        // Check if data files exist, create if not
        $dataFiles = ['data/files.json'];
        foreach ($dataFiles as $file) {
            if (!file_exists($file)) {
                file_put_contents($file, json_encode([], JSON_PRETTY_PRINT));
                $checks[] = ["Data File: $file", '✅ Created', 'pass'];
            } else {
                $checks[] = ["Data File: $file", '✅ Exists', 'pass'];
            }
        }
        
        // Display checks
        foreach ($checks as $check) {
            echo "<div class='check-item {$check[2]}'>";
            echo "<span>{$check[0]}</span>";
            echo "<span class='status'>{$check[1]}</span>";
            echo "</div>";
        }
        
        // Test API endpoints
        echo "<div class='info'>";
        echo "<h3>🧪 API Endpoint Tests</h3>";
        echo "<p>Testing API endpoints...</p>";
        
        // Test files API
        $filesUrl = 'api/files.php';
        if (function_exists('curl_init')) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $filesUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode === 200) {
                echo "<div class='check-item pass'><span>Files API</span><span class='status'>✅ Working</span></div>";
            } else {
                echo "<div class='check-item fail'><span>Files API</span><span class='status'>❌ Error $httpCode</span></div>";
            }
        } else {
            echo "<div class='check-item warning'><span>API Test</span><span class='status'>⚠️ cURL not available</span></div>";
        }
        echo "</div>";
        ?>
        
        <div class="info">
            <h3>🚀 Next Steps</h3>
            <p>If all checks pass, your Galaxy Repository is ready for deployment!</p>
            
            <a href="index.html" class="button">📤 Test Upload Page</a>
            <a href="galaxy.html" class="button">🌌 Test Galaxy View</a>
            
            <h4>📋 Deployment Checklist:</h4>
            <ul>
                <li>✅ Upload all files to your web server</li>
                <li>✅ Set proper directory permissions (755 for directories, 644 for files)</li>
                <li>✅ Ensure PHP and required extensions are available</li>
                <li>✅ Test file upload functionality</li>
                <li>✅ Test galaxy visualization</li>
                <li>✅ Test share functionality</li>
                <li>✅ Update any hardcoded URLs for your domain</li>
            </ul>
            
            <h4>💝 Your Galaxy is Ready!</h4>
            <p>Share the magic of your cosmic love story with the world! 🌟</p>
        </div>
    </div>
</body>
</html>
