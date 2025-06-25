<?php
header('Content-Type: application/json');

// Debug file upload
echo "<h1>Upload Debug</h1>";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "<h2>POST Request Received</h2>";
    echo "<pre>";
    echo "Files data:\n";
    print_r($_FILES);
    echo "\nPOST data:\n";
    print_r($_POST);
    echo "</pre>";
    
    if (isset($_FILES['file'])) {
        $file = $_FILES['file'];
        echo "<h3>File Details:</h3>";
        echo "<ul>";
        echo "<li>Name: " . $file['name'] . "</li>";
        echo "<li>Type: " . $file['type'] . "</li>";
        echo "<li>Size: " . $file['size'] . " bytes</li>";
        echo "<li>Temp file: " . $file['tmp_name'] . "</li>";
        echo "<li>Error: " . $file['error'] . "</li>";
        echo "</ul>";
        
        if ($file['error'] === UPLOAD_ERR_OK) {
            echo "<p style='color: green;'>✓ File uploaded successfully to temp location</p>";
            
            // Try to move the file
            $uploadDir = dirname(__DIR__) . '/uploads/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
                echo "<p>Created uploads directory</p>";
            }
            
            $filename = uniqid() . '_' . $file['name'];
            $destination = $uploadDir . $filename;
            
            if (move_uploaded_file($file['tmp_name'], $destination)) {
                echo "<p style='color: green;'>✓ File moved to: $destination</p>";
                
                // Update files.json
                $dataFile = dirname(__DIR__) . '/data/files.json';
                if (!file_exists(dirname($dataFile))) {
                    mkdir(dirname($dataFile), 0755, true);
                }
                
                $existingData = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];
                if (!$existingData) $existingData = [];
                
                $fileData = [
                    'id' => uniqid(),
                    'name' => $file['name'],
                    'filename' => $filename,
                    'path' => 'uploads/' . $filename,
                    'thumbnail' => 'uploads/' . $filename,
                    'size' => $file['size'],
                    'type' => $file['type'],
                    'upload_date' => date('Y-m-d H:i:s')
                ];
                
                $existingData[] = $fileData;
                file_put_contents($dataFile, json_encode($existingData, JSON_PRETTY_PRINT));
                
                echo "<p style='color: green;'>✓ File data saved to files.json</p>";
                echo "<pre>" . json_encode($fileData, JSON_PRETTY_PRINT) . "</pre>";
                
            } else {
                echo "<p style='color: red;'>✗ Failed to move file to destination</p>";
            }
        } else {
            echo "<p style='color: red;'>✗ Upload error: " . $file['error'] . "</p>";
        }
    } else {
        echo "<p style='color: red;'>✗ No file uploaded</p>";
    }
} else {
    echo "<p>Make a POST request with a file to test upload</p>";
}
?>
