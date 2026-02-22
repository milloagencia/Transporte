<?php
/**
 * TropiCollage Travel Agency — Database Installer
 * Run once: https://yourdomain.com/install.php
 * DELETE this file after installation!
 */

require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';

// Simple auth: prevent accidental public access
$installKey = $_GET['key'] ?? '';
if ($installKey !== 'INSTALL_' . md5(DB_NAME)) {
    echo '<p>Access denied. Append <code>?key=INSTALL_' . md5(DB_NAME) . '</code> to the URL.</p>';
    exit;
}

$db     = getDB();
$errors = [];
$done   = [];

$tables = [

'flights' => "CREATE TABLE IF NOT EXISTS flights (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    origin          VARCHAR(100) NOT NULL,
    destination     VARCHAR(100) NOT NULL,
    airline         VARCHAR(150),
    departure_date  DATE,
    return_date     DATE,
    price           DECIMAL(10,2),
    currency        VARCHAR(3) DEFAULT 'USD',
    availability    INT DEFAULT 0,
    description     TEXT,
    highlights      TEXT,
    image_url       VARCHAR(255),
    is_featured     TINYINT(1) DEFAULT 0,
    is_active       TINYINT(1) DEFAULT 1,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

'news' => "CREATE TABLE IF NOT EXISTS news (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    content     TEXT NOT NULL,
    image_url   VARCHAR(255),
    is_featured TINYINT(1) DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

'casas' => "CREATE TABLE IF NOT EXISTS casas (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    location        VARCHAR(255) DEFAULT 'Cuba',
    description     TEXT,
    price_per_night DECIMAL(10,2),
    currency        VARCHAR(3) DEFAULT 'USD',
    rooms           INT DEFAULT 1,
    capacity        INT DEFAULT 2,
    amenities       TEXT,
    image_url       VARCHAR(255),
    host_name       VARCHAR(100),
    host_whatsapp   VARCHAR(30),
    is_featured     TINYINT(1) DEFAULT 0,
    is_active       TINYINT(1) DEFAULT 1,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

'cars' => "CREATE TABLE IF NOT EXISTS cars (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    category     VARCHAR(50) NOT NULL,
    make         VARCHAR(100),
    model        VARCHAR(100),
    year         INT,
    price_per_day DECIMAL(10,2),
    currency     VARCHAR(3) DEFAULT 'USD',
    location     VARCHAR(255) DEFAULT 'Pinar del Río, Cuba',
    capacity     INT DEFAULT 4,
    features     TEXT,
    description  TEXT,
    image_url    VARCHAR(255),
    is_available TINYINT(1) DEFAULT 1,
    is_active    TINYINT(1) DEFAULT 1,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

'service_requests' => "CREATE TABLE IF NOT EXISTS service_requests (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(50),
    service_type    VARCHAR(100),
    travel_dates    VARCHAR(255),
    num_travelers   INT DEFAULT 1,
    details         TEXT,
    status          VARCHAR(20) DEFAULT 'pending',
    admin_notes     TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

];

foreach ($tables as $name => $sql) {
    try {
        $db->exec($sql);
        $done[] = "✅ Table <strong>$name</strong> created (or already exists).";
    } catch (PDOException $e) {
        $errors[] = "❌ Error creating <strong>$name</strong>: " . $e->getMessage();
    }
}

// Sample data
try {
    $count = $db->query("SELECT COUNT(*) FROM news")->fetchColumn();
    if ($count == 0) {
        $db->exec("INSERT INTO news (title, content, is_featured) VALUES
            ('Welcome to TropiCollage Travel Agency', 'We specialize in exclusive international flights that are not available on standard booking platforms. Contact us via WhatsApp to find the best deals for your next trip to or from Cuba.', 1),
            ('Casa Particular Listings in Cuba', 'Stay like a local! We offer curated private homes (casas particulares) across Cuba, with full amenities and authentic experiences.', 0),
            ('Car Rental Available in Pinar del Río', 'Need wheels in Pinar del Río? We have private cars available by category — from economy to luxury — at competitive daily rates.', 0)");
        $done[] = "✅ Sample <strong>news</strong> inserted.";
    }
} catch (PDOException $e) {
    $errors[] = "❌ Error inserting sample news: " . $e->getMessage();
}

?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Install — TropiCollage</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<div class="container py-5" style="max-width:640px">
    <h2 class="mb-4">🌴 TropiCollage — Database Setup</h2>
    <?php foreach ($done as $msg): ?>
        <div class="alert alert-success py-2"><?= $msg ?></div>
    <?php endforeach; ?>
    <?php foreach ($errors as $msg): ?>
        <div class="alert alert-danger py-2"><?= $msg ?></div>
    <?php endforeach; ?>
    <?php if (empty($errors)): ?>
        <div class="alert alert-warning">
            <strong>⚠️ Installation complete!</strong><br>
            Please <strong>delete this file</strong> (<code>install.php</code>) from your server immediately for security.
        </div>
        <a href="<?= SITE_URL ?>/" class="btn btn-primary">Go to Homepage</a>
        &nbsp;
        <a href="<?= SITE_URL ?>/admin/" class="btn btn-secondary">Go to Admin Panel</a>
    <?php endif; ?>
</div>
</body>
</html>
