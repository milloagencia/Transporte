<?php
/**
 * TropiCollage Travel Agency - Helper Functions
 */

function h($str) {
    return htmlspecialchars((string)$str, ENT_QUOTES, 'UTF-8');
}

function formatPrice($price, $currency = 'USD') {
    $symbols = ['USD' => '$', 'EUR' => '€', 'CUP' => '₱'];
    $sym = $symbols[$currency] ?? $currency . ' ';
    return $sym . number_format((float)$price, 2);
}

function formatDate($date) {
    if (!$date) return 'TBD';
    return date('M j, Y', strtotime($date));
}

function timeAgo($datetime) {
    $now  = new DateTime();
    $ago  = new DateTime($datetime);
    $diff = $now->diff($ago);
    if ($diff->d === 0)  return 'Today';
    if ($diff->d === 1)  return 'Yesterday';
    if ($diff->d < 7)   return $diff->d . ' days ago';
    if ($diff->d < 30)  return floor($diff->d / 7) . ' weeks ago';
    if ($diff->m < 12)  return $diff->m . ' month' . ($diff->m > 1 ? 's' : '') . ' ago';
    return $diff->y . ' year' . ($diff->y > 1 ? 's' : '') . ' ago';
}

function slug($str) {
    $str = strtolower(trim($str));
    $str = preg_replace('/[^a-z0-9\-]/', '-', $str);
    $str = preg_replace('/-+/', '-', $str);
    return trim($str, '-');
}

function truncate($str, $len = 150) {
    if (mb_strlen($str) <= $len) return $str;
    return mb_substr($str, 0, $len) . '...';
}

function whatsappLink($message = '') {
    $num = preg_replace('/\D/', '', WHATSAPP_NUMBER);
    $msg = $message ? '?text=' . rawurlencode($message) : '';
    return 'https://wa.me/' . $num . $msg;
}

function handleFileUpload($fileKey, $subdir = '') {
    if (empty($_FILES[$fileKey]['name'])) return null;
    $file = $_FILES[$fileKey];
    $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!in_array($file['type'], $allowed)) return null;
    if ($file['size'] > 5 * 1024 * 1024) return null; // 5MB max

    $ext  = pathinfo($file['name'], PATHINFO_EXTENSION);
    $name = bin2hex(random_bytes(8)) . '.' . strtolower($ext);
    $dir  = UPLOAD_DIR . ($subdir ? $subdir . '/' : '');
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $dest = $dir . $name;
    if (move_uploaded_file($file['tmp_name'], $dest)) {
        return 'uploads/' . ($subdir ? $subdir . '/' : '') . $name;
    }
    return null;
}

function redirect($url) {
    header('Location: ' . $url);
    exit;
}

function flashMessage($type, $msg) {
    if (session_status() === PHP_SESSION_NONE) session_start();
    $_SESSION['flash'] = ['type' => $type, 'msg' => $msg];
}

function getFlashMessage() {
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (!empty($_SESSION['flash'])) {
        $flash = $_SESSION['flash'];
        unset($_SESSION['flash']);
        return $flash;
    }
    return null;
}

function renderFlash() {
    $flash = getFlashMessage();
    if ($flash) {
        $cls = $flash['type'] === 'success' ? 'success' : ($flash['type'] === 'error' ? 'danger' : 'info');
        echo '<div class="alert alert-' . $cls . ' alert-dismissible fade show" role="alert">'
           . h($flash['msg'])
           . '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';
    }
}

function carCategories() {
    return [
        'economy'   => 'Economy',
        'compact'   => 'Compact',
        'sedan'     => 'Sedan',
        'suv'       => 'SUV',
        'minivan'   => 'Minivan',
        'luxury'    => 'Luxury',
        'classic'   => 'Classic / Vintage',
    ];
}

function serviceTypes() {
    return [
        'flight'      => 'Flight Booking',
        'casa'        => 'Casa Particular',
        'car'         => 'Car Rental',
        'tour'        => 'Custom Tour Package',
        'transfer'    => 'Airport Transfer',
        'insurance'   => 'Travel Insurance',
        'other'       => 'Other / Custom Request',
    ];
}
