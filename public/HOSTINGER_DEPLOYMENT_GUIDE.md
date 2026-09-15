# 🚀 دليل رفع وتشغيل GO BAZAR على استضافة Hostinger

المشروع جاهز بالكامل للرفع: واجهة أمامية React مبنية بـ Vite، وواجهة خلفية PHP + MySQL،
تمت برمجتها واختبارها فعلياً (استيراد القاعدة، كل نقاط الـ API، تحديث الحالات،
الدردشة، التقييمات) على نسخة MySQL/MariaDB حقيقية قبل التسليم.

---

## 📁 1. محتويات حزمة الرفع (مجلد `dist/` بعد البناء)

نفّذ `npm install` ثم `npm run build`. سينشئ Vite مجلد `dist/` يحتوي تلقائياً على:

- `index.html` + `assets/` — الواجهة الأمامية المبنية (React + Tailwind).
- `database_schema.sql` — كل الجداول، الفهارس، والبيانات الأولية.
- `.htaccess` — توجيه المسارات (React Router + `/api/*.php`) بدون أخطاء 404.
- مجلد `api/` وبداخله 7 ملفات PHP:
  - `db_config.php` — الاتصال بقاعدة البيانات + رؤوس CORS/JSON المشتركة.
  - `stores.php` — CRUD للمتاجر (مطاعم وسوبرماركت).
  - `products.php` — CRUD للمنتجات/الأصناف.
  - `drivers.php` — CRUD لأسطول السائقين (الحالة، المحفظة، الموقع).
  - `orders.php` — إنشاء الطلبات ومتابعتها وتحديث حالتها.
  - `reviews.php` — تقييمات العملاء (تحدّث متوسط تقييم المتجر والسائق تلقائياً).
  - `chat.php` — رسائل الدردشة الحية المرتبطة بكل طلب.

> **ملاحظة:** التطبيق يزامن نفسه تلقائياً مع القاعدة كل 4 ثوانٍ في الخلفية، لذلك أي
> تغيير (طلب جديد، تحديث حالة، رسالة دردشة) على أي جهاز يظهر تلقائياً عند بقية
> الأجهزة (عميل / تاجر / سائق / لوحة تحكم) دون الحاجة لتحديث الصفحة يدوياً.

---

## 🗄️ 2. إعداد قاعدة البيانات على Hostinger (hPanel)

1. **إنشاء قاعدة البيانات:**
   - ادخل **hPanel** ← **Databases (قواعد البيانات)** ← **MySQL Databases**.
   - أنشئ قاعدة جديدة واحفظ 3 قيم: **Database Name**، **Username**، **Password**
     (مثال: `u123456789_gobazar` / `u123456789_user` / كلمة مرور قوية).

2. **استيراد ملف الـ SQL:**
   - اضغط **Enter phpMyAdmin** بجانب القاعدة.
   - تبويب **Import** ← اختر `database_schema.sql` ← **Go**.
   - سينشئ كل الجداول (users, stores, products, drivers, orders, order_items,
     reviews, chat_messages) مع فهارس الأداء والبيانات الأولية التجريبية.
   - إذا استوردت الملف عبر سطر أوامر SSH بدل phpMyAdmin، استخدم:
     ```
     mysql -u USERNAME -p --default-character-set=utf8mb4 DATABASE_NAME < database_schema.sql
     ```
     (الملف نفسه يضبط `SET NAMES utf8mb4` تلقائياً، لكن هذا احتياط إضافي حتى لا
     تنقلب النصوص العربية إلى رموز غريبة).

---

## ⚙️ 3. ربط ملف PHP بقاعدة بياناتك

افتح `api/db_config.php` وعدّل القيم الأربع لتطابق ما أنشأته في الخطوة السابقة:

```php
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_USER', getenv('DB_USER') ?: 'u123456789_user');
define('DB_PASS', getenv('DB_PASS') ?: 'كلمة_المرور_الخاصة_بك');
define('DB_NAME', getenv('DB_NAME') ?: 'u123456789_gobazar');
```

- `DB_HOST` عادة يبقى `localhost` على Hostinger.
- إن كانت استضافتك تدعم متغيرات بيئة (Environment Variables) من hPanel، يمكنك
  تعيين `DB_HOST/DB_USER/DB_PASS/DB_NAME` هناك بدلاً من تعديل الملف مباشرة —
  الكود يدعم الطريقتين تلقائياً.

---

## 📤 4. رفع الملفات إلى Hostinger

1. **File Manager** في hPanel ← ادخل مجلد **`public_html`**.
2. ارفع **محتويات** مجلد `dist/` (وليس المجلد نفسه) مباشرة داخل `public_html`،
   بحيث يكون المسار النهائي: `public_html/index.html`, `public_html/api/...`,
   `public_html/.htaccess`.
3. تأكد أن امتداد PHP مفعّل على الاستضافة (مفعّل افتراضياً على Hostinger) وأن
   إصدار PHP 8.0 أو أحدث مختار من **hPanel ← Advanced ← PHP Configuration**.

---

## ✅ 5. اختبار سريع بعد الرفع

افتح هذه الروابط في المتصفح مباشرة (استبدل الدومين بدومينك) للتأكد أن الـ API
يرد ببيانات JSON حقيقية من القاعدة وليس رسالة "fallback":

```
https://yourdomain.com/api/stores.php
https://yourdomain.com/api/products.php
https://yourdomain.com/api/drivers.php
https://yourdomain.com/api/orders.php
```

- إن ظهرت `"status": "success"` مع بيانات المتاجر الخمسة → كل شيء يعمل بنجاح.
- إن ظهرت `"status": "fallback"` → راجع بيانات الاتصال في `db_config.php` (تأكد
  من صحة اسم المستخدم/كلمة المرور/اسم القاعدة)، وتحقق من سجل الأخطاء في
  **hPanel ← Advanced ← Error Log** حيث تُسجَّل تفاصيل أي خطأ اتصال دون عرضها
  للزائر.
- افتح الموقع نفسه (`https://yourdomain.com`) وجرّب إنشاء طلب من واجهة العميل،
  ثم تأكد من ظهوره في لوحة التاجر/الإدارة خلال ثوانٍ قليلة.

🎉 **مبروك!** موقعك يعمل الآن بكفاءة على Hostinger باللغتين العربية والإنجليزية
وباليورو (€)، مع مزامنة حقيقية بين كل الأجهزة عبر قاعدة بيانات MySQL واحدة.
