<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($adminTitle) ? h($adminTitle) . ' | ' : '' ?>Admin — <?= h(SITE_NAME) ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="<?= SITE_URL ?>/assets/css/style.css" rel="stylesheet">
</head>
<body class="bg-light">

<nav class="navbar navbar-expand-lg admin-nav py-2">
    <div class="container-fluid">
        <a class="navbar-brand fw-700" href="<?= SITE_URL ?>/admin/">
            <i class="fas fa-plane-departure me-2"></i>TropiCollage Admin
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="adminNav">
            <ul class="navbar-nav me-auto">
                <li class="nav-item"><a class="nav-link" href="<?= SITE_URL ?>/admin/"><i class="fas fa-tachometer-alt me-1"></i>Dashboard</a></li>
                <li class="nav-item"><a class="nav-link" href="<?= SITE_URL ?>/admin/flights.php"><i class="fas fa-plane me-1"></i>Flights</a></li>
                <li class="nav-item"><a class="nav-link" href="<?= SITE_URL ?>/admin/news.php"><i class="fas fa-newspaper me-1"></i>News</a></li>
                <li class="nav-item"><a class="nav-link" href="<?= SITE_URL ?>/admin/casas.php"><i class="fas fa-home me-1"></i>Casas</a></li>
                <li class="nav-item"><a class="nav-link" href="<?= SITE_URL ?>/admin/cars.php"><i class="fas fa-car me-1"></i>Cars</a></li>
                <li class="nav-item"><a class="nav-link" href="<?= SITE_URL ?>/admin/requests.php"><i class="fas fa-inbox me-1"></i>Requests</a></li>
            </ul>
            <ul class="navbar-nav">
                <li class="nav-item"><a class="nav-link" href="<?= SITE_URL ?>/" target="_blank"><i class="fas fa-external-link-alt me-1"></i>View Site</a></li>
                <li class="nav-item"><a class="nav-link text-danger" href="<?= SITE_URL ?>/admin/logout.php"><i class="fas fa-sign-out-alt me-1"></i>Logout</a></li>
            </ul>
        </div>
    </div>
</nav>
<div class="container-fluid py-4 px-4">
