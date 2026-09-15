<?php
/**
 * Products / Dishes / Supermarket Goods API Endpoint (PHP + MySQL)
 * Handles:
 *   - GET: list products (filterable by ?store_id=xxx, ?category=xxx, ?type=restaurant|grocery)
 *   - POST: add new product (Merchant/Admin)
 *   - PUT: update product or toggle availability
 *   - DELETE: remove product
 */

require_once __DIR__ . '/db_config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

function formatProductRow($row) {
    $optionGroups = json_decode($row['option_groups_json'] ?? '[]', true) ?: [];

    return [
        'id' => $row['id'],
        'storeId' => $row['store_id'],
        'nameAr' => $row['name_ar'],
        'nameEn' => $row['name_en'],
        'descriptionAr' => $row['description_ar'] ?? '',
        'descriptionEn' => $row['description_en'] ?? '',
        'price' => (float)$row['price'],
        'originalPrice' => isset($row['original_price']) && $row['original_price'] !== null ? (float)$row['original_price'] : null,
        'image' => $row['image'],
        'category' => $row['category'],
        'isPopular' => (bool)($row['is_popular'] ?? false),
        'isAvailable' => isset($row['is_available']) ? (bool)$row['is_available'] : true,
        'calories' => isset($row['calories']) && $row['calories'] !== null ? (int)$row['calories'] : null,
        'unitAr' => $row['unit_ar'] ?? null,
        'unitEn' => $row['unit_en'] ?? null,
        'optionGroups' => $optionGroups,
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
        $storeId = $_GET['store_id'] ?? null;
        $category = $_GET['category'] ?? null;

        $conditions = [];
        $params = [];

        if ($storeId) {
            $conditions[] = "store_id = ?";
            $params[] = $storeId;
        }

        if ($category && $category !== 'all') {
            $conditions[] = "category = ?";
            $params[] = $category;
        }

        $sql = "SELECT * FROM products";
        if (!empty($conditions)) {
            $sql .= " WHERE " . implode(" AND ", $conditions);
        }
        $sql .= " ORDER BY is_popular DESC, price ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        $data = array_map('formatProductRow', $rows);

        sendResponse(['status' => 'success', 'count' => count($data), 'data' => $data]);
        break;

    case 'POST':
        $input = getJsonInput();
        $storeId = $input['storeId'] ?? $input['store_id'] ?? null;
        $nameAr = $input['nameAr'] ?? $input['name_ar'] ?? null;
        $price = $input['price'] ?? null;

        if (!$storeId || !$nameAr || $price === null) {
            sendResponse(['status' => 'error', 'message' => 'storeId, nameAr and price are required'], 400);
        }

        $id = $input['id'] ?? ('prod-' . time() . '-' . rand(100, 999));
        $nameEn = $input['nameEn'] ?? $input['name_en'] ?? $nameAr;
        $descAr = $input['descriptionAr'] ?? $input['description_ar'] ?? '';
        $descEn = $input['descriptionEn'] ?? $input['description_en'] ?? '';
        $origPrice = $input['originalPrice'] ?? $input['original_price'] ?? null;
        $image = $input['image'] ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
        $category = $input['category'] ?? 'main';
        $isPopular = isset($input['isPopular']) ? (int)$input['isPopular'] : 0;
        $isAvailable = isset($input['isAvailable']) ? (int)$input['isAvailable'] : 1;
        $calories = $input['calories'] ?? null;
        $unitAr = $input['unitAr'] ?? $input['unit_ar'] ?? null;
        $unitEn = $input['unitEn'] ?? $input['unit_en'] ?? null;
        $optionsJson = json_encode($input['optionGroups'] ?? $input['option_groups'] ?? [], JSON_UNESCAPED_UNICODE);

        $stmt = $pdo->prepare("
            INSERT INTO products (
                id, store_id, name_ar, name_en, description_ar, description_en,
                price, original_price, image, category, is_popular, is_available,
                calories, unit_ar, unit_en, option_groups_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $id, $storeId, $nameAr, $nameEn, $descAr, $descEn,
            $price, $origPrice, $image, $category, $isPopular, $isAvailable,
            $calories, $unitAr, $unitEn, $optionsJson
        ]);

        sendResponse(['status' => 'success', 'message' => 'Product saved in MySQL', 'id' => $id], 201);
        break;

    case 'PUT':
        $input = getJsonInput();
        $id = $input['id'] ?? $_GET['id'] ?? null;
        if (!$id) {
            sendResponse(['status' => 'error', 'message' => 'Product ID required'], 400);
        }

        $fields = [];
        $params = [];

        $map = [
            'nameAr' => 'name_ar',
            'nameEn' => 'name_en',
            'descriptionAr' => 'description_ar',
            'descriptionEn' => 'description_en',
            'price' => 'price',
            'originalPrice' => 'original_price',
            'image' => 'image',
            'category' => 'category',
            'isPopular' => 'is_popular',
            'isAvailable' => 'is_available',
            'calories' => 'calories',
            'unitAr' => 'unit_ar',
            'unitEn' => 'unit_en',
        ];

        foreach ($map as $camel => $snake) {
            if (isset($input[$camel])) {
                $fields[] = "`$snake` = ?";
                $params[] = is_bool($input[$camel]) ? (int)$input[$camel] : $input[$camel];
            }
        }

        if (isset($input['optionGroups'])) {
            $fields[] = "`option_groups_json` = ?";
            $params[] = json_encode($input['optionGroups'], JSON_UNESCAPED_UNICODE);
        }

        if (empty($fields)) {
            sendResponse(['status' => 'error', 'message' => 'No fields to update'], 400);
        }

        $params[] = $id;
        $stmt = $pdo->prepare("UPDATE products SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);

        sendResponse(['status' => 'success', 'message' => 'Product updated in MySQL']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            $input = getJsonInput();
            $id = $input['id'] ?? null;
        }

        if (!$id) {
            sendResponse(['status' => 'error', 'message' => 'Product ID required'], 400);
        }

        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);

        sendResponse(['status' => 'success', 'message' => 'Product deleted from MySQL']);
        break;

    default:
        sendResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}
