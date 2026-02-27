<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once '../DATABASE/maindb.php';

$category = isset($_GET['category']) ? $_GET['category'] : '';
$search   = isset($_GET['search'])   ? '%' . $_GET['search'] . '%' : '';

if ($category && $category !== 'All') {
    $stmt = $conn->prepare("SELECT * FROM cars WHERE category = ? AND available = 1 ORDER BY rating DESC");
    $stmt->bind_param("s", $category);
} elseif ($search && $search !== '%%') {
    $stmt = $conn->prepare("SELECT * FROM cars WHERE (name LIKE ? OR description LIKE ?) AND available = 1 ORDER BY rating DESC");
    $stmt->bind_param("ss", $search, $search);
} else {
    $stmt = $conn->prepare("SELECT * FROM cars WHERE available = 1 ORDER BY rating DESC");
}

$stmt->execute();
$result = $stmt->get_result();
$cars = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode(["success" => true, "cars" => $cars]);
$conn->close();
?>
