CREATE DATABASE IF NOT EXISTS sportsdb;
USE sportsdb;

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sport_type VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    max_participants INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,       
    last_name VARCHAR(100) NOT NULL,
    student_id VARCHAR(20) NOT NULL,
    faculty VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    faculty VARCHAR(100) NOT NULL,
    major VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);