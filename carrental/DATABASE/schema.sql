-- ============================================
-- Car Rental Platform - Complete Database Setup
-- Run this in phpMyAdmin or MySQL CLI
-- ============================================

CREATE DATABASE IF NOT EXISTS car_rental CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE car_rental;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    aadhaar VARCHAR(20),
    role ENUM('user','admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM('SUV','Sedan','Hatchback','Luxury') NOT NULL,
    description TEXT,
    price_per_day DECIMAL(10,2) NOT NULL,
    seats INT DEFAULT 5,
    fuel_type VARCHAR(30) DEFAULT 'Petrol',
    transmission ENUM('Manual','Automatic') DEFAULT 'Manual',
    image VARCHAR(255),
    available TINYINT(1) DEFAULT 1,
    rating DECIMAL(3,1) DEFAULT 4.5,
    reviews_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    car_id INT,
    name VARCHAR(100),
    email VARCHAR(150),
    aadhaar VARCHAR(20),
    pickup_date DATE NOT NULL,
    return_date DATE NOT NULL,
    total_days INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending','confirmed','cancelled','completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE SET NULL
);

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150),
    subject VARCHAR(200),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Sample Data
-- ============================================

INSERT INTO cars (name, category, description, price_per_day, seats, fuel_type, transmission, image, available, rating, reviews_count) VALUES
('Maruti Swift', 'Hatchback', 'Compact, fuel-efficient city car perfect for urban adventures. Features modern infotainment and excellent mileage.', 1200.00, 5, 'Petrol', 'Manual', 'maruti_swift.jpg', 1, 4.5, 128),
('Maruti Dzire', 'Sedan', 'Elegant sedan with spacious interiors and a smooth drive. Ideal for business and leisure travel.', 1500.00, 5, 'Petrol', 'Manual', 'maruti_dzire.jpg', 1, 4.3, 95),
('Honda City', 'Sedan', 'Premium sedan offering superior comfort, advanced safety features, and powerful performance on highways.', 1800.00, 5, 'Petrol', 'Automatic', 'honda_city.jpg', 1, 4.7, 210),
('Hyundai Creta', 'SUV', 'Feature-packed SUV with commanding road presence, perfect for both city commutes and highway trips.', 2200.00, 5, 'Diesel', 'Automatic', 'creta.jpg', 1, 4.6, 189),
('Maruti Baleno', 'Hatchback', 'Stylish premium hatchback with a spacious cabin, loaded with tech features and a refined ride quality.', 1400.00, 5, 'Petrol', 'Automatic', 'baleno.jpg', 1, 4.4, 142),
('SUV Premium', 'SUV', 'Robust and versatile SUV suitable for families, road trips, and off-road exploration with ample boot space.', 2500.00, 7, 'Diesel', 'Automatic', 'home_SUV1.jpg', 1, 4.8, 76);

-- Sample admin user (password: admin123)
INSERT INTO users (full_name, email, phone, password, role) VALUES
('Admin User', 'admin@carrental.com', '9999999999', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
