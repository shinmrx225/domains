<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

class FileUploader {
    private $uploadDir;
    private $thumbDir;
    private $dataFile;
    private $maxFileSize = 10 * 1024 * 1024; // 10MB
    private $allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'
    ];

    public function __construct() {
        // Use absolute paths relative to the project root
        $projectRoot = dirname(__DIR__);
        $this->uploadDir = $projectRoot . '/uploads/';
        $this->thumbDir = $projectRoot . '/uploads/thumbnails/';
        $this->dataFile = $projectRoot . '/data/files.json';
        
        $this->ensureDirectories();
    }

    private function ensureDirectories() {
        if (!file_exists($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
        if (!file_exists($this->thumbDir)) {
            mkdir($this->thumbDir, 0755, true);
        }
        if (!file_exists(dirname($this->dataFile))) {
            mkdir(dirname($this->dataFile), 0755, true);
        }
        if (!file_exists($this->dataFile)) {
            file_put_contents($this->dataFile, json_encode([]));
        }
    }

    public function handleUpload() {
        try {
            if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
                throw new Exception('No file uploaded or upload error occurred');
            }

            $file = $_FILES['file'];
            
            // Validate file
            if (!$this->validateFile($file)) {
                throw new Exception('Invalid file type or size');
            }

            // Generate unique filename
            $originalName = $file['name'];
            $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
            $uniqueName = uniqid() . '_' . time() . '.' . $extension;
            $uploadPath = $this->uploadDir . $uniqueName;

            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
                throw new Exception('Failed to move uploaded file');
            }

            // Create thumbnail (only for images)
            $thumbnailPath = null;
            $isImage = strpos($file['type'], 'image/') === 0;
            
            if ($isImage) {
                $thumbnailPath = $this->createThumbnail($uploadPath, $uniqueName);
            }

            // Save file metadata
            $fileData = [
                'id' => uniqid(),
                'name' => $originalName,
                'filename' => $uniqueName,
                'path' => 'uploads/' . $uniqueName, // Web-accessible path
                'thumbnail' => $thumbnailPath ? 'uploads/thumbnails/thumb_' . $uniqueName : ($isImage ? 'uploads/' . $uniqueName : null),
                'size' => $file['size'],
                'type' => $file['type'],
                'upload_date' => date('Y-m-d H:i:s'),
                'dimensions' => $isImage ? $this->getImageDimensions($uploadPath) : null
            ];

            $this->saveFileData($fileData);

            return [
                'success' => true,
                'message' => 'File uploaded successfully',
                'file' => $fileData
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    private function validateFile($file) {
        // Check file type
        if (!in_array($file['type'], $this->allowedTypes)) {
            return false;
        }

        // Check file size
        if ($file['size'] > $this->maxFileSize) {
            return false;
        }

        // Additional security: check file content
        if (strpos($file['type'], 'image/') === 0) {
            // For images, check with getimagesize
            $imageInfo = getimagesize($file['tmp_name']);
            if ($imageInfo === false) {
                return false;
            }
        }

        return true;
    }

    private function createThumbnail($sourcePath, $filename) {
        $thumbPath = $this->thumbDir . 'thumb_' . $filename;
        $thumbWidth = 300;
        $thumbHeight = 300;

        list($sourceWidth, $sourceHeight, $sourceType) = getimagesize($sourcePath);

        // Calculate aspect ratio
        $aspectRatio = $sourceWidth / $sourceHeight;
        if ($aspectRatio > 1) {
            $newWidth = $thumbWidth;
            $newHeight = $thumbWidth / $aspectRatio;
        } else {
            $newHeight = $thumbHeight;
            $newWidth = $thumbHeight * $aspectRatio;
        }

        // Create image resources
        switch ($sourceType) {
            case IMAGETYPE_JPEG:
                $sourceImage = imagecreatefromjpeg($sourcePath);
                break;
            case IMAGETYPE_PNG:
                $sourceImage = imagecreatefrompng($sourcePath);
                break;
            case IMAGETYPE_GIF:
                $sourceImage = imagecreatefromgif($sourcePath);
                break;
            case IMAGETYPE_WEBP:
                $sourceImage = imagecreatefromwebp($sourcePath);
                break;
            default:
                return $sourcePath; // Return original if thumbnail creation fails
        }

        if (!$sourceImage) {
            return $sourcePath;
        }

        // Create thumbnail
        $thumbImage = imagecreatetruecolor($newWidth, $newHeight);
        
        // Preserve transparency for PNG and GIF
        if ($sourceType == IMAGETYPE_PNG || $sourceType == IMAGETYPE_GIF) {
            imagealphablending($thumbImage, false);
            imagesavealpha($thumbImage, true);
            $transparent = imagecolorallocatealpha($thumbImage, 255, 255, 255, 127);
            imagefill($thumbImage, 0, 0, $transparent);
        }

        imagecopyresampled($thumbImage, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $sourceWidth, $sourceHeight);

        // Save thumbnail
        switch ($sourceType) {
            case IMAGETYPE_JPEG:
                imagejpeg($thumbImage, $thumbPath, 90);
                break;
            case IMAGETYPE_PNG:
                imagepng($thumbImage, $thumbPath, 9);
                break;
            case IMAGETYPE_GIF:
                imagegif($thumbImage, $thumbPath);
                break;
            case IMAGETYPE_WEBP:
                imagewebp($thumbImage, $thumbPath, 90);
                break;
        }

        imagedestroy($sourceImage);
        imagedestroy($thumbImage);

        return $thumbPath;
    }

    private function getImageDimensions($imagePath) {
        $imageInfo = getimagesize($imagePath);
        if ($imageInfo) {
            return [
                'width' => $imageInfo[0],
                'height' => $imageInfo[1]
            ];
        }
        return null;
    }

    private function saveFileData($fileData) {
        $existingData = json_decode(file_get_contents($this->dataFile), true) ?: [];
        $existingData[] = $fileData;
        file_put_contents($this->dataFile, json_encode($existingData, JSON_PRETTY_PRINT));
    }
}

// Handle the upload
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $uploader = new FileUploader();
    $result = $uploader->handleUpload();
    echo json_encode($result);
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
