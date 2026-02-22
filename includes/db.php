<?php
/**
 * TropiCollage Travel Agency - Database Connection
 */

require_once __DIR__ . '/config.php';

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // In production, log error instead of displaying
            error_log('Database connection failed: ' . $e->getMessage());
            die('Database connection error. Please try again later.');
        }
    }
    return $pdo;
}

// Helper: fetch all rows
function dbFetchAll($sql, $params = []) {
    $stmt = getDB()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

// Helper: fetch one row
function dbFetchOne($sql, $params = []) {
    $stmt = getDB()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetch();
}

// Helper: execute (insert/update/delete)
function dbExecute($sql, $params = []) {
    $stmt = getDB()->prepare($sql);
    return $stmt->execute($params);
}

// Helper: get last insert id
function dbLastInsertId() {
    return getDB()->lastInsertId();
}

// Helper: count rows
function dbCount($sql, $params = []) {
    $stmt = getDB()->prepare($sql);
    $stmt->execute($params);
    return (int) $stmt->fetchColumn();
}
