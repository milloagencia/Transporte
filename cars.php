<?php
/**
 * TropiCollage — Car Rental Page (Pinar del Río, Cuba)
 */
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

$pageTitle = 'Car Rental — Pinar del Río, Cuba';
$pageDesc  = 'Private car rentals in Pinar del Río, Cuba. All categories from economy to luxury with competitive daily rates. Book via WhatsApp.';

$category = trim($_GET['category'] ?? '');

$where  = "WHERE is_active=1";
$params = [];
if ($category && $category !== 'all') {
    $where .= " AND category=?";
    $params[] = $category;
}

$cars       = dbFetchAll("SELECT * FROM cars $where ORDER BY FIELD(category,'economy','compact','sedan','suv','minivan','luxury','classic'), price_per_day ASC", $params);
$categories = carCategories();

// Count per category for tabs
$catCounts = [];
foreach ($categories as $key => $label) {
    $catCounts[$key] = dbCount("SELECT COUNT(*) FROM cars WHERE is_active=1 AND category=?", [$key]);
}

include __DIR__ . '/includes/header.php';
?>

<section class="page-hero">
    <div class="container text-center">
        <span class="hero-badge"><i class="fas fa-car me-1"></i>Pinar del Río, Cuba</span>
        <h1 class="mt-2 mb-2">Car Rental</h1>
        <p class="opacity-90">Private cars from local owners — all categories, competitive rates</p>
    </div>
</section>

<section class="py-5">
    <div class="container">

        <!-- Category Filter Pills -->
        <div class="d-flex flex-wrap gap-2 mb-4 justify-content-center">
            <a href="cars.php" class="category-pill <?= !$category || $category === 'all' ? 'active' : '' ?>">
                All <span class="badge bg-primary ms-1"><?= array_sum($catCounts) ?></span>
            </a>
            <?php foreach ($categories as $key => $label):
                if ($catCounts[$key] == 0) continue; ?>
            <a href="cars.php?category=<?= h($key) ?>" class="category-pill <?= $category === $key ? 'active' : '' ?>">
                <?= h($label) ?> <span class="badge bg-secondary ms-1"><?= $catCounts[$key] ?></span>
            </a>
            <?php endforeach; ?>
        </div>

        <!-- Pricing by Category Overview -->
        <div class="row g-3 mb-5">
            <div class="col-12">
                <div class="p-4 rounded-3 bg-light-blue">
                    <h5 class="mb-3"><i class="fas fa-tags me-2 text-primary"></i>Pricing by Category</h5>
                    <div class="row g-3">
                        <?php
                        $catColors = ['economy'=>'success','compact'=>'info','sedan'=>'primary','suv'=>'warning','luxury'=>'danger','classic'=>'dark','minivan'=>'secondary'];
                        foreach ($categories as $key => $label):
                            if ($catCounts[$key] == 0) continue;
                            $minPrice = dbFetchOne("SELECT MIN(price_per_day) as mp FROM cars WHERE is_active=1 AND category=?", [$key]);
                            $color    = $catColors[$key] ?? 'primary';
                        ?>
                        <div class="col-sm-6 col-md-4 col-lg-3">
                            <div class="d-flex align-items-center gap-3 bg-white rounded-3 p-3">
                                <span class="badge bg-<?= $color ?> p-2"><?= h($label) ?></span>
                                <div>
                                    <div class="small text-muted">From</div>
                                    <div class="fw-700 text-primary">
                                        <?= $minPrice && $minPrice['mp'] ? formatPrice($minPrice['mp'], 'USD') . '/day' : 'Ask us' ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>

        <!-- Car Listings -->
        <?php if (empty($cars)): ?>
        <div class="text-center py-5">
            <i class="fas fa-car fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">No cars available<?= $category ? ' in the ' . h($categories[$category] ?? $category) . ' category' : '' ?> right now.</h5>
            <p class="text-muted">Contact us — we may have options not yet listed.</p>
            <a href="<?= whatsappLink('Hello! I need a car rental in Pinar del Río, Cuba. Can you help?') ?>" target="_blank" class="btn btn-whatsapp">
                <i class="fab fa-whatsapp me-2"></i>Ask on WhatsApp
            </a>
        </div>
        <?php else: ?>
        <div class="row g-4 filterable-grid" id="carGrid">
            <?php foreach ($cars as $car):
                $catLabel = $categories[$car['category']] ?? ucfirst($car['category']);
                $catColor = $catColors[$car['category']] ?? 'primary';
                $featuresList = $car['features'] ? explode(',', $car['features']) : [];
            ?>
            <div class="col-sm-6 col-lg-4">
                <div class="card car-item h-100" data-category="<?= h($car['category']) ?>">
                    <?php if ($car['image_url']): ?>
                        <img src="<?= SITE_URL . '/' . h($car['image_url']) ?>" alt="<?= h($car['make'] . ' ' . $car['model']) ?>" class="card-img-top" style="height:220px;object-fit:cover">
                    <?php else: ?>
                        <div class="card-img-top d-flex align-items-center justify-content-center bg-light" style="height:220px">
                            <i class="fas fa-car fa-4x text-secondary opacity-40"></i>
                        </div>
                    <?php endif; ?>
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="badge bg-<?= $catColor ?> car-category-badge"><?= h($catLabel) ?></span>
                            <?php if ($car['year']): ?>
                                <span class="text-muted small"><?= (int)$car['year'] ?></span>
                            <?php endif; ?>
                        </div>
                        <h6 class="fw-600 mb-1"><?= h(($car['make'] ?? '') . ' ' . ($car['model'] ?? '')) ?: 'Vehicle' ?></h6>
                        <p class="small text-muted mb-2">
                            <i class="fas fa-map-marker-alt me-1 text-primary"></i><?= h($car['location']) ?>
                        </p>
                        <div class="d-flex gap-3 small text-muted mb-2">
                            <?php if ($car['capacity']): ?>
                                <span><i class="fas fa-users me-1"></i><?= (int)$car['capacity'] ?> pax</span>
                            <?php endif; ?>
                            <?php if ($car['is_available']): ?>
                                <span class="avail-high"><i class="fas fa-check-circle me-1"></i>Available</span>
                            <?php else: ?>
                                <span class="avail-none"><i class="fas fa-times-circle me-1"></i>Unavailable</span>
                            <?php endif; ?>
                        </div>
                        <?php if ($featuresList): ?>
                        <div class="d-flex flex-wrap gap-1 mb-2">
                            <?php foreach (array_slice($featuresList, 0, 4) as $feat): ?>
                                <span class="badge bg-light text-dark border" style="font-size:.7rem"><?= h(trim($feat)) ?></span>
                            <?php endforeach; ?>
                        </div>
                        <?php endif; ?>
                        <?php if ($car['description']): ?>
                            <p class="small text-muted mb-3"><?= h(truncate($car['description'], 90)) ?></p>
                        <?php endif; ?>
                        <div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                            <div>
                                <div class="car-price"><?= $car['price_per_day'] ? formatPrice($car['price_per_day'], $car['currency']) : 'Ask' ?><span>/day</span></div>
                            </div>
                            <?php if ($car['is_available']): ?>
                            <a href="<?= whatsappLink('Hello! I\'d like to rent a ' . ($car['make'] ?? '') . ' ' . ($car['model'] ?? '') . ' (' . $catLabel . ') in Pinar del Río. Is it available?') ?>"
                               target="_blank" class="btn btn-whatsapp btn-sm">
                                <i class="fab fa-whatsapp me-1"></i>Reserve
                            </a>
                            <?php else: ?>
                            <button class="btn btn-secondary btn-sm" disabled>Unavailable</button>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>

        <!-- Info Box -->
        <div class="mt-5 p-4 rounded-3 bg-light-blue">
            <div class="row g-4 align-items-center">
                <div class="col-lg-8">
                    <h5 class="mb-2"><i class="fas fa-info-circle text-primary me-2"></i>About Our Car Rentals</h5>
                    <p class="text-muted small mb-2">All vehicles are privately owned and operated by trusted local partners in Pinar del Río, Cuba. Prices are per day and do not include fuel. Driver can be arranged on request.</p>
                    <ul class="text-muted small mb-0">
                        <li>Minimum rental: 1 day</li>
                        <li>Chauffeur/driver service available on request</li>
                        <li>Airport pickup/dropoff available</li>
                        <li>Tobacco valley (Viñales) tours arranged</li>
                    </ul>
                </div>
                <div class="col-lg-4 text-center">
                    <a href="<?= whatsappLink('Hello! I need a car rental in Pinar del Río, Cuba. Can you give me more details?') ?>" target="_blank" class="btn btn-whatsapp btn-lg">
                        <i class="fab fa-whatsapp me-2"></i>Book via WhatsApp
                    </a>
                </div>
            </div>
        </div>
    </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
