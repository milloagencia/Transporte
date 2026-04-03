<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?= isset($pageDesc) ? h($pageDesc) : h(SITE_DESCRIPTION) ?>">
    <title><?= isset($pageTitle) ? h($pageTitle) . ' | ' : '' ?><?= h(SITE_NAME) ?></title>

    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="<?= SITE_URL ?>/assets/css/style.css" rel="stylesheet">
</head>
<body>

<!-- Top Bar -->
<div class="topbar">
    <div class="container d-flex justify-content-between align-items-center py-1">
        <div class="d-flex gap-3 small text-white">
            <a href="<?= whatsappLink('Hello TropiCollage! I need travel info.') ?>" target="_blank" class="text-white text-decoration-none">
                <i class="fab fa-whatsapp me-1"></i><?= WHATSAPP_DISPLAY ?>
            </a>
            <span class="d-none d-md-inline"><i class="fas fa-envelope me-1"></i><?= h(ADMIN_EMAIL) ?></span>
        </div>
        <div class="small text-white">
            <i class="fas fa-globe me-1"></i>English
            &nbsp;|&nbsp;
            <i class="fas fa-dollar-sign me-1"></i>USD
        </div>
    </div>
</div>

<!-- Navbar -->
<nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
    <div class="container">
        <a class="navbar-brand d-flex align-items-center gap-2" href="<?= SITE_URL ?>/">
            <span class="brand-icon"><i class="fas fa-plane-departure"></i></span>
            <div>
                <span class="brand-name">TropiCollage</span>
                <span class="brand-sub d-block">Travel Agency</span>
            </div>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMain">
            <ul class="navbar-nav ms-auto align-items-lg-center gap-1">
                <li class="nav-item"><a class="nav-link" href="<?= SITE_URL ?>/">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="<?= SITE_URL ?>/flights.php">Flights</a></li>
                <li class="nav-item"><a class="nav-link" href="<?= SITE_URL ?>/casas.php">Casa Particular</a></li>
                <li class="nav-item"><a class="nav-link" href="<?= SITE_URL ?>/cars.php">Car Rental</a></li>
                <li class="nav-item"><a class="nav-link" href="<?= SITE_URL ?>/request.php">Custom Services</a></li>
                <li class="nav-item"><a class="nav-link" href="<?= SITE_URL ?>/contact.php">Contact</a></li>
                <li class="nav-item ms-lg-2">
                    <a href="<?= whatsappLink('Hello! I need travel assistance.') ?>" target="_blank" class="btn btn-whatsapp btn-sm">
                        <i class="fab fa-whatsapp me-1"></i>WhatsApp
                    </a>
                </li>
            </ul>
        </div>
    </div>
</nav>
