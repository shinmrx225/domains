<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

class FileManager {
    private $dataFile;

    public function __construct() {
        // Use absolute path relative to the project root
        $projectRoot = dirname(__DIR__);
        $this->dataFile = $projectRoot . '/data/files.json';
    }

    public function getFiles() {
        try {
            if (!file_exists($this->dataFile)) {
                return [
                    'success' => true,
                    'files' => [],
                    'total' => 0
                ];
            }

            $files = json_decode(file_get_contents($this->dataFile), true) ?: [];
            
            // Sort files by upload date (newest first)
            usort($files, function($a, $b) {
                return strtotime($b['upload_date']) - strtotime($a['upload_date']);
            });

            return [
                'success' => true,
                'files' => $files,
                'total' => count($files)
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'files' => [],
                'total' => 0
            ];
        }
    }

    public function getFileById($id) {
        try {
            $files = json_decode(file_get_contents($this->dataFile), true) ?: [];
            
            foreach ($files as $file) {
                if ($file['id'] === $id) {
                    return [
                        'success' => true,
                        'file' => $file
                    ];
                }
            }

            return [
                'success' => false,
                'message' => 'File not found'
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    public function deleteFile($id) {
        try {
            $files = json_decode(file_get_contents($this->dataFile), true) ?: [];
            $fileToDelete = null;
            $newFiles = [];

            foreach ($files as $file) {
                if ($file['id'] === $id) {
                    $fileToDelete = $file;
                } else {
                    $newFiles[] = $file;
                }
            }

            if (!$fileToDelete) {
                return [
                    'success' => false,
                    'message' => 'File not found'
                ];
            }

            // Delete physical files
            if (file_exists($fileToDelete['path'])) {
                unlink($fileToDelete['path']);
            }
            if (isset($fileToDelete['thumbnail']) && file_exists($fileToDelete['thumbnail'])) {
                unlink($fileToDelete['thumbnail']);
            }

            // Update data file
            file_put_contents($this->dataFile, json_encode($newFiles, JSON_PRETTY_PRINT));

            return [
                'success' => true,
                'message' => 'File deleted successfully'
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];
$manager = new FileManager();

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $result = $manager->getFileById($_GET['id']);
        } else {
            $result = $manager->getFiles();
        }
        break;
    
    case 'DELETE':
        $input = json_decode(file_get_contents('php://input'), true);
        if (isset($input['id'])) {
            $result = $manager->deleteFile($input['id']);
        } else {
            $result = ['success' => false, 'message' => 'File ID required'];
        }
        break;
    
    default:
        $result = ['success' => false, 'message' => 'Method not allowed'];
        break;
}

echo json_encode($result);
?>
