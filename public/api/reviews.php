<?php
/**
 * Customer Reviews & Ratings API Endpoint (PHP + MySQL)
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
        $storeId = $_GET['store_id'] ?? null;

        if ($orderId) {
            $stmt = $pdo->prepare("SELECT * FROM reviews WHERE order_id = ?");
            $stmt->execute([$orderId]);
        } elseif ($storeId) {
            $stmt = $pdo->prepare("SELECT * FROM reviews WHERE store_id = ? ORDER BY created_at DESC LIMIT 50");
            $stmt->execute([$storeId]);
        } else {
            $stmt = $pdo->query("SELECT * FROM reviews ORDER BY created_at DESC LIMIT 50");
        }

        $reviews = $stmt->fetchAll();
        sendResponse(['status' => 'success', 'data' => $reviews]);
        break;

    case 'POST':
        $input = getJsonInput();
        $orderId = $input['orderId'] ?? null;
        $rating = $input['rating'] ?? $input;

        if (!$orderId) {
            sendResponse(['status' => 'error', 'message' => 'orderId is required'], 400);
        }

        $id = 'rev-' . time() . '-' . rand(100, 999);
        $storeStars = (int)($rating['storeStars'] ?? $rating['stars'] ?? 5);
        $driverStars = (int)($rating['driverStars'] ?? $rating['stars'] ?? 5);
        $foodQuality = (int)($rating['storeFoodQuality'] ?? 5);
        $packaging = (int)($rating['storePackaging'] ?? 5);
        $driverSpeed = (int)($rating['driverSpeedRating'] ?? $rating['speedRating'] ?? 5);
        $driverPolite = (int)($rating['driverPoliteness'] ?? 5);
        $tipAmount = (float)($rating['tipAmount'] ?? 0.0);
        $comment = $rating['storeComment'] ?? $rating['driverComment'] ?? $rating['comment'] ?? '';

        // Find store_id and driver_id from orders
        $oStmt = $pdo->prepare("SELECT store_id, driver_id FROM orders WHERE id = ?");
        $oStmt->execute([$orderId]);
        $orderRow = $oStmt->fetch();

        $storeId = $orderRow['store_id'] ?? ($input['storeId'] ?? 'st-1');
        $driverId = $orderRow['driver_id'] ?? ($input['driverId'] ?? null);

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("
                INSERT INTO reviews (
                    id, order_id, customer_id, store_id, driver_id,
                    store_rating, driver_rating, food_quality, packaging,
                    driver_speed, driver_politeness, tip_amount, comment
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $id, $orderId, $input['customerId'] ?? 'usr-cust-1',
                $storeId, $driverId, $storeStars, $driverStars,
                $foodQuality, $packaging, $driverSpeed, $driverPolite,
                $tipAmount, $comment
            ]);

            // Update order rating_json
            $uOrder = $pdo->prepare("UPDATE orders SET rating_json = ? WHERE id = ?");
            $uOrder->execute([json_encode($rating, JSON_UNESCAPED_UNICODE), $orderId]);

            // Update store average rating
            if ($storeId) {
                $calcStore = $pdo->prepare("SELECT AVG(store_rating) as avg_rating, COUNT(*) as cnt FROM reviews WHERE store_id = ?");
                $calcStore->execute([$storeId]);
                $sRes = $calcStore->fetch();
                if ($sRes && $sRes['cnt'] > 0) {
                    $upStore = $pdo->prepare("UPDATE stores SET rating = ?, review_count = review_count + 1 WHERE id = ?");
                    $upStore->execute([round((float)$sRes['avg_rating'], 2), $storeId]);
                }
            }

            // Update driver average rating & wallet
            if ($driverId) {
                $calcDrv = $pdo->prepare("SELECT AVG(driver_rating) as avg_rating, COUNT(*) as cnt FROM reviews WHERE driver_id = ?");
                $calcDrv->execute([$driverId]);
                $dRes = $calcDrv->fetch();
                if ($dRes && $dRes['cnt'] > 0) {
                    $upDrv = $pdo->prepare("
                        UPDATE drivers SET
                            rating = ?,
                            rating_count = rating_count + 1,
                            wallet_balance = wallet_balance + ?,
                            today_earnings = today_earnings + ?
                        WHERE id = ?
                    ");
                    $upDrv->execute([round((float)$dRes['avg_rating'], 2), $tipAmount, $tipAmount, $driverId]);
                }
            }

            $pdo->commit();
            sendResponse(['status' => 'success', 'message' => 'Review recorded and synced in MySQL', 'id' => $id], 201);
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log('[GO BAZAR] Review save failed: ' . $e->getMessage());
            sendResponse(['status' => 'error', 'message' => 'Failed to save review. Please try again.'], 500);
        }
        break;

    default:
        sendResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}
