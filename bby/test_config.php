<?php
echo "<h1>PHP Upload Configuration</h1>";
echo "<table border='1'>";
echo "<tr><td>file_uploads</td><td>" . (ini_get('file_uploads') ? 'Enabled' : 'Disabled') . "</td></tr>";
echo "<tr><td>upload_max_filesize</td><td>" . ini_get('upload_max_filesize') . "</td></tr>";
echo "<tr><td>post_max_size</td><td>" . ini_get('post_max_size') . "</td></tr>";
echo "<tr><td>max_execution_time</td><td>" . ini_get('max_execution_time') . "</td></tr>";
echo "<tr><td>memory_limit</td><td>" . ini_get('memory_limit') . "</td></tr>";
echo "<tr><td>tmp_dir</td><td>" . ini_get('upload_tmp_dir') . "</td></tr>";
echo "</table>";

echo "<h2>Directory Permissions</h2>";
$dirs = ['uploads', 'uploads/thumbnails', 'data'];
foreach ($dirs as $dir) {
    $path = __DIR__ . '/' . $dir;
    echo "<p><strong>$dir:</strong> ";
    if (file_exists($path)) {
        echo "Exists - ";
        echo (is_writable($path) ? 'Writable' : 'Not Writable');
        echo " (permissions: " . substr(sprintf('%o', fileperms($path)), -4) . ")";
    } else {
        echo "Does not exist";
    }
    echo "</p>";
}

echo "<h2>Test File Operations</h2>";
$testFile = __DIR__ . '/uploads/test.txt';
if (file_put_contents($testFile, 'test') !== false) {
    echo "<p>✓ Can write to uploads directory</p>";
    unlink($testFile);
} else {
    echo "<p>✗ Cannot write to uploads directory</p>";
}
?>
