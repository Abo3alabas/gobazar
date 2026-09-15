<?php
/**
 * Stores and Merchants API Endpoint (PHP + MySQL)
 * Handles:
 *   - GET: list all stores (with optional ?type=restaurant|grocery) or single by ?id=xxx
 *   - POST: add new store (Admin)
 *   - PUT: update existing store (Admin / Merchant)
 *   - DELETE: remove store (Admin)
 */

require_once __DIR__ . '/db_config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

function formatStoreRow($row) {
    $tagsAr = json_decode($row['tags_ar_json'] ?? '[]', true) ?: [];
    $tagsEn = json_decode($row['tags_en_json'] ?? '[]', true) ?: [];
    if (empty($tagsAr) && !empty($row['tags_json'])) {
        $tagsAr = json_decode($row['tags_json'] ?? '[]', true) ?: [];
        $tagsEn = $tagsAr;
    }

    return [
        'id' => $row['id'],
        'nameAr' => $row['name_ar'],
        'nameEn' => $row['name_en'],
        'type' => $row['type'],
        'cuisineOrCategoryAr' => $row['cuisine_category_ar'] ?? '',
        'cuisineOrCategoryEn' => $row['cuisine_category_en'] ?? '',
        'rating' => (float)$row['rating'],
        'reviewCount' => (int)$row['review_count'],
        'deliveryTimeMin' => (int)$row['delivery_time_min'],
        'deliveryTimeMax' => (int)$row['delivery_time_max'],
        'deliveryFee' => (float)$row['delivery_fee'],
        'minOrder' => (float)$row['min_order'],
        'image' => $row['image'],
        'banner' => $row['banner'],
        'addressAr' => $row['address_ar'],
        'addressEn' => $row['address_en'],
        'coordinates' => [
            'lat' => (float)$row['lat'],
            'lng' => (float)$row['lng'],
        ],
        'isOpen' => (bool)$row['is_open'],
        'isFeatured' => (bool)($row['is_featured'] ?? false),
        'discountBadge' => $row['discount_badge'] ?? null,
        'tagsAr' => $tagsAr,
        'tagsEn' => $tagsEn,
    ];
}

if (!$pdo) {
    // If MySQL is not reachable, send fallback response or informative error
    sendResponse([
        'status' => 'fallback',
        'message' => 'Database connection offline, please verify credentials in db_config.php',
        'data' => []
    ], 200);
}

switch ($method) {
    case 'GET':
        if (isset($_GET['id']) && !empty($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT * FROM stores WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $row = $stmt->fetch();
            if ($row) {
                sendResponse(['status' => 'success', 'data' => formatStoreRow($row)]);
            } else {
                sendResponse(['status' => 'error', 'message' => 'Store not found'], 404);
            }
        } else {
            $type = $_GET['type'] ?? null;
            if ($type && in_array($type, ['restaurant', 'grocery'])) {
                $stmt = $pdo->prepare("SELECT * FROM stores WHERE type = ? ORDER BY is_featured DESC, rating DESC");
                $stmt->execute([$type]);
            } else {
                $stmt = $pdo->query("SELECT * FROM stores ORDER BY is_featured DESC, rating DESC");
            }
            $rows = $stmt->fetchAll();
            $data = array_map('formatStoreRow', $rows);
            sendResponse(['status' => 'success', 'count' => count($data), 'data' => $data]);
        }
        break;

    case 'POST':
        $input = getJsonInput();
        if (empty($input['nameAr']) && empty($input['name_ar'])) {
            sendResponse(['status' => 'error', 'message' => 'Store Arabic name is required'], 400);
        }

        $id = $input['id'] ?? ('store-' . time() . '-' . rand(100, 999));
        $nameAr = $input['nameAr'] ?? $input['name_ar'];
        $nameEn = $input['nameEn'] ?? $input['name_en'] ?? $nameAr;
        $type = $input['type'] ?? 'restaurant';
        $cuisineAr = $input['cuisineOrCategoryAr'] ?? $input['cuisine_category_ar'] ?? '';
        $cuisineEn = $input['cuisineOrCategoryEn'] ?? $input['cuisine_category_en'] ?? '';
        $rating = $input['rating'] ?? 4.90;
        $reviewCount = $input['reviewCount'] ?? 1;
        $deliveryFee = $input['deliveryFee'] ?? 1.99;
        $minTime = $input['deliveryTimeMin'] ?? 20;
        $maxTime = $input['deliveryTimeMax'] ?? 35;
        $minOrder = $input['minOrder'] ?? 10.00;
        $image = $input['image'] ?? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80';
        $banner = $input['banner'] ?? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80';
        $addressAr = $input['addressAr'] ?? 'صوفيا، شارع فيتوشا';
        $addressEn = $input['addressEn'] ?? 'Sofia, Vitosha Blvd';
        $lat = $input['coordinates']['lat'] ?? $input['lat'] ?? 42.6977;
        $lng = $input['coordinates']['lng'] ?? $input['lng'] ?? 23.3219;
        $isOpen = isset($input['isOpen']) ? (int)$input['isOpen'] : 1;
        $isFeatured = isset($input['isFeatured']) ? (int)$input['isFeatured'] : 0;
        $discountBadge = $input['discountBadge'] ?? null;
        $tagsAr = json_encode($input['tagsAr'] ?? ['شائع'], JSON_UNESCAPED_UNICODE);
        $tagsEn = json_encode($input['tagsEn'] ?? ['Popular'], JSON_UNESCAPED_UNICODE);

        $stmt = $pdo->prepare("
            INSERT INTO stores (
                id, name_ar, name_en, type, cuisine_category_ar, cuisine_category_en,
                rating, review_count, delivery_fee, delivery_time_min, delivery_time_max,
                min_order, image, banner, address_ar, address_en, lat, lng,
                is_open, is_featured, discount_badge, tags_ar_json, tags_en_json
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?
            )
        ");

        $stmt->execute([
            $id, $nameAr, $nameEn, $type, $cuisineAr, $cuisineEn,
            $rating, $reviewCount, $deliveryFee, $minTime, $maxTime,
            $minOrder, $image, $banner, $addressAr, $addressEn, $lat, $lng,
            $isOpen, $isFeatured, $discountBadge, $tagsAr, $tagsEn
        ]);

        sendResponse([
            'status' => 'success',
            'message' => 'Store created successfully in MySQL',
            'id' => $id
        ], 201);
        break;

    case 'PUT':
        $input = getJsonInput();
        $id = $input['id'] ?? $_GET['id'] ?? null;
        if (!$id) {
            sendResponse(['status' => 'error', 'message' => 'Store ID is required for update'], 400);
        }

        $fields = [];
        $params = [];

        $map = [
            'nameAr' => 'name_ar',
            'nameEn' => 'name_en',
            'type' => 'type',
            'cuisineOrCategoryAr' => 'cuisine_category_ar',
            'cuisineOrCategoryEn' => 'cuisine_category_en',
            'deliveryFee' => 'delivery_fee',
            'deliveryTimeMin' => 'delivery_time_min',
            'deliveryTimeMax' => 'delivery_time_max',
            'minOrder' => 'min_order',
            'image' => 'image',
            'banner' => 'banner',
            'addressAr' => 'address_ar',
            'addressEn' => 'address_en',
            'isOpen' => 'is_open',
            'isFeatured' => 'is_featured',
            'discountBadge' => 'discount_badge',
            'rating' => 'rating',
            'reviewCount' => 'review_count',
        ];

        foreach ($map as $camel => $snake) {
            if (isset($input[$camel])) {
                $fields[] = "`$snake` = ?";
                $params[] = is_bool($input[$camel]) ? (int)$input[$camel] : $input[$camel];
            }
        }

        if (isset($input['coordinates'])) {
            if (isset($input['coordinates']['lat'])) {
                $fields[] = "`lat` = ?";
                $params[] = $input['coordinates']['lat'];
            }
            if (isset($input['coordinates']['lng'])) {
                $fields[] = "`lng` = ?";
                $params[] = $input['coordinates']['lng'];
            }
        }

        if (isset($input['tagsAr'])) {
            $fields[] = "`tags_ar_json` = ?";
            $params[] = json_encode($input['tagsAr'], JSON_UNESCAPED_UNICODE);
        }
        if (isset($input['tagsEn'])) {
            $fields[] = "`tags_en_json` = ?";
            $params[] = json_encode($input['tagsEn'], JSON_UNESCAPED_UNICODE);
        }

        if (empty($fields)) {
            sendResponse(['status' => 'error', 'message' => 'No fields provided for update'], 400);
        }

        $params[] = $id;
        $stmt = $pdo->prepare("UPDATE stores SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);

        sendResponse(['status' => 'success', 'message' => 'Store updated successfully in MySQL']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            $input = getJsonInput();
            $id = $input['id'] ?? null;
        }

        if (!$id) {
            sendResponse(['status' => 'error', 'message' => 'Store ID required for deletion'], 400);
        }

        // Delete products first (or CASCADE)
        $pStmt = $pdo->prepare("DELETE FROM products WHERE store_id = ?");
        $pStmt->execute([$id]);

        $stmt = $pdo->prepare("DELETE FROM stores WHERE id = ?");
        $stmt->execute([$id]);

        sendResponse(['status' => 'success', 'message' => 'Store and its products deleted from MySQL']);
        break;

    default:
        sendResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}
