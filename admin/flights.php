<?php
/**
 * TropiCollage Admin — Manage Flights
 */
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireLogin();
$adminTitle = 'Flights';
$action     = $_GET['action'] ?? 'list';
$id         = (int)($_GET['id'] ?? 0);

// ── DELETE ────────────────────────────────────────────────
if ($action === 'delete' && $id) {
    if (!verifyCsrf($_GET['csrf'] ?? '')) { flashMessage('error', 'Invalid CSRF token.'); redirect(SITE_URL.'/admin/flights.php'); }
    dbExecute("DELETE FROM flights WHERE id=?", [$id]);
    flashMessage('success', 'Flight deleted.');
    redirect(SITE_URL . '/admin/flights.php');
}

// ── TOGGLE ACTIVE ────────────────────────────────────────
if ($action === 'toggle' && $id) {
    dbExecute("UPDATE flights SET is_active = NOT is_active WHERE id=?", [$id]);
    redirect(SITE_URL . '/admin/flights.php');
}

// ── SAVE (ADD / EDIT) ────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrf($_POST['csrf_token'] ?? '')) { flashMessage('error', 'Invalid request.'); redirect(SITE_URL.'/admin/flights.php'); }
    $d = [
        'title'          => trim($_POST['title'] ?? ''),
        'origin'         => trim($_POST['origin'] ?? ''),
        'destination'    => trim($_POST['destination'] ?? ''),
        'airline'        => trim($_POST['airline'] ?? ''),
        'departure_date' => $_POST['departure_date'] ?: null,
        'return_date'    => $_POST['return_date'] ?: null,
        'price'          => $_POST['price'] !== '' ? (float)$_POST['price'] : null,
        'currency'       => $_POST['currency'] ?? 'USD',
        'availability'   => (int)($_POST['availability'] ?? 0),
        'description'    => trim($_POST['description'] ?? ''),
        'highlights'     => trim($_POST['highlights'] ?? ''),
        'is_featured'    => isset($_POST['is_featured']) ? 1 : 0,
        'is_active'      => isset($_POST['is_active']) ? 1 : 0,
    ];
    $imgUrl = handleFileUpload('image', 'flights');
    $editId = (int)($_POST['edit_id'] ?? 0);
    if ($editId) {
        $existing = dbFetchOne("SELECT image_url FROM flights WHERE id=?", [$editId]);
        if (!$imgUrl && $existing) $imgUrl = $existing['image_url'];
        dbExecute("UPDATE flights SET title=?,origin=?,destination=?,airline=?,departure_date=?,return_date=?,price=?,currency=?,availability=?,description=?,highlights=?,image_url=?,is_featured=?,is_active=? WHERE id=?",
            [$d['title'],$d['origin'],$d['destination'],$d['airline'],$d['departure_date'],$d['return_date'],$d['price'],$d['currency'],$d['availability'],$d['description'],$d['highlights'],$imgUrl,$d['is_featured'],$d['is_active'],$editId]);
        flashMessage('success', 'Flight updated.');
    } else {
        dbExecute("INSERT INTO flights (title,origin,destination,airline,departure_date,return_date,price,currency,availability,description,highlights,image_url,is_featured,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [$d['title'],$d['origin'],$d['destination'],$d['airline'],$d['departure_date'],$d['return_date'],$d['price'],$d['currency'],$d['availability'],$d['description'],$d['highlights'],$imgUrl,$d['is_featured'],$d['is_active']]);
        flashMessage('success', 'Flight added.');
    }
    redirect(SITE_URL . '/admin/flights.php');
}

$flights  = dbFetchAll("SELECT * FROM flights ORDER BY created_at DESC");
$editItem = $id && $action === 'edit' ? dbFetchOne("SELECT * FROM flights WHERE id=?", [$id]) : null;
include __DIR__ . '/../includes/admin_header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="fw-600 mb-0"><i class="fas fa-plane me-2 text-primary"></i>Manage Flights</h4>
    <a href="flights.php?action=add" class="btn btn-primary btn-sm"><i class="fas fa-plus me-1"></i>Add Flight</a>
</div>

<?php renderFlash(); ?>

<?php if ($action === 'add' || $action === 'edit'): ?>
<div class="card mb-4">
    <div class="card-header fw-600"><?= $action === 'edit' ? 'Edit Flight' : 'Add New Flight' ?></div>
    <div class="card-body">
        <form method="POST" action="flights.php" enctype="multipart/form-data">
            <input type="hidden" name="csrf_token" value="<?= csrfToken() ?>">
            <?php if ($editItem): ?>
                <input type="hidden" name="edit_id" value="<?= $editItem['id'] ?>">
            <?php endif; ?>
            <div class="row g-3">
                <div class="col-md-8">
                    <label class="form-label">Title <span class="required-star">*</span></label>
                    <input type="text" name="title" class="form-control" required value="<?= h($editItem['title'] ?? '') ?>" placeholder="e.g. Havana – Miami Special Charter">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Airline</label>
                    <input type="text" name="airline" class="form-control" value="<?= h($editItem['airline'] ?? '') ?>">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Origin <span class="required-star">*</span></label>
                    <input type="text" name="origin" class="form-control" required value="<?= h($editItem['origin'] ?? '') ?>" placeholder="e.g. Havana, Cuba">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Destination <span class="required-star">*</span></label>
                    <input type="text" name="destination" class="form-control" required value="<?= h($editItem['destination'] ?? '') ?>" placeholder="e.g. Miami, USA">
                </div>
                <div class="col-md-3">
                    <label class="form-label">Departure Date</label>
                    <input type="date" name="departure_date" class="form-control" value="<?= h($editItem['departure_date'] ?? '') ?>">
                </div>
                <div class="col-md-3">
                    <label class="form-label">Return Date</label>
                    <input type="date" name="return_date" class="form-control" value="<?= h($editItem['return_date'] ?? '') ?>">
                </div>
                <div class="col-md-3">
                    <label class="form-label">Price</label>
                    <input type="number" name="price" class="form-control" step="0.01" min="0" value="<?= h($editItem['price'] ?? '') ?>" placeholder="Leave blank to show 'Ask'">
                </div>
                <div class="col-md-1">
                    <label class="form-label">Currency</label>
                    <select name="currency" class="form-select">
                        <?php foreach (['USD','EUR','CUP'] as $c): ?>
                            <option value="<?= $c ?>" <?= ($editItem['currency'] ?? 'USD') === $c ? 'selected' : '' ?>><?= $c ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label">Seats Available</label>
                    <input type="number" name="availability" class="form-control" min="0" value="<?= (int)($editItem['availability'] ?? 0) ?>">
                </div>
                <div class="col-12">
                    <label class="form-label">Description</label>
                    <textarea name="description" class="form-control" rows="3"><?= h($editItem['description'] ?? '') ?></textarea>
                </div>
                <div class="col-12">
                    <label class="form-label">Highlights (one per line)</label>
                    <textarea name="highlights" class="form-control" rows="3" placeholder="Special deal&#10;No visa required&#10;Includes baggage"><?= h($editItem['highlights'] ?? '') ?></textarea>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Image</label>
                    <input type="file" name="image" class="form-control" accept="image/*" data-preview="imgPreview">
                    <?php if (!empty($editItem['image_url'])): ?>
                        <img src="<?= SITE_URL . '/' . h($editItem['image_url']) ?>" id="imgPreview" class="mt-2 rounded" style="max-height:100px">
                    <?php else: ?>
                        <img id="imgPreview" class="mt-2 rounded d-none" style="max-height:100px">
                    <?php endif; ?>
                </div>
                <div class="col-md-6 d-flex flex-column gap-2 justify-content-end">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="is_featured" id="chkFeat" <?= ($editItem['is_featured'] ?? 0) ? 'checked' : '' ?>>
                        <label class="form-check-label" for="chkFeat">Featured on homepage</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="is_active" id="chkActive" <?= ($editItem['is_active'] ?? 1) ? 'checked' : '' ?>>
                        <label class="form-check-label" for="chkActive">Active (visible on website)</label>
                    </div>
                </div>
                <div class="col-12 d-flex gap-2">
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save me-1"></i>Save Flight</button>
                    <a href="flights.php" class="btn btn-outline-secondary">Cancel</a>
                </div>
            </div>
        </form>
    </div>
</div>
<?php endif; ?>

<!-- List -->
<div class="card table-card">
    <div class="card-header fw-600">All Flights (<?= count($flights) ?>)</div>
    <div class="table-responsive">
        <table class="table mb-0">
            <thead><tr>
                <th>#</th><th>Route</th><th>Airline</th><th>Date</th><th>Price</th><th>Seats</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
            <?php if (empty($flights)): ?>
                <tr><td colspan="8" class="text-center text-muted py-4">No flights yet. <a href="flights.php?action=add">Add the first one.</a></td></tr>
            <?php else: ?>
            <?php foreach ($flights as $f): ?>
            <tr>
                <td class="text-muted small"><?= $f['id'] ?></td>
                <td>
                    <div class="fw-600 small"><?= h($f['origin']) ?> → <?= h($f['destination']) ?></div>
                    <div class="text-muted" style="font-size:.75rem"><?= h(truncate($f['title'], 40)) ?></div>
                </td>
                <td class="small"><?= h($f['airline'] ?: '—') ?></td>
                <td class="small"><?= $f['departure_date'] ? formatDate($f['departure_date']) : '—' ?></td>
                <td class="small"><?= $f['price'] ? formatPrice($f['price'], $f['currency']) : '—' ?></td>
                <td class="small"><?= $f['availability'] ?: '—' ?></td>
                <td>
                    <?php if ($f['is_featured']): ?><span class="badge bg-warning me-1">Featured</span><?php endif; ?>
                    <span class="badge bg-<?= $f['is_active'] ? 'success' : 'secondary' ?>"><?= $f['is_active'] ? 'Active' : 'Hidden' ?></span>
                </td>
                <td>
                    <a href="flights.php?action=edit&id=<?= $f['id'] ?>" class="btn btn-xs btn-sm btn-outline-primary me-1"><i class="fas fa-edit"></i></a>
                    <a href="flights.php?action=toggle&id=<?= $f['id'] ?>" class="btn btn-xs btn-sm btn-outline-secondary me-1" title="Toggle visibility"><i class="fas fa-eye<?= $f['is_active'] ? '-slash' : '' ?>"></i></a>
                    <a href="flights.php?action=delete&id=<?= $f['id'] ?>&csrf=<?= csrfToken() ?>"
                       class="btn btn-xs btn-sm btn-outline-danger"
                       data-confirm="Delete this flight permanently?"
                       ><i class="fas fa-trash"></i></a>
                </td>
            </tr>
            <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php include __DIR__ . '/../includes/admin_footer.php'; ?>
