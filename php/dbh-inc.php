<?php
try {
    $pdo = new PDO('sqlite:hubdledb.db');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); # throw exception for error
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage(); # display error message
}