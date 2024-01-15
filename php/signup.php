<?php

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];
    try {
        require_once 'dbh-inc.php';
        if ($username == "" or $password == "") {
            die("Username or password cannot be empty.");
        }
        else if (strlen($username) > 20) {
            die("Username cannot be longer than 20 characters.");
        }
        else if (strlen($password) > 20) {
            die("Password cannot be longer than 20 characters.");
        }
        else if (strlen($username) < 6) {
            die("Username has to contain at least 6 characters.");
        }
        else if (strlen($password) < 6) {
            die("Password has to contain at least 6 characters.");
        }
        $query = "INSERT INTO user (username, password) VALUES (:username, :password);";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $password);
        $stmt->execute();

        $query = "INSERT INTO leaderboard (username, wins) VALUES (:username, 0);";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->execute();

        $pdo = null;
        header("Location: ../index.html");
        die();
    } catch (PDOException $e) {
        die("Query failed: " . $e->getMessage() . "<br/>");
    }
}
else {
    header("Location: ../index.html");
}