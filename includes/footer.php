<!-- Footer -->
<footer class="footer mt-auto">
    <div class="footer-top">
        <div class="container">
            <div class="row g-4">
                <!-- Brand -->
                <div class="col-lg-4">
                    <div class="footer-brand mb-3">
                        <i class="fas fa-plane-departure me-2"></i>TropiCollage
                    </div>
                    <p class="text-light opacity-75 small mb-3">
                        Your trusted partner for exclusive international flights, authentic Cuban casa particulares,
                        and private car rentals in Pinar del Río, Cuba.
                    </p>
                    <div class="d-flex gap-2">
                        <a href="<?= whatsappLink('Hello TropiCollage!') ?>" target="_blank" class="footer-social"><i class="fab fa-whatsapp"></i></a>
                        <a href="#" class="footer-social"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" class="footer-social"><i class="fab fa-instagram"></i></a>
                        <a href="#" class="footer-social"><i class="fab fa-telegram-plane"></i></a>
                    </div>
                </div>

                <!-- Quick Links -->
                <div class="col-sm-6 col-lg-2">
                    <h6 class="footer-heading">Services</h6>
                    <ul class="footer-links">
                        <li><a href="<?= SITE_URL ?>/flights.php"><i class="fas fa-angle-right me-1"></i>Flights</a></li>
                        <li><a href="<?= SITE_URL ?>/casas.php"><i class="fas fa-angle-right me-1"></i>Casa Particular</a></li>
                        <li><a href="<?= SITE_URL ?>/cars.php"><i class="fas fa-angle-right me-1"></i>Car Rental</a></li>
                        <li><a href="<?= SITE_URL ?>/request.php"><i class="fas fa-angle-right me-1"></i>Custom Services</a></li>
                    </ul>
                </div>

                <!-- Info -->
                <div class="col-sm-6 col-lg-2">
                    <h6 class="footer-heading">Company</h6>
                    <ul class="footer-links">
                        <li><a href="<?= SITE_URL ?>/"><i class="fas fa-angle-right me-1"></i>About Us</a></li>
                        <li><a href="<?= SITE_URL ?>/contact.php"><i class="fas fa-angle-right me-1"></i>Contact</a></li>
                        <li><a href="<?= SITE_URL ?>/request.php"><i class="fas fa-angle-right me-1"></i>Special Requests</a></li>
                        <li><a href="<?= SITE_URL ?>/admin/"><i class="fas fa-angle-right me-1"></i>Admin</a></li>
                    </ul>
                </div>

                <!-- Contact -->
                <div class="col-lg-4">
                    <h6 class="footer-heading">Contact Us</h6>
                    <ul class="footer-links">
                        <li>
                            <a href="<?= whatsappLink('Hello! I need travel info.') ?>" target="_blank">
                                <i class="fab fa-whatsapp me-2 text-success"></i><?= WHATSAPP_DISPLAY ?> (WhatsApp)
                            </a>
                        </li>
                        <li>
                            <a href="mailto:<?= h(ADMIN_EMAIL) ?>">
                                <i class="fas fa-envelope me-2"></i><?= h(ADMIN_EMAIL) ?>
                            </a>
                        </li>
                        <li class="text-light opacity-75">
                            <i class="fas fa-map-marker-alt me-2"></i>Cuba &amp; International
                        </li>
                        <li class="text-light opacity-75">
                            <i class="fas fa-clock me-2"></i>Mon–Sat: 9am – 6pm (Cuba Time)
                        </li>
                    </ul>
                    <!-- WhatsApp CTA -->
                    <a href="<?= whatsappLink('Hello TropiCollage! I need help with my travel plans.') ?>" target="_blank" class="btn btn-whatsapp btn-sm mt-2">
                        <i class="fab fa-whatsapp me-2"></i>Chat on WhatsApp
                    </a>
                </div>
            </div>
        </div>
    </div>
    <div class="footer-bottom">
        <div class="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <p class="mb-0 small text-light opacity-75">
                &copy; <?= date('Y') ?> <?= h(SITE_NAME) ?>. All rights reserved.
            </p>
            <p class="mb-0 small text-light opacity-75">
                Exclusive flights &bull; Cuba Casa Particular &bull; Car Rental Pinar del Río
            </p>
        </div>
    </div>
</footer>

<!-- WhatsApp Float Button -->
<a href="<?= whatsappLink('Hello! I need travel assistance from TropiCollage.') ?>" target="_blank" class="wa-float" title="Chat on WhatsApp">
    <i class="fab fa-whatsapp"></i>
</a>

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<!-- Custom JS -->
<script>const WHATSAPP_NUMBER = '<?= preg_replace('/\D/', '', WHATSAPP_NUMBER) ?>';</script>
<script src="<?= SITE_URL ?>/assets/js/main.js"></script>
</body>
</html>
