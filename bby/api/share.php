<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

function ensureDataDir() {
    $dataDir = __DIR__ . '/../data';
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
    return $dataDir;
}

function getSharedGalleriesFile() {
    return ensureDataDir() . '/shared_galleries.json';
}

function loadSharedGalleries() {
    $file = getSharedGalleriesFile();
    if (file_exists($file)) {
        $content = file_get_contents($file);
        return json_decode($content, true) ?: [];
    }
    return [];
}

function saveSharedGalleries($galleries) {
    $file = getSharedGalleriesFile();
    return file_put_contents($file, json_encode($galleries, JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get a specific shared gallery
        if (isset($_GET['id'])) {
            $galleryId = $_GET['id'];
            $galleries = loadSharedGalleries();
            
            if (isset($galleries[$galleryId])) {
                echo json_encode([
                    'success' => true,
                    'gallery' => $galleries[$galleryId]
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Gallery not found'
                ]);
            }
        } else {
            // List all shared galleries (for admin purposes)
            $galleries = loadSharedGalleries();
            echo json_encode([
                'success' => true,
                'galleries' => array_keys($galleries),
                'count' => count($galleries)
            ]);
        }
        break;
        
    case 'POST':
        // Create/save a shared gallery
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['galleryId']) || !isset($input['files'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Missing required fields: galleryId and files'
            ]);
            break;
        }
        
        $galleryId = $input['galleryId'];
        $files = $input['files'];
        $title = $input['title'] ?? '💖 Our Galaxy of Love 💖';
        
        $galleries = loadSharedGalleries();
        
        // Create gallery entry
        $galleries[$galleryId] = [
            'id' => $galleryId,
            'files' => $files,
            'title' => $title,
            'timestamp' => time(),
            'fileCount' => count($files),
            'views' => 0
        ];
        
        // Clean up old galleries (keep only last 100)
        if (count($galleries) > 100) {
            uasort($galleries, function($a, $b) {
                return $b['timestamp'] - $a['timestamp'];
            });
            $galleries = array_slice($galleries, 0, 100, true);
        }
        
        if (saveSharedGalleries($galleries)) {
            echo json_encode([
                'success' => true,
                'galleryId' => $galleryId,
                'message' => 'Gallery saved successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to save gallery'
            ]);
        }
        break;
        
    case 'PUT':
        // Update view count or other gallery data
        if (isset($_GET['id'])) {
            $galleryId = $_GET['id'];
            $input = json_decode(file_get_contents('php://input'), true);
            
            $galleries = loadSharedGalleries();
            
            if (isset($galleries[$galleryId])) {
                if (isset($input['incrementViews']) && $input['incrementViews']) {
                    $galleries[$galleryId]['views']++;
                }
                
                if (saveSharedGalleries($galleries)) {
                    echo json_encode([
                        'success' => true,
                        'gallery' => $galleries[$galleryId]
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Failed to update gallery'
                    ]);
                }
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Gallery not found'
                ]);
            }
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Gallery ID required'
            ]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'error' => 'Method not allowed'
        ]);
        break;
}
?>
