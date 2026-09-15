<?php
/**
 * Sofia Express Delivery API - Database Configuration (Hostinger Ready)
 * 
 * Supports MySQL PDO connection with automatic CORS headers, JSON formatting,
 * and graceful fallback mock responses if database is not yet configured.
 */

// Set UTF-8 and CORS headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Hostinger Database Credentials - عدل هذه البيانات بمعلومات قاعدة بياناتك على هوستنجر
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_USER', getenv('DB_USER') ?: 'u123456789_sofia_user');
define('DB_PASS', getenv('DB_PASS') ?: 'Your_Strong_Password_Here');
define('DB_NAME', getenv('DB_NAME') ?: 'u123456789_sofia_delivery');
define('DB_CHARSET', 'utf8mb4');

function getDBConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        // Log the real reason to the server's PHP error log (visible in Hostinger's
        // hPanel > Advanced > Error Log) for debugging, without ever leaking DB
        // host/user/password or exception details to the client response.
        error_log('[GO BAZAR] MySQL connection failed: ' . $e->getMessage());
        return null;
    }
}

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

function getJsonInput() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}
