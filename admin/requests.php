<?php
/**
 * TropiCollage Admin — Service Requests
 */
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireLogin();
$adminTitle = 'Service Requests';
$action     = trim($_GET['action'] ?? '');
$id         = (int)($_GET['id'] ?? 0);
$status     = trim($_GET['status'] ?? '');

// Update status
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $id) {
    if (!verifyCsrf($_POST['csrf_token'] ?? '')) { flashMessage('error','Invalid request.'); redirect(SITE_URL.'/admin/requests.php'); }
    $newStatus   = trim($_POST['status'] ?? 'pending');
    $adminNotes  = trim($_POST['admin_notes'] ?? '');
    dbExecute("UPDATE service_requests SET status=?, admin_notes=? WHERE id=?", [$newStatus, $adminNotes, $id]);
    flashMessage('success', 'Request updated.');
    redirect(SITE_URL . '/admin/requests.php?id=' . $id);
}

// Delete
if (($action ?? '') === 'delete' && $id) {
    if (!verifyCsrf($_GET['csrf'] ?? '')) { flashMessage('error','Invalid CSRF.'); redirect(SITE_URL.'/admin/requests.php'); }
    dbExecute("DELETE FROM service_requests WHERE id=?", [$id]);
    flashMessage('success', 'Request deleted.');
    redirect(SITE_URL . '/admin/requests.php');
}

$where    = $status ? "WHERE status=?" : "";
$params   = $status ? [$status] : [];
$requests = dbFetchAll("SELECT * FROM service_requests $where ORDER BY created_at DESC", $params);
$viewItem = $id ? dbFetchOne("SELECT * FROM service_requests WHERE id=?", [$id]) : null;

include __DIR__ . '/../includes/admin_header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="fw-600 mb-0"><i class="fas fa-inbox me-2 text-danger"></i>Service Requests</h4>
    <div class="d-flex gap-2">
        <a href="requests.php" class="btn btn-sm btn-outline-secondary <?= !$status ? 'active' : '' ?>">All</a>
        <a href="requests.php?status=pending" class="btn btn-sm btn-outline-danger <?= $status==='pending' ? 'active' : '' ?>">Pending</a>
        <a href="requests.php?status=in_progress" class="btn btn-sm btn-outline-warning <?= $status==='in_progress' ? 'active' : '' ?>">In Progress</a>
        <a href="requests.php?status=done" class="btn btn-sm btn-outline-success <?= $status==='done' ? 'active' : '' ?>">Done</a>
    </div>
</div>

<?php renderFlash(); ?>

<?php if ($viewItem): ?>
<!-- Detail view -->
<div class="row g-4 mb-4">
    <div class="col-lg-7">
        <div class="card">
            <div class="card-header fw-600">Request #<?= $viewItem['id'] ?> — <?= h($viewItem['name']) ?></div>
            <div class="card-body">
                <dl class="row mb-0">
                    <dt class="col-sm-4">Name</dt>
                    <dd class="col-sm-8"><?= h($viewItem['name']) ?></dd>
                    <dt class="col-sm-4">Email</dt>
                    <dd class="col-sm-8"><?= $viewItem['email'] ? '<a href="mailto:'.h($viewItem['email']).'">'.h($viewItem['email']).'</a>' : '—' ?></dd>
                    <dt class="col-sm-4">Phone / WhatsApp</dt>
                    <dd class="col-sm-8">
                        <?php if ($viewItem['phone']): ?>
                            <?= h($viewItem['phone']) ?>
                            <a href="<?= whatsappLink('Hello ' . $viewItem['name'] . '! I am contacting you from TropiCollage Travel Agency regarding your service request.') ?>&phone=<?= preg_replace('/\D/','',$viewItem['phone']) ?>"
                               target="_blank" class="btn btn-whatsapp btn-sm ms-2"><i class="fab fa-whatsapp me-1"></i>Reply</a>
                        <?php else: ?> — <?php endif; ?>
                    </dd>
                    <dt class="col-sm-4">Service Type</dt>
                    <dd class="col-sm-8"><?= h(serviceTypes()[$viewItem['service_type']] ?? $viewItem['service_type'] ?: '—') ?></dd>
                    <dt class="col-sm-4">Travel Dates</dt>
                    <dd class="col-sm-8"><?= h($viewItem['travel_dates'] ?: '—') ?></dd>
                    <dt class="col-sm-4">Travelers</dt>
                    <dd class="col-sm-8"><?= (int)$viewItem['num_travelers'] ?></dd>
                    <dt class="col-sm-4">Received</dt>
                    <dd class="col-sm-8"><?= formatDate($viewItem['created_at']) ?> (<?= timeAgo($viewItem['created_at']) ?>)</dd>
                    <dt class="col-sm-4">Details</dt>
                    <dd class="col-sm-8"><div class="bg-light p-3 rounded small"><?= nl2br(h($viewItem['details'])) ?></div></dd>
                </dl>
            </div>
        </div>
    </div>
    <div class="col-lg-5">
        <div class="card">
            <div class="card-header fw-600">Update Status</div>
            <div class="card-body">
                <form method="POST" action="requests.php?id=<?= $viewItem['id'] ?>">
                    <input type="hidden" name="csrf_token" value="<?= csrfToken() ?>">
                    <div class="mb-3">
                        <label class="form-label">Status</label>
                        <select name="status" class="form-select">
                            <?php foreach (['pending'=>'Pending','in_progress'=>'In Progress','done'=>'Done','cancelled'=>'Cancelled'] as $k=>$v): ?>
                                <option value="<?= $k ?>" <?= $viewItem['status'] === $k ? 'selected' : '' ?>><?= $v ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Admin Notes</label>
                        <textarea name="admin_notes" class="form-control" rows="4"><?= h($viewItem['admin_notes'] ?? '') ?></textarea>
                    </div>
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save me-1"></i>Update</button>
                        <a href="requests.php" class="btn btn-outline-secondary">← Back to List</a>
                    </div>
                </form>
            </div>
        </div>
        <?php if ($viewItem['phone'] || $viewItem['email']): ?>
        <div class="card mt-3">
            <div class="card-header fw-600">Contact Client</div>
            <div class="card-body d-grid gap-2">
                <?php if ($viewItem['phone']): ?>
                <a href="<?= whatsappLink('Hello ' . $viewItem['name'] . '! Thank you for contacting TropiCollage. I am following up on your request for: ' . ($viewItem['service_type'] ?? 'travel service') . '.') ?>"
                   target="_blank" class="btn btn-whatsapp">
                    <i class="fab fa-whatsapp me-2"></i>WhatsApp: <?= h($viewItem['phone']) ?>
                </a>
                <?php endif; ?>
                <?php if ($viewItem['email']): ?>
                <a href="mailto:<?= h($viewItem['email']) ?>?subject=Your TropiCollage Request" class="btn btn-outline-primary">
                    <i class="fas fa-envelope me-2"></i>Email: <?= h($viewItem['email']) ?>
                </a>
                <?php endif; ?>
            </div>
        </div>
        <?php endif; ?>
    </div>
</div>

<?php else: ?>

<div class="card table-card">
    <div class="card-header fw-600">All Requests (<?= count($requests) ?>)</div>
    <div class="table-responsive">
        <table class="table mb-0">
            <thead><tr><th>#</th><th>Name</th><th>Service</th><th>Phone/Email</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
            <?php if (empty($requests)): ?>
                <tr><td colspan="7" class="text-center text-muted py-4">No requests yet.</td></tr>
            <?php else: ?>
            <?php foreach ($requests as $r): ?>
            <tr>
                <td class="text-muted small"><?= $r['id'] ?></td>
                <td class="fw-600 small"><?= h($r['name']) ?></td>
                <td class="small"><?= h(serviceTypes()[$r['service_type']] ?? ($r['service_type'] ?: '—')) ?></td>
                <td class="small">
                    <?= $r['phone'] ? h($r['phone']) : ($r['email'] ? h($r['email']) : '—') ?>
                </td>
                <td class="small text-muted"><?= timeAgo($r['created_at']) ?></td>
                <td>
                    <span class="badge bg-<?= $r['status']==='pending' ? 'danger' : ($r['status']==='done' ? 'success' : ($r['status']==='in_progress' ? 'warning' : 'secondary')) ?>">
                        <?= h($r['status']) ?>
                    </span>
                </td>
                <td>
                    <a href="requests.php?id=<?= $r['id'] ?>" class="btn btn-sm btn-outline-primary me-1"><i class="fas fa-eye"></i></a>
                    <a href="requests.php?action=delete&id=<?= $r['id'] ?>&csrf=<?= csrfToken() ?>"
                       class="btn btn-sm btn-outline-danger"
                       data-confirm="Delete this request?"><i class="fas fa-trash"></i></a>
                </td>
            </tr>
            <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
<?php endif; ?>

<?php include __DIR__ . '/../includes/admin_footer.php'; ?>
