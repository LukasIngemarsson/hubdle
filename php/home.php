<?php

session_start();
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    try {
        require_once 'dbh-inc.php';
        $stmt = $pdo->prepare("SELECT wins FROM leaderboard WHERE username = :username");
        $stmt->bindParam(':username', $_SESSION['username']);
        $stmt->execute();
        $updated_wins = $stmt->fetchAll(PDO::FETCH_ASSOC)[0]['wins'] + 1;
        $stmt = $pdo->prepare("UPDATE leaderboard SET wins = :wins WHERE username = :username");
        $stmt->bindParam(':username', $_SESSION['username']);
        $stmt->bindParam(':wins', $updated_wins);
        $stmt->execute();
        $pdo = null;
        header("Location: ../home.html");
        die();
    } catch (PDOException $e) {
        die("Query failed: " . $e->getMessage() . "<br/>");
    }
}