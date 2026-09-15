-- ==========================================================
-- SOFIA EXPRESS DELIVERY PLATFORM - COMPLETE MYSQL SCHEMA
-- جاهز للاستيراد في Hostinger phpMyAdmin (MySQL / MariaDB)
-- متوافق 100% مع واجهة React و PHP API
-- Encoding: utf8mb4_unicode_ci
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
-- Force the import connection itself to UTF-8 (utf8mb4). Without this, importing
-- via a plain `mysql` CLI (as opposed to phpMyAdmin's UI, which usually sets this
-- automatically) can corrupt the Arabic seed text even though the columns are
-- utf8mb4 — the bytes get mangled on the way in. Safe to keep for phpMyAdmin too.
SET NAMES utf8mb4;

-- 1. جدول المستخدمين والحسابات (Users & Profiles)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `phone` VARCHAR(32) NOT NULL,
  `role` ENUM('customer', 'driver', 'merchant', 'admin') NOT NULL DEFAULT 'customer',
  `password_hash` VARCHAR(255) NULL,
  `avatar` TEXT NULL,
  `default_address_ar` TEXT NULL,
  `default_address_en` TEXT NULL,
  `language` VARCHAR(5) NOT NULL DEFAULT 'ar',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. جدول المتاجر والمطاعم والسوبرماركت (Stores & Merchants)
DROP TABLE IF EXISTS `stores`;
CREATE TABLE `stores` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name_ar` VARCHAR(191) NOT NULL,
  `name_en` VARCHAR(191) NOT NULL,
  `type` ENUM('restaurant', 'grocery') NOT NULL DEFAULT 'restaurant',
  `cuisine_category_ar` VARCHAR(191) NOT NULL,
  `cuisine_category_en` VARCHAR(191) NOT NULL,
  `rating` DECIMAL(3, 2) NOT NULL DEFAULT 4.90,
  `review_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `delivery_fee` DECIMAL(6, 2) NOT NULL DEFAULT 1.99,
  `delivery_time_min` INT UNSIGNED NOT NULL DEFAULT 20,
  `delivery_time_max` INT UNSIGNED NOT NULL DEFAULT 35,
  `min_order` DECIMAL(6, 2) NOT NULL DEFAULT 10.00,
  `image` TEXT NOT NULL,
  `banner` TEXT NOT NULL,
  `address_ar` VARCHAR(255) NOT NULL,
  `address_en` VARCHAR(255) NOT NULL,
  `lat` DECIMAL(10, 8) NOT NULL DEFAULT 42.6977,
  `lng` DECIMAL(11, 8) NOT NULL DEFAULT 23.3219,
  `is_open` TINYINT(1) NOT NULL DEFAULT 1,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `discount_badge` VARCHAR(100) NULL,
  `tags_ar_json` JSON NULL,
  `tags_en_json` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. جدول المنتجات والوجبات والبضائع (Products / Meals / Goods)
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `store_id` VARCHAR(64) NOT NULL,
  `name_ar` VARCHAR(191) NOT NULL,
  `name_en` VARCHAR(191) NOT NULL,
  `description_ar` TEXT NOT NULL,
  `description_en` TEXT NOT NULL,
  `price` DECIMAL(6, 2) NOT NULL,
  `original_price` DECIMAL(6, 2) NULL,
  `image` TEXT NOT NULL,
  `category` VARCHAR(64) NOT NULL DEFAULT 'main',
  `is_popular` TINYINT(1) NOT NULL DEFAULT 0,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `calories` INT UNSIGNED NULL,
  `unit_ar` VARCHAR(32) NULL,
  `unit_en` VARCHAR(32) NULL,
  `option_groups_json` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. جدول أسطول المناديب والكباتن (Driver Fleet Profiles)
DROP TABLE IF EXISTS `drivers`;
CREATE TABLE `drivers` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NULL,
  `name` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(32) NOT NULL,
  `avatar` TEXT NOT NULL,
  `vehicle_plate` VARCHAR(32) NOT NULL,
  `vehicle_type` ENUM('scooter', 'car', 'bicycle') NOT NULL DEFAULT 'scooter',
  `status` ENUM('online', 'busy', 'offline') NOT NULL DEFAULT 'online',
  `rating` DECIMAL(3, 2) NOT NULL DEFAULT 4.90,
  `rating_count` INT UNSIGNED NOT NULL DEFAULT 1,
  `total_deliveries` INT UNSIGNED NOT NULL DEFAULT 0,
  `acceptance_rate` INT UNSIGNED NOT NULL DEFAULT 98,
  `wallet_balance` DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
  `today_earnings` DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
  `today_trips` INT UNSIGNED NOT NULL DEFAULT 0,
  `current_order_id` VARCHAR(64) NULL,
  `current_lat` DECIMAL(10, 8) NOT NULL DEFAULT 42.6977,
  `current_lng` DECIMAL(11, 8) NOT NULL DEFAULT 23.3219,
  `praises_json` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. جدول الطلبات (Orders)
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `order_number` VARCHAR(32) NOT NULL UNIQUE,
  `customer_id` VARCHAR(64) NOT NULL,
  `customer_name` VARCHAR(191) NOT NULL,
  `customer_phone` VARCHAR(32) NOT NULL,
  `store_id` VARCHAR(64) NOT NULL,
  `store_name_ar` VARCHAR(191) NOT NULL,
  `store_name_en` VARCHAR(191) NOT NULL,
  `store_type` ENUM('restaurant', 'grocery') NOT NULL DEFAULT 'restaurant',
  `store_image` TEXT NULL,
  `store_lat` DECIMAL(10, 8) NOT NULL DEFAULT 42.6934,
  `store_lng` DECIMAL(11, 8) NOT NULL DEFAULT 23.3210,
  `customer_lat` DECIMAL(10, 8) NOT NULL DEFAULT 42.6977,
  `customer_lng` DECIMAL(11, 8) NOT NULL DEFAULT 23.3219,
  `driver_id` VARCHAR(64) NULL,
  `status` ENUM(
    'pending',
    'accepted',
    'preparing',
    'ready_for_pickup',
    'driver_assigned',
    'on_the_way',
    'delivered',
    'cancelled'
  ) NOT NULL DEFAULT 'pending',
  `subtotal` DECIMAL(8, 2) NOT NULL,
  `delivery_fee` DECIMAL(6, 2) NOT NULL,
  `service_fee` DECIMAL(6, 2) NOT NULL DEFAULT 0.99,
  `discount` DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
  `tip` DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(8, 2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'EUR',
  `payment_method` ENUM('card', 'apple_pay', 'mada', 'wallet', 'cash') NOT NULL DEFAULT 'cash',
  `payment_status` ENUM('paid', 'pending', 'cod') NOT NULL DEFAULT 'pending',
  `delivery_address` TEXT NOT NULL,
  `delivery_notes` TEXT NULL,
  `timestamps_json` JSON NULL,
  `rating_json` JSON NULL,
  `estimated_minutes` INT UNSIGNED NOT NULL DEFAULT 25,
  `driver_progress_percent` INT UNSIGNED NOT NULL DEFAULT 0,
  `prep_time_minutes` INT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. جدول عناصر وتفاصيل الطلب (Order Items)
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `order_id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `name_ar` VARCHAR(191) NOT NULL,
  `name_en` VARCHAR(191) NOT NULL,
  `price` DECIMAL(6, 2) NOT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `special_instructions` TEXT NULL,
  `options_json` JSON NULL,
  `item_total` DECIMAL(8, 2) NOT NULL,
  `image` TEXT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. جدول تقييمات العملاء (Reviews & Ratings)
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `order_id` VARCHAR(64) NOT NULL,
  `customer_id` VARCHAR(64) NOT NULL,
  `store_id` VARCHAR(64) NOT NULL,
  `driver_id` VARCHAR(64) NULL,
  `store_rating` INT UNSIGNED NOT NULL DEFAULT 5,
  `driver_rating` INT UNSIGNED NOT NULL DEFAULT 5,
  `food_quality` INT UNSIGNED NULL,
  `packaging` INT UNSIGNED NULL,
  `driver_speed` INT UNSIGNED NULL,
  `driver_politeness` INT UNSIGNED NULL,
  `tip_amount` DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
  `comment` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. جدول رسائل الدردشة الحية (Chat Messages)
DROP TABLE IF EXISTS `chat_messages`;
CREATE TABLE `chat_messages` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `order_id` VARCHAR(64) NOT NULL,
  `sender_role` ENUM('customer', 'driver', 'system', 'admin', 'store') NOT NULL,
  `sender_name` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================================
-- فهارس أداء إضافية (Performance Indexes)
-- تُسرّع استعلامات التصفية/الفرز المتكررة من واجهات الـ API،
-- خصوصاً مع تحديث التطبيق التلقائي (polling) كل بضع ثوانٍ.
-- أعمدة المفاتيح الأجنبية (store_id, order_id, driver_id...) مفهرسة
-- تلقائياً بواسطة InnoDB عبر قيود FOREIGN KEY، لذلك لا حاجة لتكرارها هنا.
-- ==========================================================
CREATE INDEX `idx_stores_type` ON `stores` (`type`);
CREATE INDEX `idx_drivers_status` ON `drivers` (`status`);
CREATE INDEX `idx_orders_status` ON `orders` (`status`);
CREATE INDEX `idx_orders_customer` ON `orders` (`customer_id`);
CREATE INDEX `idx_orders_created` ON `orders` (`created_at`);
CREATE INDEX `idx_reviews_store` ON `reviews` (`store_id`);
CREATE INDEX `idx_reviews_driver` ON `reviews` (`driver_id`);
CREATE INDEX `idx_chat_order_created` ON `chat_messages` (`order_id`, `created_at`);

-- ==========================================================
-- بيانات أولية جاهزة لصوفيا - بلغاريا (Initial Seeding Data)
-- ==========================================================

INSERT INTO `stores` (`id`, `name_ar`, `name_en`, `type`, `cuisine_category_ar`, `cuisine_category_en`, `rating`, `review_count`, `delivery_fee`, `delivery_time_min`, `delivery_time_max`, `min_order`, `image`, `banner`, `address_ar`, `address_en`, `lat`, `lng`, `is_open`, `is_featured`, `discount_badge`, `tags_ar_json`, `tags_en_json`) VALUES
('st-1', 'شاورما الشام صوفيا', 'Al-Sham Shawarma Sofia', 'restaurant', 'شاورما سورية ومشويات', 'Syrian Shawarma & Grills', 4.95, 142, 1.49, 20, 30, 8.00, 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1000&auto=format&fit=crop&q=80', 'شارع فيتوشا 42، وسط صوفيا', '42 Vitosha Blvd, Sofia Center', 42.69340000, 23.32100000, 1, 1, 'خصم 15% كود SHAM', '["حلال", "شاورما", "مشاوي"]', '["Halal", "Shawarma", "Grill"]'),
('st-2', 'برجر كرافت صوفيا', 'Craft Burger Sofia', 'restaurant', 'برجر لحم ودجاج أمريكي فاخر', 'Gourmet Beef & Crispy Chicken', 4.88, 98, 1.99, 25, 40, 10.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1000&auto=format&fit=crop&q=80', 'شارع غراف إغناتييف 18، صوفيا', '18 Graf Ignatiev St, Sofia', 42.69120000, 23.32550000, 1, 1, NULL, '["برجر", "بطاطس", "سريع"]', '["Burgers", "Fries", "Fast"]'),
('st-3', 'بيلا إيطاليا صوفيا', 'Bella Italia Pizzeria', 'restaurant', 'بيتزا حطب وباستا طازجة', 'Woodfired Pizza & Fresh Pasta', 4.92, 115, 2.20, 30, 45, 12.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1000&auto=format&fit=crop&q=80', 'شارع تسار أوسڤوبوديتيل 10', '10 Tsar Osvoboditel Blvd, Sofia', 42.69580000, 23.33120000, 1, 0, 'عرض 1+1 بيتزا مجاناً', '["بيتزا", "باستا", "إيطالي"]', '["Pizza", "Pasta", "Italian"]'),
('st-4', 'بيلا بلقان سوبرماركت', 'Billa Balkan Supermarket', 'grocery', 'ألبان وأجبان ولحوم وخضار قطاف اليوم', 'Fresh Dairy, Meats & Fresh Bio Produce', 4.91, 230, 1.49, 15, 30, 10.00, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&auto=format&fit=crop&q=80', 'بوليفارد بلغاريا 69، صوفيا', '69 Bulgaria Blvd, Sofia', 42.66800000, 23.29200000, 1, 1, 'عروض نهاية الأسبوع', '["خضار", "ألبان", "لحوم", "تموينات"]', '["Vegetables", "Dairy", "Meat", "Groceries"]'),
('st-5', 'فرن ومخبز البانيتسا صوفيا', 'Sofia Fresh Banitsa & Bakery', 'grocery', 'بانيتسا بلغارية ساخنة ومعجنات دافئة', 'Warm Traditional Banitsa & Pastries', 4.96, 310, 0.99, 15, 25, 5.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80', 'شارع بيتوفا 12، صوفيا', '12 Bitolya St, Sofia', 42.67300000, 23.30500000, 1, 1, 'طازج من الفرن', '["بانيتسا", "مخبوزات", "فطور"]', '["Banitsa", "Bakery", "Breakfast"]');

INSERT INTO `products` (`id`, `store_id`, `name_ar`, `name_en`, `description_ar`, `description_en`, `price`, `original_price`, `image`, `category`, `is_popular`, `is_available`, `calories`, `unit_ar`, `unit_en`, `option_groups_json`) VALUES
('p-1', 'st-1', 'شاورما دجاج سوري عربي سوبر', 'Syrian Chicken Shawarma Arabic Plate', 'قطع شاورما دجاج متبلة بالبهارات الشامية مع صوص الثومية، مخلل، وبطاطا مقلية مقرمشة', 'Sliced spiced Syrian chicken shawarma with garlic toum, pickles & crispy fries', 6.90, 8.50, 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&auto=format&fit=crop&q=80', 'shawarma', 1, 1, 680, NULL, NULL, '[{"id":"og-size","titleAr":"حجم الوجبة","titleEn":"Meal Size","required":true,"options":[{"id":"opt-1","nameAr":"حجم عادي (ساندوتش)","nameEn":"Regular Size","priceDelta":0},{"id":"opt-2","nameAr":"حجم دبل عربي مع صحن مقبلات","nameEn":"Double Arabic Plate","priceDelta":2.5}]}]'),
('p-2', 'st-1', 'ساندوتش كباب حلبي مشوي على الفحم', 'Charcoal Aleppo Kebab Roll', 'سيخين كباب لحم بلدي طازج مع البقدونس والبصل وصوص الطحينة في خبز التنور', 'Fresh grilled Aleppo minced meat kebab with parsley, onion and tahini in flatbread', 7.50, NULL, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80', 'shawarma', 1, 1, 720, NULL, NULL, '[]'),
('p-3', 'st-2', 'برجر كرافت بلاك آنجوس دبل تشيز', 'Double Black Angus Cheese Burger', 'شريحتين لحم آنجوس مشوي مع جبنة شيدر مذابة، بصل مكرمل وصوص كرافت الخاص', 'Two grilled Angus beef patties, double melted cheddar, caramelized onions & craft sauce', 8.90, 10.50, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80', 'burgers', 1, 1, 850, NULL, NULL, '[]'),
('p-4', 'st-3', 'بيتزا تروفل ومشروم نابولية أصلية', 'Truffle & Forest Mushroom Neapolitan Pizza', 'عجينة نابولية مخمرة 48 ساعة، جبنة فيور دي لاتيه، فطر بري طازج، وزيت الكمأة العطري', '48h fermented dough, Fior di latte mozzarella, wild mushrooms and fragrant truffle oil', 9.50, 11.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80', 'pizza', 1, 1, 780, NULL, NULL, '[]'),
('p-5', 'st-4', 'حليب بلقاني طازج كامل الدسم (1 لتر)', 'Balkan Fresh Whole Milk 3.6% (1L)', 'حليب بقر طازج مبستر كامل الدسم من مزارع جبال البلقان البلغارية', 'Fresh pasteurized whole cow milk from Bulgarian Balkan pastures', 1.85, NULL, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80', 'dairy', 1, 1, 130, 'عبوة 1 لتر', '1 Liter Pack', '[]'),
('p-6', 'st-4', 'جبنة بيضاء بلغارية أصلية (سيريني)', 'Authentic Bulgarian White Sirene Cheese (400g)', 'جبنة بيضاء بلغارية تقليدية مصنوعة من حليب الأبقار الطبيعي معتقة في المحلول الملحي', 'Traditional Bulgarian white brined cheese made from pure cows milk (400g block)', 4.20, 4.90, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=80', 'dairy', 1, 1, 240, 'قالب 400 جم', '400g Block', '[]'),
('p-7', 'st-4', 'طماطم بلقانية وردية طازجة (1 كجم)', 'Bulgarian Pink Tomatoes Fresh (1kg)', 'طماطم وردية جبلية ممتازة ذات مذاق حلو وعصير غني قطاف اليوم', 'Sweet and juicy traditional Balkan pink heirloom tomatoes, daily harvest', 2.80, 3.40, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80', 'fruitsVeg', 1, 1, 22, 'لكل 1 كجم', 'Per 1 kg', '[]'),
('p-8', 'st-5', 'بانيتسا بلغارية تقليدية بالجبن والبيض', 'Traditional Bulgarian Banitsa with Cheese & Eggs', 'طبقات رقيقة مقرمشة محشوة بالجبنة البيضاء والبيض الطازج والزبدة الذهبية', 'Crispy golden phyllo layers baked with rich Bulgarian cheese, eggs and pure butter', 2.50, NULL, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80', 'bakery', 1, 1, 420, 'قطعة طازجة', '1 Fresh Piece', '[]');

INSERT INTO `drivers` (`id`, `name`, `phone`, `avatar`, `vehicle_plate`, `vehicle_type`, `status`, `rating`, `rating_count`, `total_deliveries`, `acceptance_rate`, `wallet_balance`, `today_earnings`, `today_trips`, `current_lat`, `current_lng`, `praises_json`) VALUES
('drv-1', 'ستيفان إيفانوف (Stefan Ivanov)', '+359 88 412 8899', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', 'CB 7721 PK', 'scooter', 'online', 4.96, 84, 142, 99, 148.50, 32.40, 6, 42.69770000, 23.32190000, '["سريع جداً ⚡", "لبق ومحترم 👍", "حافظ على سخونة الطعام ♨️"]'),
('drv-2', 'ديميتار بوبوف (Dimitar Popov)', '+359 87 654 3210', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', 'CA 3319 TK', 'scooter', 'online', 4.91, 56, 98, 97, 85.20, 18.50, 4, 42.69200000, 23.32800000, '["دقيق في الموعد ⏱️", "تعامل راقي"]'),
('drv-3', 'ألكسندر بتروف (Aleksandar Petrov)', '+359 89 988 1122', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', 'CB 1009 AX', 'car', 'online', 4.88, 39, 64, 95, 62.00, 12.00, 2, 42.68500000, 23.31500000, '["توصيل بالسيارة مع التكييف 🚗"]');

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
