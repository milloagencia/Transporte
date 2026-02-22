<?php
/**
 * TropiCollage Admin — Manage Cars
 */
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireLogin();
$adminTitle = 'Cars';
$action     = $_GET['action'] ?? 'list';
$id         = (int)($_GET['id'] ?? 0);

if ($action === 'delete' && $id) {
    if (!verifyCsrf($_GET['csrf'] ?? '')) { flashMessage('error','Invalid CSRF.'); redirect(SITE_URL.'/admin/cars.php'); }
    dbExecute("DELETE FROM cars WHERE id=?", [$id]);
    flashMessage('success', 'Car deleted.');
    redirect(SITE_URL . '/admin/cars.php');
}

if ($action === 'toggle' && $id) {
    dbExecute("UPDATE cars SET is_available = NOT is_available WHERE id=?", [$id]);
    redirect(SITE_URL . '/admin/cars.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrf($_POST['csrf_token'] ?? '')) { flashMessage('error','Invalid request.'); redirect(SITE_URL.'/admin/cars.php'); }
    $d = [
        'category'     => trim($_POST['category'] ?? 'economy'),
        'make'         => trim($_POST['make'] ?? ''),
        'model'        => trim($_POST['model'] ?? ''),
        'year'         => $_POST['year'] ? (int)$_POST['year'] : null,
        'price_per_day'=> $_POST['price_per_day'] !== '' ? (float)$_POST['price_per_day'] : null,
        'currency'     => $_POST['currency'] ?? 'USD',
        'location'     => trim($_POST['location'] ?? 'Pinar del Río, Cuba'),
        'capacity'     => (int)($_POST['capacity'] ?? 4),
        'features'     => trim($_POST['features'] ?? ''),
        'description'  => trim($_POST['description'] ?? ''),
        'is_available' => isset($_POST['is_available']) ? 1 : 0,
        'is_active'    => isset($_POST['is_active']) ? 1 : 0,
    ];
    $imgUrl = handleFileUpload('image', 'cars');
    $editId = (int)($_POST['edit_id'] ?? 0);
    if ($editId) {
        $existing = dbFetchOne("SELECT image_url FROM cars WHERE id=?", [$editId]);
        if (!$imgUrl && $existing) $imgUrl = $existing['image_url'];
        dbExecute("UPDATE cars SET category=?,make=?,model=?,year=?,price_per_day=?,currency=?,location=?,capacity=?,features=?,description=?,image_url=?,is_available=?,is_active=? WHERE id=?",
            [$d['category'],$d['make'],$d['model'],$d['year'],$d['price_per_day'],$d['currency'],$d['location'],$d['capacity'],$d['features'],$d['description'],$imgUrl,$d['is_available'],$d['is_active'],$editId]);
        flashMessage('success', 'Car updated.');
    } else {
        dbExecute("INSERT INTO cars (category,make,model,year,price_per_day,currency,location,capacity,features,description,image_url,is_available,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [$d['category'],$d['make'],$d['model'],$d['year'],$d['price_per_day'],$d['currency'],$d['location'],$d['capacity'],$d['features'],$d['description'],$imgUrl,$d['is_available'],$d['is_active']]);
        flashMessage('success', 'Car added.');
    }
    redirect(SITE_URL . '/admin/cars.php');
}

$items      = dbFetchAll("SELECT * FROM cars ORDER BY category, created_at DESC");
$editItem   = $id && $action === 'edit' ? dbFetchOne("SELECT * FROM cars WHERE id=?", [$id]) : null;
$categories = carCategories();

include __DIR__ . '/../includes/admin_header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="fw-600 mb-0"><i class="fas fa-car me-2 text-info"></i>Manage Cars</h4>
    <a href="cars.php?action=add" class="btn btn-info btn-sm text-white"><i class="fas fa-plus me-1"></i>Add Car</a>
</div>
<?php renderFlash(); ?>

<?php if ($action === 'add' || $action === 'edit'): ?>
<div class="card mb-4">
    <div class="card-header fw-600"><?= $action === 'edit' ? 'Edit Car' : 'Add Car' ?></div>
    <div class="card-body">
        <form method="POST" action="cars.php" enctype="multipart/form-data">
            <input type="hidden" name="csrf_token" value="<?= csrfToken() ?>">
            <?php if ($editItem): ?><input type="hidden" name="edit_id" value="<?= $editItem['id'] ?>"><?php endif; ?>
            <div class="row g-3">
                <div class="col-md-3">
                    <label class="form-label">Category <span class="required-star">*</span></label>
                    <select name="category" class="form-select" required>
                        <?php foreach ($categories as $k => $v): ?>
                            <option value="<?= h($k) ?>" <?= ($editItem['category'] ?? 'economy') === $k ? 'selected' : '' ?>><?= h($v) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Make</label>
                    <input type="text" name="make" class="form-control" value="<?= h($editItem['make'] ?? '') ?>" placeholder="e.g. Toyota, Kia">
                </div>
                <div class="col-md-3">
                    <label class="form-label">Model</label>
                    <input type="text" name="model" class="form-control" value="<?= h($editItem['model'] ?? '') ?>" placeholder="e.g. Corolla, Sportage">
                </div>
                <div class="col-md-3">
                    <label class="form-label">Year</label>
                    <input type="number" name="year" class="form-control" min="1950" max="<?= date('Y')+1 ?>" value="<?= h($editItem['year'] ?? '') ?>">
                </div>
                <div class="col-md-3">
                    <label class="form-label">Price / Day</label>
                    <input type="number" name="price_per_day" class="form-control" step="0.01" min="0" value="<?= h($editItem['price_per_day'] ?? '') ?>">
                </div>
                <div class="col-md-2">
                    <label class="form-label">Currency</label>
                    <select name="currency" class="form-select">
                        <?php foreach (['USD','EUR','CUP'] as $c): ?>
                            <option value="<?= $c ?>" <?= ($editItem['currency'] ?? 'USD') === $c ? 'selected' : '' ?>><?= $c ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label">Passengers</label>
                    <input type="number" name="capacity" class="form-control" min="1" max="20" value="<?= (int)($editItem['capacity'] ?? 4) ?>">
                </div>
                <div class="col-md-5">
                    <label class="form-label">Location</label>
                    <input type="text" name="location" class="form-control" value="<?= h($editItem['location'] ?? 'Pinar del Río, Cuba') ?>">
                </div>
                <div class="col-12">
                    <label class="form-label">Features <span class="text-muted small">(comma-separated)</span></label>
                    <input type="text" name="features" class="form-control" value="<?= h($editItem['features'] ?? '') ?>" placeholder="AC, GPS, Automatic, Luggage Space">
                </div>
                <div class="col-12">
                    <label class="form-label">Description</label>
                    <textarea name="description" class="form-control" rows="2"><?= h($editItem['description'] ?? '') ?></textarea>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Image</label>
                    <input type="file" name="image" class="form-control" accept="image/*" data-preview="imgPreview">
                    <?php if (!empty($editItem['image_url'])): ?>
                        <img src="<?= SITE_URL . '/' . h($editItem['image_url']) ?>" id="imgPreview" class="mt-2 rounded" style="max-height:80px">
                    <?php else: ?>
                        <img id="imgPreview" class="mt-2 rounded d-none" style="max-height:80px">
                    <?php endif; ?>
                </div>
                <div class="col-md-6 d-flex flex-column gap-2 justify-content-end">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="is_available" id="chkAvail" <?= ($editItem['is_available'] ?? 1) ? 'checked' : '' ?>>
                        <label class="form-check-label" for="chkAvail">Currently Available</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="is_active" id="chkActive" <?= ($editItem['is_active'] ?? 1) ? 'checked' : '' ?>>
                        <label class="form-check-label" for="chkActive">Active (visible on website)</label>
                    </div>
                </div>
                <div class="col-12 d-flex gap-2">
                    <button type="submit" class="btn btn-info text-white"><i class="fas fa-save me-1"></i>Save Car</button>
                    <a href="cars.php" class="btn btn-outline-secondary">Cancel</a>
                </div>
            </div>
        </form>
    </div>
</div>
<?php endif; ?>

<div class="card table-card">
    <div class="card-header fw-600">All Cars (<?= count($items) ?>)</div>
    <div class="table-responsive">
        <table class="table mb-0">
            <thead><tr><th>#</th><th>Car</th><th>Category</th><th>Price/Day</th><th>Capacity</th><th>Availability</th><th>Actions</th></tr></thead>
            <tbody>
            <?php if (empty($items)): ?>
                <tr><td colspan="7" class="text-center text-muted py-4">No cars yet. <a href="cars.php?action=add">Add the first one.</a></td></tr>
            <?php else: ?>
            <?php foreach ($items as $item): ?>
            <tr>
                <td class="text-muted small"><?= $item['id'] ?></td>
                <td>
                    <?php if ($item['image_url']): ?>
                        <img src="<?= SITE_URL.'/'.$item['image_url'] ?>" style="width:40px;height:30px;object-fit:cover;border-radius:4px" class="me-2">
                    <?php endif; ?>
                    <span class="fw-600 small"><?= h(($item['make'] ?? '') . ' ' . ($item['model'] ?? '')) ?: 'Unknown' ?></span>
                    <?php if ($item['year']): ?><span class="text-muted small"> (<?= $item['year'] ?>)</span><?php endif; ?>
                </td>
                <td><span class="badge bg-info"><?= h($categories[$item['category']] ?? $item['category']) ?></span></td>
                <td class="small"><?= $item['price_per_day'] ? formatPrice($item['price_per_day'], $item['currency']) : '—' ?></td>
                <td class="small"><?= $item['capacity'] ?> pax</td>
                <td>
                    <span class="badge bg-<?= $item['is_available'] ? 'success' : 'secondary' ?>"><?= $item['is_available'] ? 'Available' : 'Unavailable' ?></span>
                    <?php if (!$item['is_active']): ?><span class="badge bg-dark ms-1">Hidden</span><?php endif; ?>
                </td>
                <td>
                    <a href="cars.php?action=edit&id=<?= $item['id'] ?>" class="btn btn-sm btn-outline-primary me-1"><i class="fas fa-edit"></i></a>
                    <a href="cars.php?action=toggle&id=<?= $item['id'] ?>" class="btn btn-sm btn-outline-secondary me-1" title="Toggle availability"><i class="fas fa-sync-alt"></i></a>
                    <a href="cars.php?action=delete&id=<?= $item['id'] ?>&csrf=<?= csrfToken() ?>"
                       class="btn btn-sm btn-outline-danger"
                       data-confirm="Delete this car?"><i class="fas fa-trash"></i></a>
                </td>
            </tr>
            <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php include __DIR__ . '/../includes/admin_footer.php'; ?>
