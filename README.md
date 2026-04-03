# TropiCollage Travel Agency

A complete travel agency website for **TropiCollage** — built with PHP & MySQL, ready to deploy on Hostinger.

## Features

- 🌍 **Homepage** — Hero section, latest news, featured flights, casa particulares, car rentals, services overview
- ✈️ **International Flights** — Exclusive flights not on standard booking platforms (Expedia, Google Flights, etc.)
- 🏠 **Casa Particular** — Authentic private homes in Cuba
- 🚗 **Car Rental** — Private cars in Pinar del Río, Cuba with pricing by category (Economy, Compact, Sedan, SUV, Luxury, Classic)
- 📋 **Custom Service Requests** — Form for bespoke travel arrangements
- 📞 **Contact** — WhatsApp quick-contact templates (+53 58040385)
- 🔐 **Admin Panel** — Full CRUD for flights, news, casas, cars, and service requests

## Quick Start (Hostinger)

### 1. Upload Files
Upload all files to your Hostinger hosting via FTP or File Manager.

### 2. Create MySQL Database
In Hostinger hPanel → MySQL Databases, create a new database and user.

### 3. Configure
Edit `includes/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');
define('SITE_URL', 'https://yourdomain.com');
define('ADMIN_EMAIL', 'your@email.com');
```

Also update the admin password hash:
```php
define('ADMIN_PASSWORD_HASH', password_hash('YourNewPassword!', PASSWORD_DEFAULT));
```

### 4. Run Installer
Visit: `https://yourdomain.com/install.php?key=INSTALL_<md5_of_dbname>`

This creates all database tables and inserts sample data.

**⚠️ Delete `install.php` after running it!**

### 5. Access Admin Panel
Visit: `https://yourdomain.com/admin/`

Default credentials:
- **Username:** `admin`
- **Password:** `TropiAdmin2024!` (change this in config.php!)

## Directory Structure

```
/
├── index.php          # Homepage
├── flights.php        # International flights
├── casas.php          # Casa particulares
├── cars.php           # Car rental
├── request.php        # Custom service request form
├── contact.php        # Contact page
├── install.php        # One-time DB installer (delete after use)
├── .htaccess          # Apache security rules
├── admin/             # Admin panel
│   ├── index.php      # Dashboard
│   ├── login.php      # Login
│   ├── flights.php    # Manage flights
│   ├── news.php       # Manage news
│   ├── casas.php      # Manage casa particulares
│   ├── cars.php       # Manage cars
│   └── requests.php   # View service requests
├── assets/
│   ├── css/style.css  # Main stylesheet
│   └── js/main.js     # Main JavaScript
├── includes/
│   ├── config.php     # Site & DB configuration
│   ├── db.php         # Database helpers
│   ├── auth.php       # Session authentication
│   ├── functions.php  # Helper functions
│   ├── header.php     # Public header
│   ├── footer.php     # Public footer
│   ├── admin_header.php
│   └── admin_footer.php
└── uploads/           # User-uploaded images
    ├── flights/
    ├── casas/
    ├── cars/
    └── news/
```

## Contact Info (Pre-configured)
- **WhatsApp:** +53 58040385
- Update in `includes/config.php` → `WHATSAPP_NUMBER` and `WHATSAPP_DISPLAY`

## Technology
- **PHP 7.4+** — No framework required
- **MySQL** — PDO with prepared statements
- **Bootstrap 5** — Responsive design
- **Font Awesome 6** — Icons
- **No npm / composer required** — Pure PHP

