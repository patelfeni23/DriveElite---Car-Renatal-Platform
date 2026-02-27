<?php
header('Content-Type: application/json');
require_once '../DATABASE/maindb.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Invalid request"]);
    exit;
}

$full_name = trim($_POST['full_name'] ?? '');
$email     = trim($_POST['email'] ?? '');
$phone     = trim($_POST['phone'] ?? '');
$password  = $_POST['password'] ?? '';
$confirm   = $_POST['confirm_password'] ?? '';

if (!$full_name || !$email || !$password) {
    echo json_encode(["error" => "All fields are required"]);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["error" => "Invalid email address"]);
    exit;
}
if ($password !== $confirm) {
    echo json_encode(["error" => "Passwords do not match"]);
    exit;
}
if (strlen($password) < 6) {
    echo json_encode(["error" => "Password must be at least 6 characters"]);
    exit;
}

// Check if email exists
$check = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
if ($check->get_result()->num_rows > 0) {
    echo json_encode(["error" => "Email already registered"]);
    exit;
}

$hashed = password_hash($password, PASSWORD_BCRYPT);
$stmt = $conn->prepare("INSERT INTO users (full_name, email, phone, password) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $full_name, $email, $phone, $hashed);

if ($stmt->execute()) {
    session_start();
    $_SESSION['user_id']   = $conn->insert_id;
    $_SESSION['user_name'] = $full_name;
    $_SESSION['user_email']= $email;
    echo json_encode(["success" => true, "message" => "Registration successful!", "name" => $full_name]);
} else {
    echo json_encode(["error" => "Registration failed. Please try again."]);
}
$conn->close();
?>
