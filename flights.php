<?php
/**
 * TropiCollage — International Flights Page
 */
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

$pageTitle = 'International Flights';
$pageDesc  = 'Exclusive international flights not available on standard booking platforms. TropiCollage connects you with special routes to and from Cuba.';

// Filters
$origin      = trim($_GET['origin'] ?? '');
$destination = trim($_GET['destination'] ?? '');
$dateFrom    = trim($_GET['date_from'] ?? '');

$where  = "WHERE is_active=1";
$params = [];
if ($origin) {
    $where .= " AND origin LIKE ?";
    $params[] = '%' . $origin . '%';
}
if ($destination) {
    $where .= " AND destination LIKE ?";
    $params[] = '%' . $destination . '%';
}
if ($dateFrom) {
    $where .= " AND departure_date >= ?";
    $params[] = $dateFrom;
}

$flights = dbFetchAll("SELECT * FROM flights $where ORDER BY is_featured DESC, departure_date ASC", $params);

include __DIR__ . '/includes/header.php';
?>

<section class="page-hero">
    <div class="container text-center">
        <span class="hero-badge"><i class="fas fa-plane me-1"></i>Not on Standard Platforms</span>
        <h1 class="mt-2 mb-2">International Flights</h1>
        <p class="opacity-90">Exclusive routes to &amp; from Cuba and beyond — curated by TropiCollage</p>
    </div>
</section>

<section class="py-4 bg-light-blue">
    <div class="container">
        <form class="filter-bar" method="GET" id="flightSearchForm">
            <div class="row g-3 align-items-end">
                <div class="col-sm-6 col-lg-3">
                    <label class="form-label">From</label>
                    <input type="text" name="origin" class="form-control" value="<?= h($origin) ?>" placeholder="Country or city">
                </div>
                <div class="col-sm-6 col-lg-3">
                    <label class="form-label">To</label>
                    <input type="text" name="destination" class="form-control" value="<?= h($destination) ?>" placeholder="Country or city">
                </div>
                <div class="col-sm-6 col-lg-3">
                    <label class="form-label">Departure from</label>
                    <input type="date" name="date_from" class="form-control" value="<?= h($dateFrom) ?>">
                </div>
                <div class="col-sm-6 col-lg-3 d-flex gap-2">
                    <button type="submit" class="btn btn-primary flex-grow-1"><i class="fas fa-search me-1"></i>Search</button>
                    <a href="flights.php" class="btn btn-outline-secondary"><i class="fas fa-times"></i></a>
                </div>
            </div>
        </form>
    </div>
</section>

<section class="py-5">
    <div class="container">
        <?php if (empty($flights)): ?>
        <div class="text-center py-5">
            <i class="fas fa-search fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">No flights found matching your search.</h5>
            <p class="text-muted">Try a different search or <a href="<?= whatsappLink('Hello! I need a flight that I could not find on your website. Can you help?') ?>" target="_blank">ask us on WhatsApp</a> — we may have routes not listed yet.</p>
            <a href="flights.php" class="btn btn-outline-primary mt-2">Clear Search</a>
        </div>
        <?php else: ?>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <p class="text-muted mb-0"><?= count($flights) ?> flight<?= count($flights) != 1 ? 's' : '' ?> found</p>
        </div>
        <div class="row g-4">
            <?php foreach ($flights as $f): ?>
            <div class="col-sm-6 col-lg-4">
                <div class="card flight-card flight-item h-100 position-relative"
                     data-origin="<?= h(strtolower($f['origin'])) ?>"
                     data-destination="<?= h(strtolower($f['destination'])) ?>">
                    <?php if ($f['is_featured']): ?>
                        <span class="featured-badge"><i class="fas fa-star me-1"></i>Featured</span>
                    <?php endif; ?>
                    <?php if ($f['image_url']): ?>
                        <img src="<?= SITE_URL . '/' . h($f['image_url']) ?>" alt="<?= h($f['title']) ?>" class="card-img-top">
                    <?php else: ?>
                        <div class="card-img-top bg-primary d-flex align-items-center justify-content-center" style="height:200px">
                            <i class="fas fa-plane text-white fa-3x opacity-50"></i>
                        </div>
                    <?php endif; ?>
                    <div class="card-body d-flex flex-column">
                        <div class="route-line mb-2">
                            <span class="text-primary fw-600"><?= h($f['origin']) ?></span>
                            <span class="route-arrow mx-2"><i class="fas fa-arrow-right"></i></span>
                            <span class="text-primary fw-600"><?= h($f['destination']) ?></span>
                        </div>
                        <h6 class="fw-600 mb-2"><?= h($f['title']) ?></h6>
                        <div class="small text-muted mb-3">
                            <?php if ($f['airline']): ?>
                                <div><i class="fas fa-plane-departure me-2 text-primary"></i><?= h($f['airline']) ?></div>
                            <?php endif; ?>
                            <?php if ($f['departure_date']): ?>
                                <div><i class="far fa-calendar me-2 text-primary"></i>Departs: <?= formatDate($f['departure_date']) ?></div>
                            <?php endif; ?>
                            <?php if ($f['return_date']): ?>
                                <div><i class="fas fa-undo-alt me-2 text-primary"></i>Returns: <?= formatDate($f['return_date']) ?></div>
                            <?php endif; ?>
                            <?php if ($f['availability'] > 0): ?>
                                <div class="<?= $f['availability'] <= 3 ? 'avail-low' : 'avail-high' ?>">
                                    <i class="fas fa-chair me-2"></i><?= $f['availability'] ?> seat<?= $f['availability'] != 1 ? 's' : '' ?> available
                                </div>
                            <?php endif; ?>
                        </div>
                        <?php if ($f['description']): ?>
                            <p class="small text-muted mb-3"><?= h(truncate($f['description'], 100)) ?></p>
                        <?php endif; ?>
                        <div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                            <div class="price-tag"><?= $f['price'] ? formatPrice($f['price'], $f['currency']) : '<span class="text-muted">Ask for price</span>' ?></div>
                            <a href="<?= whatsappLink('Hello! I\'m interested in booking the flight: ' . $f['title'] . ' (' . $f['origin'] . ' → ' . $f['destination'] . '). Can you help me?') ?>"
                               target="_blank" class="btn btn-whatsapp btn-sm">
                                <i class="fab fa-whatsapp me-1"></i>Book Now
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>

        <!-- Can't find? -->
        <div class="mt-5 p-4 rounded-3 text-center" style="background:var(--light-bg)">
            <h5 class="mb-2"><i class="fab fa-whatsapp text-success me-2"></i>Can't find your route?</h5>
            <p class="text-muted mb-3">We specialize in routes that are NOT on Expedia, Google Flights, or other standard platforms. If you don't see what you need, contact us directly — we likely have it.</p>
            <a href="<?= whatsappLink('Hello TropiCollage! I\'m looking for a specific flight that I can\'t find online. Can you help?') ?>"
               target="_blank" class="btn btn-whatsapp me-2">
                <i class="fab fa-whatsapp me-2"></i>Ask on WhatsApp
            </a>
            <a href="request.php" class="btn btn-outline-primary">Submit Custom Request</a>
        </div>
    </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
