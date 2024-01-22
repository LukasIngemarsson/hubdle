<?php

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    try {
        require_once 'dbh-inc.php'; 
        $query = "SELECT username, wins FROM leaderboard ORDER BY wins DESC;";
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($results);
        $pdo = null;
    } catch (PDOException $e) {
        die("Query failed: " . $e->getMessage() . "<br/>");
    }
}
else {
    header("Location: ../home.html");
}