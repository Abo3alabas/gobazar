<?php
/**
 * Live Order Chat Messages API (PHP + MySQL)
 */

require_once __DIR__ . '/db_config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

if (!$pdo) {
    sendResponse(['status' => 'fallback', 'message' => 'Database offline'], 200);
}

switch ($method) {
    case 'GET':
        $orderId = $_GET['order_id'] ?? null;
        if (!$orderId) {
            sendResponse(['status' => 'error', 'message' => 'order_id required'], 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM chat_messages WHERE order_id = ? ORDER BY created_at ASC");
        $stmt->execute([$orderId]);
        $rows = $stmt->fetchAll();

        $messages = array_map(function($r) {
            return [
                'id' => $r['id'],
                'senderRole' => $r['sender_role'],
                'senderName' => $r['sender_name'],
                'text' => $r['message'],
                'timestamp' => date('H:i', strtotime($r['created_at'])),
            ];
        }, $rows);

        sendResponse(['status' => 'success', 'data' => $messages]);
        break;

    case 'POST':
        $input = getJsonInput();
        $orderId = $input['orderId'] ?? null;
        $text = $input['text'] ?? $input['message'] ?? null;

        if (!$orderId || !$text) {
            sendResponse(['status' => 'error', 'message' => 'orderId and text are required'], 400);
        }

        $msgId = $input['id'] ?? ('msg-' . time() . '-' . rand(100, 999));
        $senderRole = $input['senderRole'] ?? 'customer';
        $senderName = $input['senderName'] ?? ($senderRole === 'customer' ? 'العميل' : 'المندوب');

        $stmt = $pdo->prepare("
            INSERT INTO chat_messages (id, order_id, sender_role, sender_name, message)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$msgId, $orderId, $senderRole, $senderName, $text]);

        sendResponse([
            'status' => 'success',
            'message' => 'Chat message persisted in MySQL',
            'data' => [
                'id' => $msgId,
                'senderRole' => $senderRole,
                'senderName' => $senderName,
                'text' => $text,
                'timestamp' => date('H:i')
            ]
        ], 201);
        break;

    default:
        sendResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}
