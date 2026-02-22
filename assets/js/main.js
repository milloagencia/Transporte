/* TropiCollage Travel Agency — Main JavaScript */

document.addEventListener('DOMContentLoaded', function () {

    // ── Active Nav Link ──────────────────────────────────────────────
    const currentPath = window.location.pathname.split('/').pop() || 'index.php';
    document.querySelectorAll('.navbar .nav-link').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href.includes(currentPath) && currentPath !== '') {
            link.classList.add('active');
        }
    });

    // ── Auto-dismiss flash alerts ────────────────────────────────────
    const alerts = document.querySelectorAll('.alert.alert-success, .alert.alert-info');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            if (bsAlert) bsAlert.close();
        }, 5000);
    });

    // ── Car category filter ──────────────────────────────────────────
    const categoryPills = document.querySelectorAll('.category-pill');
    categoryPills.forEach(pill => {
        pill.addEventListener('click', function () {
            categoryPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            const cat = this.dataset.category;
            filterCards('.car-item', 'category', cat);
        });
    });

    // ── Generic card filter ──────────────────────────────────────────
    function filterCards(selector, attr, value) {
        const cards = document.querySelectorAll(selector);
        cards.forEach(card => {
            if (value === 'all' || !value || card.dataset[attr] === value) {
                card.style.display = '';
                card.closest('.col')?.style.setProperty('display', '');
            } else {
                const col = card.closest('.col');
                if (col) col.style.display = 'none';
                else card.style.display = 'none';
            }
        });
        updateNoResults();
    }

    function updateNoResults() {
        const noResults = document.getElementById('noResults');
        if (!noResults) return;
        const visible = document.querySelectorAll('.col[style=""],.col:not([style])');
        // simplified: count hidden cols
        const allCols = document.querySelectorAll('.filterable-grid .col');
        const hidden  = [...allCols].filter(c => c.style.display === 'none');
        noResults.classList.toggle('d-none', hidden.length < allCols.length);
    }

    // ── Flight search form ───────────────────────────────────────────
    const flightSearchForm = document.getElementById('flightSearchForm');
    if (flightSearchForm) {
        flightSearchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const origin = this.querySelector('[name="origin"]')?.value.trim().toLowerCase();
            const dest   = this.querySelector('[name="destination"]')?.value.trim().toLowerCase();
            const cards  = document.querySelectorAll('.flight-item');
            cards.forEach(card => {
                const cardOrigin = (card.dataset.origin || '').toLowerCase();
                const cardDest   = (card.dataset.destination || '').toLowerCase();
                const col = card.closest('.col');
                const show = (!origin || cardOrigin.includes(origin)) &&
                             (!dest   || cardDest.includes(dest));
                if (col) col.style.display = show ? '' : 'none';
            });
        });
    }

    // ── Image preview for admin forms ────────────────────────────────
    const imageInputs = document.querySelectorAll('input[type="file"][data-preview]');
    imageInputs.forEach(input => {
        input.addEventListener('change', function () {
            const previewId = this.dataset.preview;
            const preview = document.getElementById(previewId);
            if (!preview) return;
            const file = this.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = e => {
                    preview.src = e.target.result;
                    preview.classList.remove('d-none');
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // ── Confirm delete dialogs ───────────────────────────────────────
    document.querySelectorAll('[data-confirm]').forEach(btn => {
        btn.addEventListener('click', function (e) {
            if (!confirm(this.dataset.confirm || 'Are you sure?')) {
                e.preventDefault();
            }
        });
    });

    // ── Smooth scroll for anchor links ───────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ── WhatsApp quick message buttons ───────────────────────────────
    document.querySelectorAll('[data-wa-message]').forEach(btn => {
        btn.addEventListener('click', function () {
            const msg  = encodeURIComponent(this.dataset.waMessage);
            const num  = '5358040385';
            window.open('https://wa.me/' + num + '?text=' + msg, '_blank');
        });
    });

});
