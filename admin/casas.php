<?php
/**
 * TropiCollage Admin — Manage Casa Particulares
 */
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireLogin();
$adminTitle = 'Casa Particulares';
$action     = $_GET['action'] ?? 'list';
$id         = (int)($_GET['id'] ?? 0);

if ($action === 'delete' && $id) {
    if (!verifyCsrf($_GET['csrf'] ?? '')) { flashMessage('error','Invalid CSRF.'); redirect(SITE_URL.'/admin/casas.php'); }
    dbExecute("DELETE FROM casas WHERE id=?", [$id]);
    flashMessage('success', 'Casa deleted.');
    redirect(SITE_URL . '/admin/casas.php');
}

if ($action === 'toggle' && $id) {
    dbExecute("UPDATE casas SET is_active = NOT is_active WHERE id=?", [$id]);
    redirect(SITE_URL . '/admin/casas.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrf($_POST['csrf_token'] ?? '')) { flashMessage('error','Invalid request.'); redirect(SITE_URL.'/admin/casas.php'); }
    $d = [
        'name'            => trim($_POST['name'] ?? ''),
        'location'        => trim($_POST['location'] ?? 'Cuba'),
        'description'     => trim($_POST['description'] ?? ''),
        'price_per_night' => $_POST['price_per_night'] !== '' ? (float)$_POST['price_per_night'] : null,
        'currency'        => $_POST['currency'] ?? 'USD',
        'rooms'           => (int)($_POST['rooms'] ?? 1),
        'capacity'        => (int)($_POST['capacity'] ?? 2),
        'amenities'       => trim($_POST['amenities'] ?? ''),
        'host_name'       => trim($_POST['host_name'] ?? ''),
        'host_whatsapp'   => trim($_POST['host_whatsapp'] ?? ''),
        'is_featured'     => isset($_POST['is_featured']) ? 1 : 0,
        'is_active'       => isset($_POST['is_active']) ? 1 : 0,
    ];
    $imgUrl = handleFileUpload('image', 'casas');
    $editId = (int)($_POST['edit_id'] ?? 0);
    if ($editId) {
        $existing = dbFetchOne("SELECT image_url FROM casas WHERE id=?", [$editId]);
        if (!$imgUrl && $existing) $imgUrl = $existing['image_url'];
        dbExecute("UPDATE casas SET name=?,location=?,description=?,price_per_night=?,currency=?,rooms=?,capacity=?,amenities=?,host_name=?,host_whatsapp=?,image_url=?,is_featured=?,is_active=? WHERE id=?",
            [$d['name'],$d['location'],$d['description'],$d['price_per_night'],$d['currency'],$d['rooms'],$d['capacity'],$d['amenities'],$d['host_name'],$d['host_whatsapp'],$imgUrl,$d['is_featured'],$d['is_active'],$editId]);
        flashMessage('success', 'Casa updated.');
    } else {
        dbExecute("INSERT INTO casas (name,location,description,price_per_night,currency,rooms,capacity,amenities,host_name,host_whatsapp,image_url,is_featured,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [$d['name'],$d['location'],$d['description'],$d['price_per_night'],$d['currency'],$d['rooms'],$d['capacity'],$d['amenities'],$d['host_name'],$d['host_whatsapp'],$imgUrl,$d['is_featured'],$d['is_active']]);
        flashMessage('success', 'Casa added.');
    }
    redirect(SITE_URL . '/admin/casas.php');
}

$items    = dbFetchAll("SELECT * FROM casas ORDER BY created_at DESC");
$editItem = $id && $action === 'edit' ? dbFetchOne("SELECT * FROM casas WHERE id=?", [$id]) : null;
include __DIR__ . '/../includes/admin_header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="fw-600 mb-0"><i class="fas fa-home me-2 text-warning"></i>Manage Casa Particulares</h4>
    <a href="casas.php?action=add" class="btn btn-warning btn-sm text-dark"><i class="fas fa-plus me-1"></i>Add Casa</a>
</div>
<?php renderFlash(); ?>

<?php if ($action === 'add' || $action === 'edit'): ?>
<div class="card mb-4">
    <div class="card-header fw-600"><?= $action === 'edit' ? 'Edit Casa' : 'Add Casa Particular' ?></div>
    <div class="card-body">
        <form method="POST" action="casas.php" enctype="multipart/form-data">
            <input type="hidden" name="csrf_token" value="<?= csrfToken() ?>">
            <?php if ($editItem): ?><input type="hidden" name="edit_id" value="<?= $editItem['id'] ?>"><?php endif; ?>
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Name <span class="required-star">*</span></label>
                    <input type="text" name="name" class="form-control" required value="<?= h($editItem['name'] ?? '') ?>" placeholder="Casa name / host name">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Location</label>
                    <input type="text" name="location" class="form-control" value="<?= h($editItem['location'] ?? 'Cuba') ?>" placeholder="e.g. Havana, Trinidad, Pinar del Río">
                </div>
                <div class="col-12">
                    <label class="form-label">Description</label>
                    <textarea name="description" class="form-control" rows="3"><?= h($editItem['description'] ?? '') ?></textarea>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Price / Night</label>
                    <input type="number" name="price_per_night" class="form-control" step="0.01" min="0" value="<?= h($editItem['price_per_night'] ?? '') ?>">
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
                    <label class="form-label">Rooms</label>
                    <input type="number" name="rooms" class="form-control" min="1" value="<?= (int)($editItem['rooms'] ?? 1) ?>">
                </div>
                <div class="col-md-2">
                    <label class="form-label">Capacity</label>
                    <input type="number" name="capacity" class="form-control" min="1" value="<?= (int)($editItem['capacity'] ?? 2) ?>">
                </div>
                <div class="col-md-3 d-flex flex-column gap-2 justify-content-end">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="is_featured" id="chkFeat" <?= ($editItem['is_featured'] ?? 0) ? 'checked' : '' ?>>
                        <label class="form-check-label" for="chkFeat">Featured</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="is_active" id="chkActive" <?= ($editItem['is_active'] ?? 1) ? 'checked' : '' ?>>
                        <label class="form-check-label" for="chkActive">Active</label>
                    </div>
                </div>
                <div class="col-12">
                    <label class="form-label">Amenities <span class="text-muted small">(comma-separated)</span></label>
                    <input type="text" name="amenities" class="form-control" value="<?= h($editItem['amenities'] ?? '') ?>" placeholder="WiFi, AC, Breakfast, Private Bathroom, Pool">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Host Name</label>
                    <input type="text" name="host_name" class="form-control" value="<?= h($editItem['host_name'] ?? '') ?>">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Host WhatsApp</label>
                    <input type="text" name="host_whatsapp" class="form-control" value="<?= h($editItem['host_whatsapp'] ?? '') ?>" placeholder="+53 5xxx xxxx">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Image</label>
                    <input type="file" name="image" class="form-control" accept="image/*" data-preview="imgPreview">
                    <?php if (!empty($editItem['image_url'])): ?>
                        <img src="<?= SITE_URL . '/' . h($editItem['image_url']) ?>" id="imgPreview" class="mt-2 rounded" style="max-height:80px">
                    <?php else: ?>
                        <img id="imgPreview" class="mt-2 rounded d-none" style="max-height:80px">
                    <?php endif; ?>
                </div>
                <div class="col-12 d-flex gap-2">
                    <button type="submit" class="btn btn-warning text-dark"><i class="fas fa-save me-1"></i>Save Casa</button>
                    <a href="casas.php" class="btn btn-outline-secondary">Cancel</a>
                </div>
            </div>
        </form>
    </div>
</div>
<?php endif; ?>

<div class="card table-card">
    <div class="card-header fw-600">All Casa Particulares (<?= count($items) ?>)</div>
    <div class="table-responsive">
        <table class="table mb-0">
            <thead><tr><th>#</th><th>Name</th><th>Location</th><th>Price/Night</th><th>Rooms</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
            <?php if (empty($items)): ?>
                <tr><td colspan="7" class="text-center text-muted py-4">No casas yet. <a href="casas.php?action=add">Add the first one.</a></td></tr>
            <?php else: ?>
            <?php foreach ($items as $item): ?>
            <tr>
                <td class="text-muted small"><?= $item['id'] ?></td>
                <td>
                    <?php if ($item['image_url']): ?>
                        <img src="<?= SITE_URL.'/'.$item['image_url'] ?>" style="width:40px;height:30px;object-fit:cover;border-radius:4px" class="me-2">
                    <?php endif; ?>
                    <span class="fw-600 small"><?= h($item['name']) ?></span>
                </td>
                <td class="small"><?= h($item['location']) ?></td>
                <td class="small"><?= $item['price_per_night'] ? formatPrice($item['price_per_night'], $item['currency']) : '—' ?></td>
                <td class="small"><?= $item['rooms'] ?></td>
                <td>
                    <?php if ($item['is_featured']): ?><span class="badge bg-warning me-1">Featured</span><?php endif; ?>
                    <span class="badge bg-<?= $item['is_active'] ? 'success' : 'secondary' ?>"><?= $item['is_active'] ? 'Active' : 'Hidden' ?></span>
                </td>
                <td>
                    <a href="casas.php?action=edit&id=<?= $item['id'] ?>" class="btn btn-sm btn-outline-primary me-1"><i class="fas fa-edit"></i></a>
                    <a href="casas.php?action=toggle&id=<?= $item['id'] ?>" class="btn btn-sm btn-outline-secondary me-1"><i class="fas fa-eye<?= $item['is_active'] ? '-slash' : '' ?>"></i></a>
                    <a href="casas.php?action=delete&id=<?= $item['id'] ?>&csrf=<?= csrfToken() ?>"
                       class="btn btn-sm btn-outline-danger"
                       data-confirm="Delete this casa?"><i class="fas fa-trash"></i></a>
                </td>
            </tr>
            <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php include __DIR__ . '/../includes/admin_footer.php'; ?>
