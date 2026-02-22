<?php
/**
 * TropiCollage Admin — Login
 */
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/auth.php';

startSecureSession();

if (isLoggedIn()) {
    header('Location: ' . SITE_URL . '/admin/');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrf($_POST['csrf_token'] ?? '')) {
        $error = 'Invalid request. Please try again.';
    } elseif (adminLogin($_POST['username'] ?? '', $_POST['password'] ?? '')) {
        header('Location: ' . SITE_URL . '/admin/');
        exit;
    } else {
        $error = 'Invalid username or password.';
    }
}
?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login — <?= h(SITE_NAME) ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    <link href="<?= SITE_URL ?>/assets/css/style.css" rel="stylesheet">
    <style>
        body { background: linear-gradient(135deg, #004f70, #006994); min-height: 100vh; display: flex; align-items: center; }
    </style>
</head>
<body>
<div class="container">
    <div class="row justify-content-center">
        <div class="col-sm-9 col-md-7 col-lg-5 col-xl-4">
            <div class="card shadow-lg">
                <div class="card-body p-4">
                    <div class="text-center mb-4">
                        <div class="brand-icon mx-auto mb-2"><i class="fas fa-plane-departure"></i></div>
                        <h4 class="fw-700">TropiCollage Admin</h4>
                        <p class="text-muted small">Sign in to manage your travel agency</p>
                    </div>
                    <?php if ($error): ?>
                        <div class="alert alert-danger"><?= h($error) ?></div>
                    <?php endif; ?>
                    <form method="POST" action="login.php">
                        <input type="hidden" name="csrf_token" value="<?= csrfToken() ?>">
                        <div class="mb-3">
                            <label class="form-label">Username</label>
                            <input type="text" name="username" class="form-control" required autofocus
                                   value="<?= h($_POST['username'] ?? '') ?>">
                        </div>
                        <div class="mb-4">
                            <label class="form-label">Password</label>
                            <input type="password" name="password" class="form-control" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">
                            <i class="fas fa-sign-in-alt me-2"></i>Sign In
                        </button>
                    </form>
                    <div class="mt-3 text-center">
                        <a href="<?= SITE_URL ?>/" class="small text-muted">← Back to website</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
