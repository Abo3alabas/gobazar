<?php
/**
 * Driver Fleet Management API (PHP + MySQL)
 * Handles:
 *   - GET: list drivers (filterable by status)
 *   - POST: add new driver (Admin)
 *   - PUT: update driver profile, location, wallet, status
 *   - DELETE: remove driver (Admin)
 */

require_once __DIR__ . '/db_config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

function formatDriverRow($row) {
    $praises = json_decode($row['praises_json'] ?? '[]', true) ?: [];
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'phone' => $row['phone'],
        'avatar' => $row['avatar'],
        'status' => $row['status'],
        'vehicleType' => $row['vehicle_type'],
        'vehiclePlate' => $row['vehicle_plate'],
        'rating' => (float)$row['rating'],
        'ratingCount' => (int)($row['rating_count'] ?? 1),
        'totalDeliveries' => (int)$row['total_deliveries'],
        'acceptanceRate' => (int)$row['acceptance_rate'],
        'walletBalance' => (float)$row['wallet_balance'],
        'todayEarnings' => (float)$row['today_earnings'],
        'todayTrips' => (int)$row['today_trips'],
        'currentOrderId' => $row['current_order_id'] ?? null,
        'coordinates' => [
            'lat' => (float)$row['current_lat'],
            'lng' => (float)$row['current_lng'],
        ],
        'praises' => $praises,
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
        $status = $_GET['status'] ?? null;
        if ($status && in_array($status, ['online', 'busy', 'offline'])) {
            $stmt = $pdo->prepare("SELECT * FROM drivers WHERE status = ? ORDER BY rating DESC");
            $stmt->execute([$status]);
        } else {
            $stmt = $pdo->query("SELECT * FROM drivers ORDER BY status = 'online' DESC, rating DESC");
        }
        $rows = $stmt->fetchAll();
        $data = array_map('formatDriverRow', $rows);
        sendResponse(['status' => 'success', 'count' => count($data), 'data' => $data]);
        break;

    case 'POST':
        $input = getJsonInput();
        $name = $input['name'] ?? null;
        $phone = $input['phone'] ?? null;

        if (!$name || !$phone) {
            sendResponse(['status' => 'error', 'message' => 'Driver name and phone are required'], 400);
        }

        $id = $input['id'] ?? ('drv-' . time() . '-' . rand(100, 999));
        $avatar = $input['avatar'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
        $plate = $input['vehiclePlate'] ?? $input['vehicle_plate'] ?? 'CB 0000 XX';
        $vehicleType = $input['vehicleType'] ?? $input['vehicle_type'] ?? 'scooter';
        $status = $input['status'] ?? 'online';
        $rating = $input['rating'] ?? 5.0;
        $ratingCount = $input['ratingCount'] ?? 1;
        $totalDeliveries = $input['totalDeliveries'] ?? 0;
        $acceptanceRate = $input['acceptanceRate'] ?? 98;
        $wallet = $input['walletBalance'] ?? 0.00;
        $todayEarn = $input['todayEarnings'] ?? 0.00;
        $todayTrips = $input['todayTrips'] ?? 0;
        $lat = $input['coordinates']['lat'] ?? $input['current_lat'] ?? 42.6977;
        $lng = $input['coordinates']['lng'] ?? $input['current_lng'] ?? 23.3219;
        $praises = json_encode($input['praises'] ?? ['سريع ومحترم', 'أصيل صوفيا'], JSON_UNESCAPED_UNICODE);

        $stmt = $pdo->prepare("
            INSERT INTO drivers (
                id, name, phone, avatar, vehicle_plate, vehicle_type, status,
                rating, rating_count, total_deliveries, acceptance_rate, wallet_balance,
                today_earnings, today_trips, current_lat, current_lng, praises_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $id, $name, $phone, $avatar, $plate, $vehicleType, $status,
            $rating, $ratingCount, $totalDeliveries, $acceptanceRate, $wallet,
            $todayEarn, $todayTrips, $lat, $lng, $praises
        ]);

        sendResponse(['status' => 'success', 'message' => 'Driver created in MySQL', 'id' => $id], 201);
        break;

    case 'PUT':
        $input = getJsonInput();
        $id = $input['id'] ?? $_GET['id'] ?? null;
        if (!$id) {
            sendResponse(['status' => 'error', 'message' => 'Driver ID is required'], 400);
        }

        $fields = [];
        $params = [];

        $map = [
            'name' => 'name',
            'phone' => 'phone',
            'avatar' => 'avatar',
            'vehiclePlate' => 'vehicle_plate',
            'vehicleType' => 'vehicle_type',
            'status' => 'status',
            'rating' => 'rating',
            'ratingCount' => 'rating_count',
            'totalDeliveries' => 'total_deliveries',
            'acceptanceRate' => 'acceptance_rate',
            'walletBalance' => 'wallet_balance',
            'todayEarnings' => 'today_earnings',
            'todayTrips' => 'today_trips',
            'currentOrderId' => 'current_order_id',
        ];

        foreach ($map as $camel => $snake) {
            if (isset($input[$camel])) {
                $fields[] = "`$snake` = ?";
                $params[] = $input[$camel];
            }
        }

        if (isset($input['coordinates'])) {
            if (isset($input['coordinates']['lat'])) {
                $fields[] = "`current_lat` = ?";
                $params[] = $input['coordinates']['lat'];
            }
            if (isset($input['coordinates']['lng'])) {
                $fields[] = "`current_lng` = ?";
                $params[] = $input['coordinates']['lng'];
            }
        }

        if (isset($input['praises'])) {
            $fields[] = "`praises_json` = ?";
            $params[] = json_encode($input['praises'], JSON_UNESCAPED_UNICODE);
        }

        if (empty($fields)) {
            sendResponse(['status' => 'error', 'message' => 'No fields provided'], 400);
        }

        $params[] = $id;
        $stmt = $pdo->prepare("UPDATE drivers SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);

        sendResponse(['status' => 'success', 'message' => 'Driver updated in MySQL']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            $input = getJsonInput();
            $id = $input['id'] ?? null;
        }

        if (!$id) {
            sendResponse(['status' => 'error', 'message' => 'Driver ID required'], 400);
        }

        $stmt = $pdo->prepare("DELETE FROM drivers WHERE id = ?");
        $stmt->execute([$id]);

        sendResponse(['status' => 'success', 'message' => 'Driver deleted from MySQL']);
        break;

    default:
        sendResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}
