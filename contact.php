<?php
/**
 * TropiCollage — Contact Page
 */
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

$pageTitle = 'Contact Us';
$pageDesc  = 'Contact TropiCollage Travel Agency via WhatsApp, email, or our contact form. We specialize in Cuba travel.';

include __DIR__ . '/includes/header.php';
?>

<section class="page-hero">
    <div class="container text-center">
        <span class="hero-badge"><i class="fas fa-envelope me-1"></i>Get in Touch</span>
        <h1 class="mt-2 mb-2">Contact Us</h1>
        <p class="opacity-90">We're here to help you plan the perfect trip — reach out anytime</p>
    </div>
</section>

<section class="py-5">
    <div class="container">
        <div class="row g-4">

            <!-- Contact Cards -->
            <div class="col-lg-5">
                <h4 class="fw-600 mb-4">Get in Touch</h4>

                <!-- WhatsApp -->
                <div class="card contact-card mb-3" style="border-left-color: var(--success);">
                    <div class="card-body d-flex gap-3 align-items-center p-3">
                        <div class="contact-icon wa"><i class="fab fa-whatsapp fa-lg"></i></div>
                        <div class="flex-grow-1">
                            <div class="fw-600 mb-1">WhatsApp (Preferred)</div>
                            <div class="text-muted small mb-2"><?= WHATSAPP_DISPLAY ?></div>
                            <a href="<?= whatsappLink('Hello TropiCollage! I need travel assistance.') ?>" target="_blank" class="btn btn-whatsapp btn-sm">
                                <i class="fab fa-whatsapp me-1"></i>Start Chat
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Email -->
                <div class="card contact-card mb-3">
                    <div class="card-body d-flex gap-3 align-items-center p-3">
                        <div class="contact-icon"><i class="fas fa-envelope fa-lg"></i></div>
                        <div>
                            <div class="fw-600 mb-1">Email</div>
                            <a href="mailto:<?= h(ADMIN_EMAIL) ?>" class="text-muted small"><?= h(ADMIN_EMAIL) ?></a>
                        </div>
                    </div>
                </div>

                <!-- Location -->
                <div class="card contact-card mb-3">
                    <div class="card-body d-flex gap-3 align-items-center p-3">
                        <div class="contact-icon"><i class="fas fa-map-marker-alt fa-lg"></i></div>
                        <div>
                            <div class="fw-600 mb-1">Location</div>
                            <div class="text-muted small">Cuba &amp; International Operations</div>
                        </div>
                    </div>
                </div>

                <!-- Hours -->
                <div class="card contact-card mb-4">
                    <div class="card-body d-flex gap-3 align-items-center p-3">
                        <div class="contact-icon"><i class="fas fa-clock fa-lg"></i></div>
                        <div>
                            <div class="fw-600 mb-1">Business Hours</div>
                            <div class="text-muted small">Monday – Saturday: 9:00 AM – 6:00 PM (Cuba Time)</div>
                            <div class="text-muted small">WhatsApp available beyond hours</div>
                        </div>
                    </div>
                </div>

                <!-- Social Links -->
                <h6 class="fw-600 mb-3">Also Find Us On</h6>
                <div class="d-flex gap-2">
                    <a href="<?= whatsappLink() ?>" target="_blank" class="btn btn-whatsapp btn-sm"><i class="fab fa-whatsapp me-1"></i>WhatsApp</a>
                    <a href="#" class="btn btn-outline-primary btn-sm"><i class="fab fa-facebook me-1"></i>Facebook</a>
                    <a href="#" class="btn btn-outline-danger btn-sm"><i class="fab fa-instagram me-1"></i>Instagram</a>
                    <a href="#" class="btn btn-outline-info btn-sm"><i class="fab fa-telegram me-1"></i>Telegram</a>
                </div>
            </div>

            <!-- Quick WhatsApp Templates -->
            <div class="col-lg-7">
                <h4 class="fw-600 mb-4">Quick Contact</h4>
                <p class="text-muted mb-4">Choose a topic and we'll open WhatsApp with a pre-filled message for you:</p>

                <div class="row g-3 mb-4">
                    <?php
                    $templates = [
                        ['fas fa-plane',          'Flight Inquiry',         'Hello TropiCollage! I need information about international flights. Can you help me?',       'primary'],
                        ['fas fa-home',            'Casa Particular',        'Hello TropiCollage! I\'d like to book a Casa Particular in Cuba. Can you assist?',             'warning'],
                        ['fas fa-car',             'Car Rental',             'Hello TropiCollage! I need a car rental in Pinar del Río, Cuba. What\'s available?',          'success'],
                        ['fas fa-concierge-bell',  'Custom Request',         'Hello TropiCollage! I need a custom travel service. I\'d like to discuss my needs.',          'info'],
                        ['fas fa-question-circle', 'General Info',           'Hello TropiCollage! I have a general question about your services.',                         'secondary'],
                        ['fas fa-star',            'Special Travel Package', 'Hello TropiCollage! I\'m interested in a special travel package to Cuba. Can we talk?',       'danger'],
                    ];
                    foreach ($templates as $t):
                    ?>
                    <div class="col-sm-6">
                        <button class="btn btn-light border w-100 text-start d-flex align-items-center gap-2 p-3 h-100"
                                data-wa-message="<?= h($t[2]) ?>">
                            <span class="text-<?= $t[3] ?> fs-5"><i class="<?= $t[0] ?>"></i></span>
                            <div>
                                <div class="fw-600 small"><?= $t[1] ?></div>
                                <div class="text-muted" style="font-size:.75rem">Tap to open WhatsApp</div>
                            </div>
                            <i class="fab fa-whatsapp text-success ms-auto"></i>
                        </button>
                    </div>
                    <?php endforeach; ?>
                </div>

                <!-- About box -->
                <div class="p-4 rounded-3 bg-light-blue">
                    <h5 class="fw-600 mb-2"><i class="fas fa-info-circle text-primary me-2"></i>About TropiCollage</h5>
                    <p class="text-muted small mb-0">
                        We are a specialized travel agency focused on connecting travelers with <strong>exclusive international flights</strong> not available on standard booking platforms,
                        <strong>authentic Cuban casa particulares</strong>, and <strong>private car rentals in Pinar del Río, Cuba</strong>.
                        We also arrange completely custom travel packages — just ask!
                    </p>
                </div>
            </div>
        </div>
    </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
