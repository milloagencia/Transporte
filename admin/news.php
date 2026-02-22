<?php
/**
 * TropiCollage Admin — Manage News
 */
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireLogin();
$adminTitle = 'News';
$action     = $_GET['action'] ?? 'list';
$id         = (int)($_GET['id'] ?? 0);

if ($action === 'delete' && $id) {
    if (!verifyCsrf($_GET['csrf'] ?? '')) { flashMessage('error','Invalid CSRF.'); redirect(SITE_URL.'/admin/news.php'); }
    dbExecute("DELETE FROM news WHERE id=?", [$id]);
    flashMessage('success', 'Article deleted.');
    redirect(SITE_URL . '/admin/news.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrf($_POST['csrf_token'] ?? '')) { flashMessage('error','Invalid request.'); redirect(SITE_URL.'/admin/news.php'); }
    $title      = trim($_POST['title'] ?? '');
    $content    = trim($_POST['content'] ?? '');
    $isFeatured = isset($_POST['is_featured']) ? 1 : 0;
    $imgUrl     = handleFileUpload('image', 'news');
    $editId     = (int)($_POST['edit_id'] ?? 0);
    if ($editId) {
        $existing = dbFetchOne("SELECT image_url FROM news WHERE id=?", [$editId]);
        if (!$imgUrl && $existing) $imgUrl = $existing['image_url'];
        dbExecute("UPDATE news SET title=?,content=?,image_url=?,is_featured=? WHERE id=?", [$title,$content,$imgUrl,$isFeatured,$editId]);
        flashMessage('success', 'Article updated.');
    } else {
        dbExecute("INSERT INTO news (title,content,image_url,is_featured) VALUES (?,?,?,?)", [$title,$content,$imgUrl,$isFeatured]);
        flashMessage('success', 'Article added.');
    }
    redirect(SITE_URL . '/admin/news.php');
}

$items    = dbFetchAll("SELECT * FROM news ORDER BY created_at DESC");
$editItem = $id && $action === 'edit' ? dbFetchOne("SELECT * FROM news WHERE id=?", [$id]) : null;
include __DIR__ . '/../includes/admin_header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="fw-600 mb-0"><i class="fas fa-newspaper me-2 text-success"></i>Manage News</h4>
    <a href="news.php?action=add" class="btn btn-success btn-sm"><i class="fas fa-plus me-1"></i>Add Article</a>
</div>

<?php renderFlash(); ?>

<?php if ($action === 'add' || $action === 'edit'): ?>
<div class="card mb-4">
    <div class="card-header fw-600"><?= $action === 'edit' ? 'Edit Article' : 'New Article' ?></div>
    <div class="card-body">
        <form method="POST" action="news.php" enctype="multipart/form-data">
            <input type="hidden" name="csrf_token" value="<?= csrfToken() ?>">
            <?php if ($editItem): ?><input type="hidden" name="edit_id" value="<?= $editItem['id'] ?>"><?php endif; ?>
            <div class="row g-3">
                <div class="col-12">
                    <label class="form-label">Title <span class="required-star">*</span></label>
                    <input type="text" name="title" class="form-control" required value="<?= h($editItem['title'] ?? '') ?>">
                </div>
                <div class="col-12">
                    <label class="form-label">Content <span class="required-star">*</span></label>
                    <textarea name="content" class="form-control" rows="6" required><?= h($editItem['content'] ?? '') ?></textarea>
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
                <div class="col-md-6 d-flex align-items-end">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="is_featured" id="chkFeat" <?= ($editItem['is_featured'] ?? 0) ? 'checked' : '' ?>>
                        <label class="form-check-label" for="chkFeat">Featured (show on homepage)</label>
                    </div>
                </div>
                <div class="col-12 d-flex gap-2">
                    <button type="submit" class="btn btn-success"><i class="fas fa-save me-1"></i>Save Article</button>
                    <a href="news.php" class="btn btn-outline-secondary">Cancel</a>
                </div>
            </div>
        </form>
    </div>
</div>
<?php endif; ?>

<div class="card table-card">
    <div class="card-header fw-600">All Articles (<?= count($items) ?>)</div>
    <div class="table-responsive">
        <table class="table mb-0">
            <thead><tr><th>#</th><th>Title</th><th>Featured</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
            <?php if (empty($items)): ?>
                <tr><td colspan="5" class="text-center text-muted py-4">No articles yet. <a href="news.php?action=add">Add the first one.</a></td></tr>
            <?php else: ?>
            <?php foreach ($items as $item): ?>
            <tr>
                <td class="text-muted small"><?= $item['id'] ?></td>
                <td>
                    <?php if ($item['image_url']): ?>
                        <img src="<?= SITE_URL.'/'.$item['image_url'] ?>" style="width:40px;height:30px;object-fit:cover;border-radius:4px" class="me-2">
                    <?php endif; ?>
                    <?= h(truncate($item['title'], 60)) ?>
                </td>
                <td><?= $item['is_featured'] ? '<span class="badge bg-warning">Yes</span>' : '—' ?></td>
                <td class="small text-muted"><?= timeAgo($item['created_at']) ?></td>
                <td>
                    <a href="news.php?action=edit&id=<?= $item['id'] ?>" class="btn btn-sm btn-outline-primary me-1"><i class="fas fa-edit"></i></a>
                    <a href="news.php?action=delete&id=<?= $item['id'] ?>&csrf=<?= csrfToken() ?>"
                       class="btn btn-sm btn-outline-danger"
                       data-confirm="Delete this article?"><i class="fas fa-trash"></i></a>
                </td>
            </tr>
            <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php include __DIR__ . '/../includes/admin_footer.php'; ?>
