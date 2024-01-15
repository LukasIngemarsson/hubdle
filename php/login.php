<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];
    try {
        require_once 'dbh-inc.php';
        if ($username == "" or $password == "") {
            die("Username or password cannot be empty.");
        }
        $_SESSION['username'] = $username;
        $_SESSION['password'] = $password;
        $query = "SELECT * FROM user WHERE username = :username AND password = :password;";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $password);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (count($results) == 0) {
            die("No match found for the entered username and password. Please try again.");
        }

        $pdo = null;
        header("Location: ../index.html");
        die();
    } catch (PDOException $e) {
        die("Query failed: " . $e->getMessage() . "<br/>");
    }
}
else {
    header("Location: ../index.html");
    die();
}