<?php
/**
 * TropiCollage — Custom Service Request Page
 */
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/auth.php';

$pageTitle = 'Request a Custom Service';
$pageDesc  = 'Need something special? TropiCollage offers tailored travel services. Tell us what you need and we\'ll make it happen.';

startSecureSession();
$success = false;
$errors  = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrf($_POST['csrf_token'] ?? '')) {
        $errors[] = 'Invalid request. Please try again.';
    } else {
        $name         = trim($_POST['name'] ?? '');
        $email        = trim($_POST['email'] ?? '');
        $phone        = trim($_POST['phone'] ?? '');
        $serviceType  = trim($_POST['service_type'] ?? '');
        $travelDates  = trim($_POST['travel_dates'] ?? '');
        $numTravelers = (int)($_POST['num_travelers'] ?? 1);
        $details      = trim($_POST['details'] ?? '');

        if (!$name)    $errors[] = 'Name is required.';
        if (!$phone && !$email) $errors[] = 'Please provide at least a phone number or email.';
        if (!$details) $errors[] = 'Please describe what you need.';

        if (empty($errors)) {
            dbExecute(
                "INSERT INTO service_requests (name,email,phone,service_type,travel_dates,num_travelers,details) VALUES (?,?,?,?,?,?,?)",
                [$name, $email, $phone, $serviceType, $travelDates, $numTravelers, $details]
            );
            $success = true;
        }
    }
}

include __DIR__ . '/includes/header.php';
?>

<section class="page-hero">
    <div class="container text-center">
        <span class="hero-badge"><i class="fas fa-concierge-bell me-1"></i>Tailored Travel</span>
        <h1 class="mt-2 mb-2">Request a Custom Service</h1>
        <p class="opacity-90">Can't find what you need? Tell us — we'll arrange it for you</p>
    </div>
</section>

<section class="py-5">
    <div class="container">
        <div class="row g-4 justify-content-center">
            <div class="col-lg-7">

                <?php if ($success): ?>
                <div class="text-center py-5">
                    <div class="mb-4" style="font-size:4rem">✅</div>
                    <h3 class="fw-700">Request Submitted!</h3>
                    <p class="text-muted mb-4">Thank you! We've received your request and will contact you as soon as possible. You can also reach us directly on WhatsApp for a faster response.</p>
                    <a href="<?= whatsappLink('Hello! I just submitted a service request on your website. My name is ' . ($name ?? '')) ?>"
                       target="_blank" class="btn btn-whatsapp btn-lg me-2">
                        <i class="fab fa-whatsapp me-2"></i>Follow Up on WhatsApp
                    </a>
                    <a href="index.php" class="btn btn-outline-primary btn-lg">Go to Homepage</a>
                </div>
                <?php else: ?>

                <div class="card">
                    <div class="card-body p-4">
                        <h4 class="mb-4 fw-600"><i class="fas fa-clipboard-list text-primary me-2"></i>Tell Us What You Need</h4>

                        <?php if ($errors): ?>
                        <div class="alert alert-danger">
                            <ul class="mb-0">
                                <?php foreach ($errors as $e): ?>
                                    <li><?= h($e) ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                        <?php endif; ?>

                        <form method="POST" action="request.php" novalidate>
                            <input type="hidden" name="csrf_token" value="<?= csrfToken() ?>">

                            <div class="row g-3">
                                <div class="col-sm-6">
                                    <label class="form-label">Full Name <span class="required-star">*</span></label>
                                    <input type="text" name="name" class="form-control" required
                                           value="<?= h($_POST['name'] ?? '') ?>" placeholder="Your full name">
                                </div>
                                <div class="col-sm-6">
                                    <label class="form-label">Email</label>
                                    <input type="email" name="email" class="form-control"
                                           value="<?= h($_POST['email'] ?? '') ?>" placeholder="your@email.com">
                                </div>
                                <div class="col-sm-6">
                                    <label class="form-label">Phone / WhatsApp <span class="required-star">*</span></label>
                                    <input type="tel" name="phone" class="form-control"
                                           value="<?= h($_POST['phone'] ?? '') ?>" placeholder="+1 555 000 0000">
                                    <div class="form-text">Include country code for WhatsApp</div>
                                </div>
                                <div class="col-sm-6">
                                    <label class="form-label">Service Type</label>
                                    <select name="service_type" class="form-select">
                                        <option value="">— Select a service —</option>
                                        <?php foreach (serviceTypes() as $k => $v): ?>
                                            <option value="<?= h($k) ?>" <?= ($_POST['service_type'] ?? '') === $k ? 'selected' : '' ?>><?= h($v) ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                <div class="col-sm-6">
                                    <label class="form-label">Travel Dates / Period</label>
                                    <input type="text" name="travel_dates" class="form-control"
                                           value="<?= h($_POST['travel_dates'] ?? '') ?>" placeholder="e.g. Mar 15-22, 2025">
                                </div>
                                <div class="col-sm-6">
                                    <label class="form-label">Number of Travelers</label>
                                    <select name="num_travelers" class="form-select">
                                        <?php for ($i=1;$i<=20;$i++): ?>
                                            <option value="<?= $i ?>" <?= (int)($_POST['num_travelers'] ?? 1) === $i ? 'selected' : '' ?>>
                                                <?= $i ?> person<?= $i > 1 ? 's' : '' ?>
                                            </option>
                                        <?php endfor; ?>
                                    </select>
                                </div>
                                <div class="col-12">
                                    <label class="form-label">Describe Your Request <span class="required-star">*</span></label>
                                    <textarea name="details" class="form-control" rows="5" required
                                              placeholder="Tell us exactly what you need — destination, dates, specific requirements, budget, etc."><?= h($_POST['details'] ?? '') ?></textarea>
                                </div>
                                <div class="col-12">
                                    <button type="submit" class="btn btn-primary btn-lg w-100">
                                        <i class="fas fa-paper-plane me-2"></i>Submit Request
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <?php endif; ?>
            </div>

            <!-- Sidebar -->
            <div class="col-lg-4">
                <div class="card mb-3">
                    <div class="card-body p-3">
                        <h6 class="fw-600 mb-3"><i class="fab fa-whatsapp text-success me-2"></i>Prefer WhatsApp?</h6>
                        <p class="small text-muted mb-3">For the fastest response, message us directly on WhatsApp. We typically reply within a few hours.</p>
                        <a href="<?= whatsappLink('Hello TropiCollage! I need to arrange a custom travel service.') ?>" target="_blank" class="btn btn-whatsapp w-100">
                            <i class="fab fa-whatsapp me-2"></i><?= WHATSAPP_DISPLAY ?>
                        </a>
                    </div>
                </div>
                <div class="card mb-3">
                    <div class="card-body p-3">
                        <h6 class="fw-600 mb-3"><i class="fas fa-list-ul text-primary me-2"></i>Services We Can Arrange</h6>
                        <ul class="small text-muted mb-0">
                            <?php foreach (serviceTypes() as $v): ?>
                                <li class="mb-1"><i class="fas fa-check text-success me-1"></i><?= h($v) ?></li>
                            <?php endforeach; ?>
                            <li class="mb-1"><i class="fas fa-check text-success me-1"></i>Tobacco Valley (Viñales) Tours</li>
                            <li class="mb-1"><i class="fas fa-check text-success me-1"></i>Havana City Tours</li>
                            <li><i class="fas fa-check text-success me-1"></i>Group / Event Travel</li>
                        </ul>
                    </div>
                </div>
                <div class="card border-primary">
                    <div class="card-body p-3">
                        <h6 class="fw-600 mb-2 text-primary"><i class="fas fa-lightbulb me-2"></i>Don't See What You Need?</h6>
                        <p class="small text-muted mb-0">We specialize in <strong>bespoke travel arrangements</strong>. If it exists, we'll find it. Just ask!</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
