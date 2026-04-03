<?php
/**
 * TropiCollage — Casa Particular Page
 */
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

$pageTitle = 'Casa Particular — Private Houses in Cuba';
$pageDesc  = 'Stay in authentic private homes across Cuba. TropiCollage curates the best casa particular listings for a genuine Cuban experience.';

$location = trim($_GET['location'] ?? '');

$where  = "WHERE is_active=1";
$params = [];
if ($location) {
    $where .= " AND location LIKE ?";
    $params[] = '%' . $location . '%';
}

$casas = dbFetchAll("SELECT * FROM casas $where ORDER BY is_featured DESC, created_at DESC", $params);

include __DIR__ . '/includes/header.php';
?>

<section class="page-hero">
    <div class="container text-center">
        <span class="hero-badge"><i class="fas fa-home me-1"></i>Authentic Cuba</span>
        <h1 class="mt-2 mb-2">Casa Particular</h1>
        <p class="opacity-90">Private homes across Cuba — real people, real experiences</p>
    </div>
</section>

<section class="py-4 bg-light-blue">
    <div class="container">
        <form class="filter-bar" method="GET">
            <div class="row g-3 align-items-end">
                <div class="col-sm-8 col-lg-9">
                    <label class="form-label">Filter by Location</label>
                    <input type="text" name="location" class="form-control" value="<?= h($location) ?>" placeholder="e.g. Havana, Trinidad, Pinar del Río...">
                </div>
                <div class="col-sm-4 col-lg-3 d-flex gap-2">
                    <button type="submit" class="btn btn-primary flex-grow-1"><i class="fas fa-search me-1"></i>Search</button>
                    <a href="casas.php" class="btn btn-outline-secondary"><i class="fas fa-times"></i></a>
                </div>
            </div>
        </form>
    </div>
</section>

<section class="py-5">
    <div class="container">
        <!-- Intro -->
        <div class="row align-items-center g-4 mb-5">
            <div class="col-lg-7">
                <span class="section-badge">What is Casa Particular?</span>
                <h2 class="section-title">Stay Like a Local in Cuba</h2>
                <div class="section-divider mb-3"></div>
                <p class="text-muted">A <strong>Casa Particular</strong> is a privately owned home in Cuba where families rent out one or more rooms to travelers. It's the most authentic and affordable way to experience Cuban hospitality — home-cooked meals, local stories, and a genuine connection to the culture.</p>
                <p class="text-muted mb-3">All our casas are handpicked and verified. We work directly with the host families to ensure quality and comfort.</p>
                <a href="<?= whatsappLink('Hello! I\'d like to book a Casa Particular in Cuba. Can you help me?') ?>" target="_blank" class="btn btn-whatsapp">
                    <i class="fab fa-whatsapp me-2"></i>Ask About Availability
                </a>
            </div>
            <div class="col-lg-5">
                <div class="row g-3">
                    <?php
                    $perks = [
                        ['fas fa-utensils',          'Home-cooked Meals',    'Authentic Cuban breakfast and dinner included in many casas.'],
                        ['fas fa-wifi',               'WiFi Available',       'Most casas offer WiFi access for their guests.'],
                        ['fas fa-user-friends',       'Local Hosts',          'Your hosts share local tips, history, and culture.'],
                        ['fas fa-shield-alt',         'Safe &amp; Verified',  'All properties reviewed and verified by TropiCollage.'],
                    ];
                    foreach ($perks as $p):
                    ?>
                    <div class="col-6">
                        <div class="p-3 bg-light-blue rounded-3 text-center h-100">
                            <i class="<?= $p[0] ?> fa-lg text-primary mb-2"></i>
                            <div class="small fw-600"><?= $p[1] ?></div>
                            <div class="x-small text-muted mt-1" style="font-size:.75rem"><?= $p[2] ?></div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>

        <?php if (empty($casas)): ?>
        <div class="text-center py-5">
            <i class="fas fa-home fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">No casas found<?= $location ? ' for "' . h($location) . '"' : '' ?>.</h5>
            <p class="text-muted">Contact us on WhatsApp — we may have unlisted options.</p>
            <a href="<?= whatsappLink('Hello! I need a casa particular in Cuba. Can you help?') ?>" target="_blank" class="btn btn-whatsapp mt-2">
                <i class="fab fa-whatsapp me-2"></i>Ask on WhatsApp
            </a>
        </div>
        <?php else: ?>
        <p class="text-muted mb-3"><?= count($casas) ?> casa<?= count($casas) != 1 ? 's' : '' ?> available</p>
        <div class="row g-4">
            <?php foreach ($casas as $c):
                $amenities = $c['amenities'] ? explode(',', $c['amenities']) : [];
            ?>
            <div class="col-sm-6 col-lg-4">
                <div class="card h-100">
                    <?php if ($c['image_url']): ?>
                        <img src="<?= SITE_URL . '/' . h($c['image_url']) ?>" alt="<?= h($c['name']) ?>" class="card-img-top card-img-tall">
                    <?php else: ?>
                        <div class="card-img-top card-img-tall bg-warning d-flex align-items-center justify-content-center">
                            <i class="fas fa-home text-white fa-3x opacity-50"></i>
                        </div>
                    <?php endif; ?>
                    <?php if ($c['is_featured']): ?>
                        <span class="featured-badge"><i class="fas fa-star me-1"></i>Featured</span>
                    <?php endif; ?>
                    <div class="card-body d-flex flex-column">
                        <h6 class="fw-600 mb-1"><?= h($c['name']) ?></h6>
                        <p class="text-muted small mb-2"><i class="fas fa-map-marker-alt me-1 text-primary"></i><?= h($c['location']) ?></p>
                        <div class="d-flex gap-3 small text-muted mb-2">
                            <span><i class="fas fa-bed me-1"></i><?= (int)$c['rooms'] ?> room<?= $c['rooms'] != 1 ? 's' : '' ?></span>
                            <span><i class="fas fa-users me-1"></i>Up to <?= (int)$c['capacity'] ?></span>
                        </div>
                        <?php if ($c['description']): ?>
                            <p class="small text-muted mb-3"><?= h(truncate($c['description'], 110)) ?></p>
                        <?php endif; ?>
                        <?php if ($amenities): ?>
                        <div class="d-flex flex-wrap gap-1 mb-3 casa-amenities">
                            <?php foreach (array_slice($amenities, 0, 4) as $am): ?>
                                <span class="badge bg-light text-dark border"><?= h(trim($am)) ?></span>
                            <?php endforeach; ?>
                        </div>
                        <?php endif; ?>
                        <?php if ($c['host_name']): ?>
                            <p class="small text-muted mb-2"><i class="fas fa-user me-1"></i>Host: <?= h($c['host_name']) ?></p>
                        <?php endif; ?>
                        <div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                            <div class="casa-price"><?= $c['price_per_night'] ? formatPrice($c['price_per_night'], $c['currency']) . '/night' : 'Ask for price' ?></div>
                            <a href="<?= whatsappLink('Hello! I\'m interested in the Casa Particular: ' . $c['name'] . ' in ' . $c['location'] . '. Is it available?') ?>"
                               target="_blank" class="btn btn-whatsapp btn-sm">
                                <i class="fab fa-whatsapp me-1"></i>Book
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
    </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
