<?php
header('Content-Type: application/json');
session_start();
require_once '../DATABASE/maindb.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["logged_in" => false]);
    exit;
}

$stmt = $conn->prepare("SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user) {
    session_destroy();
    echo json_encode(["logged_in" => false]);
    exit;
}

// Get bookings
$bstmt = $conn->prepare("SELECT b.*, c.name as car_name, c.image, c.category FROM bookings b LEFT JOIN cars c ON b.car_id = c.id WHERE b.user_id = ? ORDER BY b.created_at DESC");
$bstmt->bind_param("i", $_SESSION['user_id']);
$bstmt->execute();
$bookings = $bstmt->get_result()->fetch_all(MYSQLI_ASSOC);

echo json_encode([
    "logged_in" => true,
    "user"      => $user,
    "bookings"  => $bookings
]);
$conn->close();
?>
