<?php

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];
    try {
        require_once 'dbh-inc.php';
        if ($username == "" or $password == "") {
            die("Username or password cannot be empty.");
        }
        $query = "SELECT * FROM leaderboard WHERE username = :username AND password = :password;";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $password);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_decode($results); // TODO: fix error here
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