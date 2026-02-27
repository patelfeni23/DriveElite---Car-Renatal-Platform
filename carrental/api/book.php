<?php
header('Content-Type: application/json');
require_once '../DATABASE/maindb.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Invalid request"]);
    exit;
}

$name        = trim($_POST['name'] ?? '');
$email       = trim($_POST['email'] ?? '');
$aadhaar     = trim($_POST['aadhaar'] ?? '');
$car_id      = intval($_POST['car_id'] ?? 0);
$pickup_date = $_POST['pickup_date'] ?? '';
$return_date = $_POST['return_date'] ?? '';
$user_id     = $_SESSION['user_id'] ?? null;

if (!$name || !$email || !$car_id || !$pickup_date || !$return_date) {
    echo json_encode(["error" => "All fields are required"]);
    exit;
}

// Calculate total days
$pickup = new DateTime($pickup_date);
$return = new DateTime($return_date);
$diff   = $pickup->diff($return);
$days   = $diff->days;

if ($days <= 0) {
    echo json_encode(["error" => "Return date must be after pickup date"]);
    exit;
}

// Get car price
$car = $conn->prepare("SELECT price_per_day, name FROM cars WHERE id = ? AND available = 1");
$car->bind_param("i", $car_id);
$car->execute();
$carResult = $car->get_result()->fetch_assoc();

if (!$carResult) {
    echo json_encode(["error" => "Car not found or unavailable"]);
    exit;
}

$total_price = $carResult['price_per_day'] * $days;

$stmt = $conn->prepare("INSERT INTO bookings (user_id, car_id, name, email, aadhaar, pickup_date, return_date, total_days, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("iisssssid", $user_id, $car_id, $name, $email, $aadhaar, $pickup_date, $return_date, $days, $total_price);

if ($stmt->execute()) {
    echo json_encode([
        "success"     => true,
        "message"     => "Booking confirmed!",
        "car"         => $carResult['name'],
        "days"        => $days,
        "total_price" => $total_price,
        "booking_id"  => $conn->insert_id
    ]);
} else {
    echo json_encode(["error" => "Booking failed. Please try again."]);
}
$conn->close();
?>
