<?php
/**
 * TropiCollage Admin — Dashboard
 */
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireLogin();
$adminTitle = 'Dashboard';

// Stats
$stats = [
    'flights'  => dbCount("SELECT COUNT(*) FROM flights WHERE is_active=1"),
    'news'     => dbCount("SELECT COUNT(*) FROM news"),
    'casas'    => dbCount("SELECT COUNT(*) FROM casas WHERE is_active=1"),
    'cars'     => dbCount("SELECT COUNT(*) FROM cars WHERE is_active=1"),
    'requests' => dbCount("SELECT COUNT(*) FROM service_requests"),
    'pending'  => dbCount("SELECT COUNT(*) FROM service_requests WHERE status='pending'"),
];

$recentRequests = dbFetchAll("SELECT * FROM service_requests ORDER BY created_at DESC LIMIT 5");
$recentFlights  = dbFetchAll("SELECT * FROM flights ORDER BY created_at DESC LIMIT 5");

include __DIR__ . '/../includes/admin_header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="fw-600 mb-0"><i class="fas fa-tachometer-alt me-2 text-primary"></i>Dashboard</h4>
    <span class="text-muted small">Welcome, <?= h($_SESSION['admin_username'] ?? 'Admin') ?></span>
</div>

<?php renderFlash(); ?>

<!-- Stat Cards -->
<div class="row g-3 mb-4">
    <?php
    $statCards = [
        ['flights',  'Flights',          'fas fa-plane',        'primary',   'admin/flights.php'],
        ['news',     'News Articles',     'fas fa-newspaper',    'success',   'admin/news.php'],
        ['casas',    'Casa Particulares', 'fas fa-home',         'warning',   'admin/casas.php'],
        ['cars',     'Rental Cars',       'fas fa-car',          'info',      'admin/cars.php'],
        ['requests', 'Total Requests',    'fas fa-inbox',        'secondary', 'admin/requests.php'],
        ['pending',  'Pending Requests',  'fas fa-clock',        'danger',    'admin/requests.php'],
    ];
    foreach ($statCards as [$key, $label, $icon, $color, $link]):
    ?>
    <div class="col-sm-6 col-lg-4 col-xl-2">
        <a href="<?= SITE_URL . '/' . $link ?>" class="text-decoration-none">
            <div class="card stat-card h-100">
                <div class="card-body d-flex align-items-center gap-3">
                    <div class="stat-icon bg-<?= $color ?> bg-opacity-10">
                        <i class="<?= $icon ?> text-<?= $color ?>"></i>
                    </div>
                    <div>
                        <div class="stat-num text-<?= $color ?>"><?= $stats[$key] ?></div>
                        <div class="small text-muted"><?= $label ?></div>
                    </div>
                </div>
            </div>
        </a>
    </div>
    <?php endforeach; ?>
</div>

<div class="row g-4">
    <!-- Quick Actions -->
    <div class="col-lg-4">
        <div class="card">
            <div class="card-header fw-600"><i class="fas fa-bolt me-2 text-warning"></i>Quick Actions</div>
            <div class="card-body p-3">
                <div class="d-grid gap-2">
                    <a href="flights.php?action=add" class="btn btn-outline-primary btn-sm text-start"><i class="fas fa-plus me-2"></i>Add New Flight</a>
                    <a href="news.php?action=add"    class="btn btn-outline-success btn-sm text-start"><i class="fas fa-plus me-2"></i>Add News Article</a>
                    <a href="casas.php?action=add"   class="btn btn-outline-warning btn-sm text-start"><i class="fas fa-plus me-2"></i>Add Casa Particular</a>
                    <a href="cars.php?action=add"    class="btn btn-outline-info btn-sm text-start"><i class="fas fa-plus me-2"></i>Add Rental Car</a>
                    <hr class="my-1">
                    <a href="requests.php"           class="btn btn-outline-danger btn-sm text-start"><i class="fas fa-inbox me-2"></i>View Requests (<?= $stats['pending'] ?> pending)</a>
                    <a href="<?= SITE_URL ?>/" target="_blank" class="btn btn-outline-secondary btn-sm text-start"><i class="fas fa-external-link-alt me-2"></i>View Live Website</a>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Requests -->
    <div class="col-lg-8">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span class="fw-600"><i class="fas fa-inbox me-2 text-danger"></i>Recent Service Requests</span>
                <a href="requests.php" class="btn btn-sm btn-outline-secondary">View All</a>
            </div>
            <div class="card-body p-0">
                <?php if (empty($recentRequests)): ?>
                    <p class="text-muted text-center py-4 mb-0">No requests yet.</p>
                <?php else: ?>
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead><tr>
                            <th>Name</th><th>Service</th><th>Date</th><th>Status</th><th></th>
                        </tr></thead>
                        <tbody>
                        <?php foreach ($recentRequests as $r): ?>
                        <tr>
                            <td><?= h($r['name']) ?></td>
                            <td><?= h(serviceTypes()[$r['service_type']] ?? $r['service_type'] ?: '—') ?></td>
                            <td class="text-muted small"><?= timeAgo($r['created_at']) ?></td>
                            <td>
                                <span class="badge bg-<?= $r['status']==='pending' ? 'danger' : ($r['status']==='done' ? 'success' : 'secondary') ?>">
                                    <?= h($r['status']) ?>
                                </span>
                            </td>
                            <td><a href="requests.php?id=<?= $r['id'] ?>" class="btn btn-xs btn-outline-primary btn-sm">View</a></td>
                        </tr>
                        <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/../includes/admin_footer.php'; ?>
