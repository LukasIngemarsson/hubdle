<?php

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];
    try {
        require_once 'dbh-inc.php';
        if ($username == "" or $password == "") {
            die("Username or password cannot be empty.");
        }
        $query = "INSERT INTO leaderboard (username, password) VALUES (:username, :password);";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $password);
        $stmt->execute();

        # free up resources
        $pdo = null;
        $stmt = null;
        header("Location: ../index.html");
        die();
    } catch (PDOException $e) {
        die("Query failed: " . $e->getMessage() . "<br/>");
    }
}
else {
    header("Location: ../index.html");
}