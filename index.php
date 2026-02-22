<?php
/**
 * TropiCollage Travel Agency — Homepage
 */
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

$pageTitle = 'Exclusive International Flights & Cuba Travel';
$pageDesc  = 'TropiCollage — Exclusive international flights not on standard platforms, Cuba casa particulares, and private car rentals in Pinar del Río.';

// Fetch featured flights
$featuredFlights = dbFetchAll("SELECT * FROM flights WHERE is_featured=1 AND is_active=1 ORDER BY created_at DESC LIMIT 6");

// Fetch featured news
$featuredNews = dbFetchAll("SELECT * FROM news ORDER BY is_featured DESC, created_at DESC LIMIT 3");

// Fetch featured casas
$featuredCasas = dbFetchAll("SELECT * FROM casas WHERE is_featured=1 AND is_active=1 ORDER BY created_at DESC LIMIT 3");

// Fetch cars by category (one per category)
// Fetch featured cars — one per category (MySQL 5.7+ compatible)
$featuredCars = dbFetchAll("SELECT c.* FROM cars c INNER JOIN (SELECT category, MAX(id) AS max_id FROM cars WHERE is_active=1 GROUP BY category) sub ON c.id = sub.max_id ORDER BY c.category LIMIT 4");

include __DIR__ . '/includes/header.php';
?>

<!-- ── Hero ── -->
<section class="hero">
    <div class="container position-relative">
        <div class="row align-items-center gy-4">
            <div class="col-lg-6">
                <span class="hero-badge"><i class="fas fa-star me-1"></i>Exclusive Flights Not on Standard Platforms</span>
                <h1 class="hero-title mb-3">
                    Discover Cuba &amp;<br>The World with Us
                </h1>
                <p class="hero-subtitle mb-4">
                    TropiCollage Travel Agency — your specialist for hard-to-find international flights,
                    authentic Cuban casa particulares, and private car rentals in Pinar del Río.
                </p>
                <div class="d-flex flex-wrap gap-2">
                    <a href="flights.php" class="btn btn-secondary btn-lg">
                        <i class="fas fa-plane me-2"></i>View Flights
                    </a>
                    <a href="<?= whatsappLink('Hello TropiCollage! I need help finding a flight.') ?>" target="_blank" class="btn btn-whatsapp btn-lg">
                        <i class="fab fa-whatsapp me-2"></i>WhatsApp Us
                    </a>
                </div>
                <div class="hero-stats d-flex flex-wrap gap-4 mt-3">
                    <div>
                        <div class="hero-stat-num"><?= dbCount("SELECT COUNT(*) FROM flights WHERE is_active=1") ?>+</div>
                        <div class="hero-stat-label">Exclusive Flights</div>
                    </div>
                    <div>
                        <div class="hero-stat-num"><?= dbCount("SELECT COUNT(*) FROM casas WHERE is_active=1") ?>+</div>
                        <div class="hero-stat-label">Casa Particulares</div>
                    </div>
                    <div>
                        <div class="hero-stat-num"><?= dbCount("SELECT COUNT(*) FROM cars WHERE is_active=1") ?>+</div>
                        <div class="hero-stat-label">Rental Cars</div>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="hero-search">
                    <h5 class="text-white mb-3"><i class="fas fa-search me-2"></i>Quick Flight Search</h5>
                    <form action="flights.php" method="GET" class="row g-2">
                        <div class="col-6">
                            <label class="form-label text-white-50 small">From</label>
                            <input type="text" name="origin" class="form-control" placeholder="City or country">
                        </div>
                        <div class="col-6">
                            <label class="form-label text-white-50 small">To</label>
                            <input type="text" name="destination" class="form-control" placeholder="City or country">
                        </div>
                        <div class="col-6">
                            <label class="form-label text-white-50 small">Departure Date</label>
                            <input type="date" name="date_from" class="form-control">
                        </div>
                        <div class="col-6">
                            <label class="form-label text-white-50 small">Passengers</label>
                            <select name="pax" class="form-select">
                                <?php for ($i=1;$i<=9;$i++): ?>
                                    <option value="<?= $i ?>"><?= $i ?> <?= $i===1?'Passenger':'Passengers' ?></option>
                                <?php endfor; ?>
                            </select>
                        </div>
                        <div class="col-12">
                            <button type="submit" class="btn btn-secondary w-100">
                                <i class="fas fa-search me-2"></i>Search Flights
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- ── Services Overview ── -->
<section class="py-5">
    <div class="container">
        <div class="text-center mb-5">
            <span class="section-badge">What We Offer</span>
            <h2 class="section-title">Our Travel Services</h2>
            <div class="section-divider mx-auto"></div>
        </div>
        <div class="row g-4">
            <div class="col-sm-6 col-lg-3">
                <div class="service-box card h-100 service-box">
                    <div class="service-icon"><i class="fas fa-plane-departure"></i></div>
                    <h5 class="fw-600">Exclusive Flights</h5>
                    <p class="text-muted small mb-3">International flights not listed on standard booking platforms — we find the routes others can't.</p>
                    <a href="flights.php" class="btn btn-outline-primary btn-sm mt-auto">View Flights</a>
                </div>
            </div>
            <div class="col-sm-6 col-lg-3">
                <div class="service-box card h-100">
                    <div class="service-icon"><i class="fas fa-home"></i></div>
                    <h5 class="fw-600">Casa Particular</h5>
                    <p class="text-muted small mb-3">Authentic private homes in Cuba — a warm, local experience at every destination.</p>
                    <a href="casas.php" class="btn btn-outline-primary btn-sm mt-auto">View Casas</a>
                </div>
            </div>
            <div class="col-sm-6 col-lg-3">
                <div class="service-box card h-100">
                    <div class="service-icon"><i class="fas fa-car"></i></div>
                    <h5 class="fw-600">Car Rental</h5>
                    <p class="text-muted small mb-3">Private car rentals in Pinar del Río, Cuba — all categories, competitive rates.</p>
                    <a href="cars.php" class="btn btn-outline-primary btn-sm mt-auto">View Cars</a>
                </div>
            </div>
            <div class="col-sm-6 col-lg-3">
                <div class="service-box card h-100">
                    <div class="service-icon"><i class="fas fa-concierge-bell"></i></div>
                    <h5 class="fw-600">Custom Requests</h5>
                    <p class="text-muted small mb-3">Need something special? We offer tailored services — just tell us what you need.</p>
                    <a href="request.php" class="btn btn-outline-primary btn-sm mt-auto">Request Now</a>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- ── Latest News ── -->
<?php if ($featuredNews): ?>
<section class="py-5 bg-light-blue">
    <div class="container">
        <div class="d-flex justify-content-between align-items-end mb-4">
            <div>
                <span class="section-badge">Updates</span>
                <h2 class="section-title mb-0">Latest News &amp; Offers</h2>
                <div class="section-divider"></div>
            </div>
        </div>
        <div class="row g-4">
            <?php foreach ($featuredNews as $n): ?>
            <div class="col-md-4">
                <div class="card news-card h-100">
                    <?php if ($n['image_url']): ?>
                        <img src="<?= SITE_URL . '/' . h($n['image_url']) ?>" alt="<?= h($n['title']) ?>" class="card-img-top">
                    <?php else: ?>
                        <div class="card-img-top bg-primary d-flex align-items-center justify-content-center" style="height:180px">
                            <i class="fas fa-newspaper text-white fa-3x opacity-50"></i>
                        </div>
                    <?php endif; ?>
                    <div class="card-body">
                        <p class="news-date mb-1"><i class="far fa-clock me-1"></i><?= timeAgo($n['created_at']) ?></p>
                        <h6 class="news-title"><?= h($n['title']) ?></h6>
                        <p class="text-muted small"><?= h(truncate($n['content'], 120)) ?></p>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- ── Featured Flights ── -->
<?php if ($featuredFlights): ?>
<section class="py-5">
    <div class="container">
        <div class="d-flex justify-content-between align-items-end mb-4">
            <div>
                <span class="section-badge">Exclusive Routes</span>
                <h2 class="section-title mb-0">Featured Flights</h2>
                <div class="section-divider"></div>
            </div>
            <a href="flights.php" class="btn btn-outline-primary btn-sm d-none d-md-inline-flex">
                View All <i class="fas fa-arrow-right ms-1"></i>
            </a>
        </div>
        <div class="row g-4">
            <?php foreach ($featuredFlights as $f): ?>
            <div class="col-sm-6 col-lg-4">
                <div class="card flight-card h-100 position-relative">
                    <span class="featured-badge"><i class="fas fa-star me-1"></i>Featured</span>
                    <?php if ($f['image_url']): ?>
                        <img src="<?= SITE_URL . '/' . h($f['image_url']) ?>" alt="<?= h($f['title']) ?>" class="card-img-top">
                    <?php else: ?>
                        <div class="card-img-top bg-primary d-flex align-items-center justify-content-center" style="height:200px">
                            <i class="fas fa-plane text-white fa-3x opacity-50"></i>
                        </div>
                    <?php endif; ?>
                    <div class="card-body d-flex flex-column">
                        <div class="route-line mb-2">
                            <span><?= h($f['origin']) ?></span>
                            <span class="route-arrow"><i class="fas fa-arrow-right"></i></span>
                            <span><?= h($f['destination']) ?></span>
                        </div>
                        <h6 class="fw-600 mb-1"><?= h($f['title']) ?></h6>
                        <?php if ($f['airline']): ?>
                            <p class="text-muted small mb-2"><i class="fas fa-plane-departure me-1"></i><?= h($f['airline']) ?></p>
                        <?php endif; ?>
                        <?php if ($f['departure_date']): ?>
                            <p class="small mb-2"><i class="far fa-calendar me-1 text-primary"></i><?= formatDate($f['departure_date']) ?></p>
                        <?php endif; ?>
                        <div class="mt-auto pt-2 d-flex justify-content-between align-items-center border-top">
                            <div class="price-tag"><?= $f['price'] ? formatPrice($f['price'], $f['currency']) : 'Ask for price' ?></div>
                            <a href="<?= whatsappLink('Hello! I\'m interested in the flight from ' . $f['origin'] . ' to ' . $f['destination'] . '. Can you help?') ?>"
                               target="_blank" class="btn btn-whatsapp btn-sm">
                                <i class="fab fa-whatsapp me-1"></i>Book
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        <div class="text-center mt-4 d-md-none">
            <a href="flights.php" class="btn btn-primary">View All Flights</a>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- ── Casa Particular ── -->
<?php if ($featuredCasas): ?>
<section class="py-5 bg-light-blue">
    <div class="container">
        <div class="d-flex justify-content-between align-items-end mb-4">
            <div>
                <span class="section-badge">Authentic Cuba</span>
                <h2 class="section-title mb-0">Casa Particular</h2>
                <div class="section-divider"></div>
            </div>
            <a href="casas.php" class="btn btn-outline-primary btn-sm d-none d-md-inline-flex">
                View All <i class="fas fa-arrow-right ms-1"></i>
            </a>
        </div>
        <div class="row g-4">
            <?php foreach ($featuredCasas as $c): ?>
            <div class="col-md-4">
                <div class="card h-100">
                    <?php if ($c['image_url']): ?>
                        <img src="<?= SITE_URL . '/' . h($c['image_url']) ?>" alt="<?= h($c['name']) ?>" class="card-img-top card-img-tall">
                    <?php else: ?>
                        <div class="card-img-top card-img-tall bg-warning d-flex align-items-center justify-content-center">
                            <i class="fas fa-home text-white fa-3x opacity-50"></i>
                        </div>
                    <?php endif; ?>
                    <div class="card-body d-flex flex-column">
                        <h6 class="fw-600 mb-1"><?= h($c['name']) ?></h6>
                        <p class="text-muted small mb-2"><i class="fas fa-map-marker-alt me-1"></i><?= h($c['location']) ?></p>
                        <p class="small text-muted mb-3"><?= h(truncate($c['description'] ?? '', 100)) ?></p>
                        <div class="mt-auto d-flex justify-content-between align-items-center border-top pt-2">
                            <div class="casa-price"><?= $c['price_per_night'] ? formatPrice($c['price_per_night'], $c['currency']) . '/night' : 'Ask for price' ?></div>
                            <a href="<?= whatsappLink('Hello! I\'m interested in the casa particular: ' . $c['name'] . ' in ' . $c['location']) ?>"
                               target="_blank" class="btn btn-whatsapp btn-sm">
                                <i class="fab fa-whatsapp me-1"></i>Inquire
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- ── Car Rental ── -->
<?php if ($featuredCars): ?>
<section class="py-5">
    <div class="container">
        <div class="d-flex justify-content-between align-items-end mb-4">
            <div>
                <span class="section-badge">Pinar del Río, Cuba</span>
                <h2 class="section-title mb-0">Car Rental</h2>
                <div class="section-divider"></div>
            </div>
            <a href="cars.php" class="btn btn-outline-primary btn-sm d-none d-md-inline-flex">
                View All <i class="fas fa-arrow-right ms-1"></i>
            </a>
        </div>
        <div class="row g-4">
            <?php
            $catColors = ['economy'=>'success','compact'=>'info','sedan'=>'primary','suv'=>'warning','luxury'=>'danger','classic'=>'dark','minivan'=>'secondary'];
            foreach ($featuredCars as $car):
                $catLabel = carCategories()[$car['category']] ?? ucfirst($car['category']);
                $catColor = $catColors[$car['category']] ?? 'primary';
            ?>
            <div class="col-sm-6 col-lg-3">
                <div class="card h-100">
                    <?php if ($car['image_url']): ?>
                        <img src="<?= SITE_URL . '/' . h($car['image_url']) ?>" alt="<?= h($car['make'] . ' ' . $car['model']) ?>" class="card-img-top" style="height:180px;object-fit:cover">
                    <?php else: ?>
                        <div class="card-img-top d-flex align-items-center justify-content-center bg-light" style="height:180px">
                            <i class="fas fa-car fa-3x text-secondary opacity-50"></i>
                        </div>
                    <?php endif; ?>
                    <div class="card-body d-flex flex-column">
                        <span class="badge bg-<?= $catColor ?> car-category-badge mb-2"><?= h($catLabel) ?></span>
                        <h6 class="fw-600 mb-1"><?= h(($car['make'] ?? '') . ' ' . ($car['model'] ?? '')) ?: 'Vehicle' ?></h6>
                        <p class="small text-muted mb-2"><i class="fas fa-map-marker-alt me-1"></i><?= h($car['location']) ?></p>
                        <?php if ($car['capacity']): ?>
                            <p class="small text-muted mb-2"><i class="fas fa-users me-1"></i><?= $car['capacity'] ?> passengers</p>
                        <?php endif; ?>
                        <div class="mt-auto d-flex justify-content-between align-items-center border-top pt-2">
                            <div class="car-price"><?= $car['price_per_day'] ? formatPrice($car['price_per_day'], $car['currency']) : 'Ask' ?><span>/day</span></div>
                            <a href="<?= whatsappLink('Hello! I need a car rental in Pinar del Río: ' . ($car['make'] ?? '') . ' ' . ($car['model'] ?? '') . ' (' . $catLabel . ')') ?>"
                               target="_blank" class="btn btn-whatsapp btn-sm">
                                <i class="fab fa-whatsapp me-1"></i>Book
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- ── Why Choose Us ── -->
<section class="py-5 bg-light-blue">
    <div class="container">
        <div class="text-center mb-5">
            <span class="section-badge">Our Advantage</span>
            <h2 class="section-title">Why Choose TropiCollage?</h2>
            <div class="section-divider mx-auto"></div>
        </div>
        <div class="row g-4">
            <?php
            $features = [
                ['fas fa-plane-departure', 'Exclusive Routes',       'We find flights that are not available on Expedia, Google Flights, or any standard platform.'],
                ['fas fa-shield-alt',      'Trusted &amp; Reliable', 'Years of experience connecting travelers with hard-to-find routes in and out of Cuba.'],
                ['fab fa-whatsapp',        'WhatsApp Support',       'Real-time support via WhatsApp — no bots, just real people helping you plan your trip.'],
                ['fas fa-dollar-sign',     'Competitive Prices',     'We work with private owners and special operators to bring you the best possible rates.'],
                ['fas fa-user-cog',        'Custom Services',        'Can\'t find what you need? Ask us — we arrange bespoke travel packages tailored to you.'],
                ['fas fa-map-marked-alt',  'Cuba Specialists',       'Deep knowledge of Cuba: casas particulares, Pinar del Río, Havana, Trinidad, and beyond.'],
            ];
            foreach ($features as $feat):
            ?>
            <div class="col-sm-6 col-lg-4">
                <div class="d-flex gap-3 align-items-start p-3">
                    <div class="feature-icon"><i class="<?= $feat[0] ?>"></i></div>
                    <div>
                        <h6 class="fw-600 mb-1"><?= $feat[1] ?></h6>
                        <p class="text-muted small mb-0"><?= $feat[2] ?></p>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ── CTA ── -->
<section class="py-5" style="background: linear-gradient(135deg, var(--primary-dark), var(--primary));">
    <div class="container text-center text-white">
        <h2 class="fw-700 mb-2" style="font-family:var(--font-display)">Ready to Travel?</h2>
        <p class="mb-4 opacity-90">Contact us on WhatsApp for personalized assistance — or request a custom service.</p>
        <div class="d-flex flex-wrap gap-3 justify-content-center">
            <a href="<?= whatsappLink('Hello TropiCollage! I need travel assistance.') ?>" target="_blank" class="btn btn-whatsapp btn-lg">
                <i class="fab fa-whatsapp me-2"></i>Chat on WhatsApp
            </a>
            <a href="request.php" class="btn btn-light btn-lg text-primary">
                <i class="fas fa-concierge-bell me-2"></i>Request Custom Service
            </a>
        </div>
    </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
