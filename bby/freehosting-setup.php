<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FreeHosting Setup - Galaxy Repository</title>
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
            max-width: 900px;
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
            font-size: 2.5rem;
        }
        .step {
            margin: 20px 0;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            border-left: 4px solid #8b5cf6;
        }
        .step h3 {
            color: #e879f9;
            margin-bottom: 15px;
        }
        .check-item {
            margin: 10px 0;
            padding: 12px;
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
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6, #e879f9);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 25px;
            margin: 10px 5px;
            transition: transform 0.3s ease;
            border: none;
            cursor: pointer;
        }
        .button:hover {
            transform: translateY(-2px);
        }
        .code {
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
            border: 1px solid rgba(139, 92, 246, 0.3);
        }
        .highlight {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2));
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border: 1px solid rgba(139, 92, 246, 0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌟 FreeHosting Setup Guide 🌟</h1>
        
        <div class="highlight">
            <h3>📋 Quick Setup Summary</h3>
            <p>Your Galaxy Repository is ready for FreeHosting.com deployment!</p>
            <ol>
                <li><strong>Sign up</strong> at FreeHosting.com</li>
                <li><strong>Upload files</strong> to public_html</li>
                <li><strong>Set permissions</strong> (755 for folders, 644 for files)</li>
                <li><strong>Test your galaxy!</strong> 🌌</li>
            </ol>
        </div>

        <div class="step">
            <h3>🔍 Pre-Upload Validation</h3>
            <?php
            $projectRoot = __DIR__;
            $requiredFiles = [
                'index.html' => 'Upload page',
                'galaxy.html' => 'Galaxy visualization',
                'assets/css/upload.css' => 'Upload styles',
                'assets/css/galaxy.css' => 'Galaxy styles',
                'assets/js/upload.js' => 'Upload functionality', 
                'assets/js/galaxy.js' => 'Galaxy visualization',
                'api/upload.php' => 'File upload API',
                'api/files.php' => 'File listing API',
                'api/share.php' => 'Share functionality',
                'config.php' => 'Configuration',
                '.htaccess' => 'Server configuration'
            ];

            $allPresent = true;
            foreach ($requiredFiles as $file => $description) {
                $exists = file_exists($projectRoot . '/' . $file);
                $class = $exists ? 'pass' : 'fail';
                $status = $exists ? '✅ Ready' : '❌ Missing';
                if (!$exists) $allPresent = false;
                
                echo "<div class='check-item $class'>";
                echo "<span>$description ($file)</span>";
                echo "<span class='status'>$status</span>";
                echo "</div>";
            }
            ?>
        </div>

        <div class="step">
            <h3>📁 Directory Structure Check</h3>
            <?php
            $directories = ['data', 'uploads', 'uploads/thumbnails'];
            foreach ($directories as $dir) {
                $fullPath = $projectRoot . '/' . $dir;
                if (!is_dir($fullPath)) {
                    mkdir($fullPath, 0755, true);
                }
                $writable = is_writable($fullPath);
                $class = $writable ? 'pass' : 'warning';
                $status = $writable ? '✅ Writable' : '⚠️ Set 755';
                
                echo "<div class='check-item $class'>";
                echo "<span>Directory: $dir</span>";
                echo "<span class='status'>$status</span>";
                echo "</div>";
            }
            ?>
        </div>

        <div class="step">
            <h3>🌐 FreeHosting Upload Instructions</h3>
            <p><strong>1. Access FreeHosting cPanel:</strong></p>
            <div class="code">
                Login → cPanel → File Manager → public_html
            </div>
            
            <p><strong>2. Upload Method 1 - Zip Upload (Fastest):</strong></p>
            <div class="code">
                1. Create ZIP of your project folder<br>
                2. Upload ZIP to public_html<br>
                3. Extract ZIP in cPanel<br>
                4. Delete ZIP file
            </div>

            <p><strong>3. Upload Method 2 - Direct Upload:</strong></p>
            <div class="code">
                1. Select all files in your project<br>
                2. Drag & drop to public_html<br>
                3. Wait for upload completion
            </div>
        </div>

        <div class="step">
            <h3>🔧 Permission Settings</h3>
            <p>After upload, set these permissions in File Manager:</p>
            
            <div class="check-item warning">
                <span>Folders (data/, uploads/, uploads/thumbnails/)</span>
                <span class="status">755</span>
            </div>
            
            <div class="check-item warning">
                <span>PHP Files (*.php)</span>
                <span class="status">644</span>
            </div>
            
            <div class="check-item warning">
                <span>HTML/CSS/JS Files</span>
                <span class="status">644</span>
            </div>

            <p><strong>How to set permissions:</strong></p>
            <div class="code">
                Right-click file/folder → Permissions → Set to 755 or 644
            </div>
        </div>

        <div class="step">
            <h3>🧪 Testing Your Deployment</h3>
            <p>After uploading to FreeHosting, test these URLs:</p>
            
            <div class="code">
                https://yourusername.freehosting.com/<br>
                https://yourusername.freehosting.com/galaxy.html<br>
                https://yourusername.freehosting.com/deployment-check.php
            </div>
            
            <p><strong>Test Checklist:</strong></p>
            <ul>
                <li>✅ Upload page loads</li>
                <li>✅ File upload works</li>
                <li>✅ Galaxy visualization displays</li>
                <li>✅ Share functionality works</li>
                <li>✅ Romantic messages appear</li>
            </ul>
        </div>

        <?php if ($allPresent): ?>
        <div class="highlight">
            <h3>🎉 Ready for FreeHosting!</h3>
            <p>All files are present and ready for deployment. Your romantic galaxy repository is prepared for the cosmos! 🌌💖</p>
            
            <a href="FREEHOSTING_SETUP.md" class="button">📖 Detailed Guide</a>
            <a href="deployment-check.php" class="button">🔍 Full System Check</a>
        </div>
        <?php else: ?>
        <div class="check-item fail">
            <span>⚠️ Some files are missing. Please ensure all required files are present before uploading.</span>
            <span class="status">Not Ready</span>
        </div>
        <?php endif; ?>

        <div class="step">
            <h3>💝 Your Galaxy URLs</h3>
            <p>Once deployed, your galaxy will be available at:</p>
            <div class="code">
                🏠 Upload Page: https://yourusername.freehosting.com/<br>
                🌌 Galaxy View: https://yourusername.freehosting.com/galaxy.html<br>
                🔗 Share Links: https://yourusername.freehosting.com/galaxy.html?gallery=xxxxx
            </div>
        </div>
    </div>
</body>
</html>
