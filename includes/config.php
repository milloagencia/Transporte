<?php
/**
 * TropiCollage Travel Agency - Configuration
 */

// Database Configuration (update with your Hostinger credentials)
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');
define('DB_CHARSET', 'utf8mb4');

// Site Configuration
define('SITE_NAME', 'TropiCollage Travel Agency');
define('SITE_URL', 'https://yourdomain.com'); // Update with your actual domain
define('SITE_DESCRIPTION', 'Exclusive international flights, Cuba casa particulares & car rentals in Pinar del Río');
define('ADMIN_EMAIL', 'admin@yourdomain.com');

// Contact Info
define('WHATSAPP_NUMBER', '+5358040385');
define('WHATSAPP_DISPLAY', '+53 58040385');

// Admin Credentials (change these!)
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD_HASH', password_hash('TropiAdmin2024!', PASSWORD_DEFAULT));

// Uploads directory
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('UPLOAD_URL', SITE_URL . '/uploads/');

// Session config
define('SESSION_LIFETIME', 3600); // 1 hour

// Pagination
define('ITEMS_PER_PAGE', 12);

// Currency
define('DEFAULT_CURRENCY', 'USD');
