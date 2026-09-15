<?php
/**
 * Orders Management API (PHP + MySQL)
 * Handles:
 *   - GET: list orders or single order with items and chat messages
 *   - POST: create a new order (with order_items)
 *   - PUT: update order status, prep time, timestamps, rating, driver assignment
 */

require_once __DIR__ . '/db_config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

function formatOrderRow($pdo, $order) {
    $orderId = $order['id'];

    // Fetch items
    $itemStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
    $itemStmt->execute([$orderId]);
    $rawItems = $itemStmt->fetchAll();

    $items = array_map(function($it) {
        $selectedOptions = json_decode($it['options_json'] ?? '[]', true) ?: [];
        return [
            'id' => $it['id'],
            'product' => [
                'id' => $it['product_id'],
                'nameAr' => $it['name_ar'],
                'nameEn' => $it['name_en'],
                'price' => (float)$it['price'],
                'image' => $it['image'] ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
                'descriptionAr' => '',
                'descriptionEn' => '',
                'category' => 'main',
                'isAvailable' => true,
                'storeId' => '',
            ],
            'quantity' => (int)$it['quantity'],
            'selectedOptions' => $selectedOptions,
            'specialInstructions' => $it['special_instructions'] ?? '',
            'totalPrice' => (float)$it['item_total'],
        ];
    }, $rawItems);

    // Fetch chat messages
    $chatStmt = $pdo->prepare("SELECT * FROM chat_messages WHERE order_id = ? ORDER BY created_at ASC");
    $chatStmt->execute([$orderId]);
    $chatMessages = array_map(function($c) {
        return [
            'id' => $c['id'],
            'senderRole' => $c['sender_role'],
            'senderName' => $c['sender_name'],
            'text' => $c['message'],
            'timestamp' => date('H:i', strtotime($c['created_at'])),
        ];
    }, $chatStmt->fetchAll());

    // Driver info
    $driver = null;
    if (!empty($order['driver_id'])) {
        $dStmt = $pdo->prepare("SELECT * FROM drivers WHERE id = ?");
        $dStmt->execute([$order['driver_id']]);
        $dRow = $dStmt->fetch();
        if ($dRow) {
            $driver = [
                'id' => $dRow['id'],
                'name' => $dRow['name'],
                'phone' => $dRow['phone'],
                'avatar' => $dRow['avatar'],
                'vehicleType' => $dRow['vehicle_type'],
                'vehiclePlate' => $dRow['vehicle_plate'],
                'rating' => (float)$dRow['rating'],
                'totalDeliveries' => (int)$dRow['total_deliveries'],
                'currentCoordinates' => [
                    'lat' => (float)$dRow['current_lat'],
                    'lng' => (float)$dRow['current_lng'],
                ],
            ];
        }
    }

    $timestamps = json_decode($order['timestamps_json'] ?? '{}', true) ?: [];
    $rating = json_decode($order['rating_json'] ?? 'null', true);

    return [
        'id' => $order['id'],
        'trackingNumber' => $order['order_number'],
        'customerName' => $order['customer_name'],
        'customerPhone' => $order['customer_phone'],
        'customerAddress' => $order['delivery_address'],
        'customerCoordinates' => [
            'lat' => (float)($order['customer_lat'] ?? 42.6977),
            'lng' => (float)($order['customer_lng'] ?? 23.3219),
        ],
        'storeId' => $order['store_id'],
        'storeNameAr' => $order['store_name_ar'],
        'storeNameEn' => $order['store_name_en'],
        'storeType' => $order['store_type'] ?? 'restaurant',
        'storeImage' => $order['store_image'] ?? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
        'storeCoordinates' => [
            'lat' => (float)($order['store_lat'] ?? 42.6934),
            'lng' => (float)($order['store_lng'] ?? 23.3210),
        ],
        'items' => $items,
        'subtotal' => (float)$order['subtotal'],
        'deliveryFee' => (float)$order['delivery_fee'],
        'serviceFee' => (float)$order['service_fee'],
        'discount' => (float)($order['discount'] ?? 0.0),
        'total' => (float)$order['total'],
        'paymentMethod' => $order['payment_method'],
        'paymentStatus' => $order['payment_status'],
        'status' => $order['status'],
        'driver' => $driver,
        'timestamps' => $timestamps,
        'estimatedDeliveryMinutes' => (int)($order['estimated_minutes'] ?? 25),
        'driverProgressPercent' => (int)($order['driver_progress_percent'] ?? 0),
        'chatMessages' => $chatMessages,
        'rating' => $rating,
        'prepTimeMinutes' => isset($order['prep_time_minutes']) ? (int)$order['prep_time_minutes'] : null,
        'notes' => $order['delivery_notes'] ?? '',
    ];
}

if (!$pdo) {
    sendResponse([
        'status' => 'fallback',
        'message' => 'Database connection offline',
        'data' => []
    ], 200);
}

switch ($method) {
    case 'GET':
        $orderId = $_GET['id'] ?? null;
        if ($orderId) {
            $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ?");
            $stmt->execute([$orderId]);
            $order = $stmt->fetch();
            if ($order) {
                sendResponse(['status' => 'success', 'data' => formatOrderRow($pdo, $order)]);
            } else {
                sendResponse(['status' => 'error', 'message' => 'Order not found'], 404);
            }
        }

        $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 50");
        $rows = $stmt->fetchAll();
        $data = array_map(function($r) use ($pdo) {
            return formatOrderRow($pdo, $r);
        }, $rows);

        sendResponse(['status' => 'success', 'count' => count($data), 'data' => $data]);
        break;

    case 'POST':
        $input = getJsonInput();
        if (empty($input['storeId']) || empty($input['items'])) {
            sendResponse(['status' => 'error', 'message' => 'storeId and items are required'], 400);
        }

        $orderId = $input['id'] ?? ('ord-' . strtoupper(substr(uniqid(), -6)));
        $orderNumber = $input['trackingNumber'] ?? ('#SOF-' . rand(1000, 9999));

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("
                INSERT INTO orders (
                    id, order_number, customer_id, customer_name, customer_phone,
                    store_id, store_name_ar, store_name_en, store_type, store_image,
                    store_lat, store_lng, customer_lat, customer_lng,
                    status, subtotal, delivery_fee, service_fee, discount, tip, total,
                    currency, payment_method, payment_status, delivery_address, delivery_notes,
                    timestamps_json, estimated_minutes, driver_progress_percent
                ) VALUES (
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?,
                    'EUR', ?, ?, ?, ?,
                    ?, ?, ?
                )
            ");

            $timestampsJson = json_encode($input['timestamps'] ?? ['created' => 'الآن'], JSON_UNESCAPED_UNICODE);

            $stmt->execute([
                $orderId,
                $orderNumber,
                $input['customerId'] ?? 'usr-cust-1',
                $input['customerName'] ?? 'سارة المنصور',
                $input['customerPhone'] ?? '+359 88 123 4567',
                $input['storeId'],
                $input['storeNameAr'] ?? 'متجر صوفيا',
                $input['storeNameEn'] ?? 'Sofia Store',
                $input['storeType'] ?? 'restaurant',
                $input['storeImage'] ?? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
                $input['storeCoordinates']['lat'] ?? 42.6934,
                $input['storeCoordinates']['lng'] ?? 23.3210,
                $input['customerCoordinates']['lat'] ?? 42.6977,
                $input['customerCoordinates']['lng'] ?? 23.3219,
                $input['status'] ?? 'pending',
                $input['subtotal'] ?? 0.0,
                $input['deliveryFee'] ?? 1.49,
                $input['serviceFee'] ?? 0.99,
                $input['discount'] ?? 0.0,
                $input['tip'] ?? 0.0,
                $input['total'] ?? 0.0,
                $input['paymentMethod'] ?? 'cash',
                $input['paymentStatus'] ?? 'pending',
                $input['customerAddress'] ?? 'شارع فيتوشا 15، صوفيا',
                $input['notes'] ?? '',
                $timestampsJson,
                $input['estimatedDeliveryMinutes'] ?? 25,
                $input['driverProgressPercent'] ?? 0,
            ]);

            // Save order items
            $itemStmt = $pdo->prepare("
                INSERT INTO order_items (
                    id, order_id, product_id, name_ar, name_en, price, quantity,
                    special_instructions, options_json, item_total
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            foreach ($input['items'] as $item) {
                $itemId = $item['id'] ?? ('it-' . uniqid());
                $prod = $item['product'] ?? [];
                $optionsJson = json_encode($item['selectedOptions'] ?? [], JSON_UNESCAPED_UNICODE);
                $itemTotal = (float)($item['totalPrice'] ?? (($prod['price'] ?? 0) * ($item['quantity'] ?? 1)));

                $itemStmt->execute([
                    $itemId,
                    $orderId,
                    $prod['id'] ?? 'prd-1',
                    $prod['nameAr'] ?? 'وجبة / منتج',
                    $prod['nameEn'] ?? 'Item',
                    $prod['price'] ?? 0,
                    $item['quantity'] ?? 1,
                    $item['specialInstructions'] ?? '',
                    $optionsJson,
                    $itemTotal
                ]);
            }

            // If initial chat message exists
            if (!empty($input['chatMessages'])) {
                $cStmt = $pdo->prepare("INSERT INTO chat_messages (id, order_id, sender_role, sender_name, message) VALUES (?, ?, ?, ?, ?)");
                foreach ($input['chatMessages'] as $msg) {
                    $msgId = $msg['id'] ?? ('msg-' . uniqid());
                    $cStmt->execute([
                        $msgId,
                        $orderId,
                        $msg['senderRole'] ?? 'system',
                        $msg['senderName'] ?? 'النظام',
                        $msg['text'] ?? ''
                    ]);
                }
            }

            $pdo->commit();
            sendResponse([
                'status' => 'success',
                'message' => 'Order recorded in MySQL',
                'id' => $orderId,
                'trackingNumber' => $orderNumber
            ], 201);

        } catch (Exception $e) {
            $pdo->rollBack();
            error_log('[GO BAZAR] Order creation failed: ' . $e->getMessage());
            sendResponse(['status' => 'error', 'message' => 'Order creation failed. Please try again.'], 500);
        }
        break;

    case 'PUT':
        $input = getJsonInput();
        $id = $input['id'] ?? $_GET['id'] ?? null;
        if (!$id) {
            sendResponse(['status' => 'error', 'message' => 'Order ID is required'], 400);
        }

        $fields = [];
        $params = [];

        $map = [
            'status' => 'status',
            'paymentStatus' => 'payment_status',
            'prepTimeMinutes' => 'prep_time_minutes',
            'driverProgressPercent' => 'driver_progress_percent',
            'estimatedDeliveryMinutes' => 'estimated_minutes',
        ];

        foreach ($map as $camel => $snake) {
            if (isset($input[$camel])) {
                $fields[] = "`$snake` = ?";
                $params[] = $input[$camel];
            }
        }

        if (isset($input['driver']) && !empty($input['driver']['id'])) {
            $fields[] = "`driver_id` = ?";
            $params[] = $input['driver']['id'];
        } elseif (isset($input['driverId'])) {
            $fields[] = "`driver_id` = ?";
            $params[] = $input['driverId'];
        }

        if (isset($input['timestamps'])) {
            $fields[] = "`timestamps_json` = ?";
            $params[] = json_encode($input['timestamps'], JSON_UNESCAPED_UNICODE);
        }

        if (isset($input['rating'])) {
            $fields[] = "`rating_json` = ?";
            $params[] = json_encode($input['rating'], JSON_UNESCAPED_UNICODE);
        }

        if (empty($fields)) {
            sendResponse(['status' => 'error', 'message' => 'No fields to update'], 400);
        }

        $params[] = $id;
        $stmt = $pdo->prepare("UPDATE orders SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);

        sendResponse(['status' => 'success', 'message' => 'Order updated in MySQL']);
        break;

    default:
        sendResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}
