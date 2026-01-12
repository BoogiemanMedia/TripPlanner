<?php
/**
 * Simple API to save/load trip data as JSON
 * Endpoints:
 *   GET  api.php         -> Returns trip.json content
 *   POST api.php         -> Saves request body to trip.json
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/trip.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Load trip data
    if (file_exists($dataFile)) {
        $content = file_get_contents($dataFile);
        echo $content;
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'No trip data found']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Save trip data
    $input = file_get_contents('php://input');

    // Validate JSON
    $decoded = json_decode($input);
    if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON: ' . json_last_error_msg()]);
        exit;
    }

    // Save to file
    $result = file_put_contents($dataFile, $input);

    if ($result === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save data']);
    } else {
        echo json_encode(['success' => true, 'bytes' => $result]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
