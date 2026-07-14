-- Create the new database
CREATE DATABASE IF NOT EXISTS medical_lab_db;

-- Use the newly created database
USE medical_lab_db;

-- 1. Create Person table (Parent Entity)
CREATE TABLE Person (
    person_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(15),
    street VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(50)
);

-- 2. Create Patient table with a separate patient_id
CREATE TABLE Patient (
    patient_id INT PRIMARY KEY AUTO_INCREMENT,
    person_id INT UNIQUE,  -- unique to ensure one-to-one relationship
    gender VARCHAR(10),
    dob DATE,
    age INT,
    blood_group VARCHAR(5),
    FOREIGN KEY (person_id) REFERENCES Person(person_id) ON DELETE CASCADE
);

-- 3. Create Technician table with a separate tech_id
CREATE TABLE Technician (
    tech_id INT PRIMARY KEY AUTO_INCREMENT,
    person_id INT UNIQUE,  -- unique to ensure one-to-one relationship
    qualification VARCHAR(100),
    specialization VARCHAR(100),
    FOREIGN KEY (person_id) REFERENCES Person(person_id) ON DELETE CASCADE
);

-- 4. Create LabTest table
CREATE TABLE LabTest (
    test_id INT PRIMARY KEY AUTO_INCREMENT,
    test_name VARCHAR(100) NOT NULL,
    test_cost DECIMAL(10, 2) NOT NULL,
    description TEXT,
    sample_type VARCHAR(50)
);

-- 5. Create Booking table, now linking to patient_id and tech_id
CREATE TABLE Booking (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT,
    test_id INT,
    tech_id INT,
    booking_date DATETIME NOT NULL,
    scheduled_date DATETIME NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    FOREIGN KEY (patient_id) REFERENCES Patient(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES LabTest(test_id) ON DELETE CASCADE,
    FOREIGN KEY (tech_id) REFERENCES Technician(tech_id) ON DELETE CASCADE
);

-- 6. Create Diagnosis table
CREATE TABLE Diagnosis (
    diagnosis_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT UNIQUE,
    diagnosis_date DATETIME NOT NULL,
    remarks TEXT,
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id) ON DELETE CASCADE
);

-- 7. Create TestResults table
CREATE TABLE TestResults (
    result_id INT PRIMARY KEY AUTO_INCREMENT,
    diagnosis_id INT,
    test_parameter VARCHAR(100) NOT NULL,
    test_value VARCHAR(50),
    unit VARCHAR(20),
    normal_range VARCHAR(50),
    test_comments TEXT,
    FOREIGN KEY (diagnosis_id) REFERENCES Diagnosis(diagnosis_id) ON DELETE CASCADE
);

-- 8. Create Bill table
CREATE TABLE Bill (
    bill_id INT PRIMARY KEY AUTO_INCREMENT,
    diagnosis_id INT UNIQUE,
    total_amt DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Pending',
    payment_date DATE,
    FOREIGN KEY (diagnosis_id) REFERENCES Diagnosis(diagnosis_id) ON DELETE CASCADE
);


-- 1. Insert records into Person
INSERT INTO Person (first_name, last_name, phone, street, city, state) VALUES
('Ravi', 'Kumar', '9876543210', '123 MG Road', 'Pune', 'Maharashtra'),
('Priya', 'Sharma', '9988776655', '45 Nehru St', 'Mumbai', 'Maharashtra'),
('Anand', 'Singh', '9000011111', '789 Patel Nagar', 'Delhi', 'Delhi'),
('Sonia', 'Verma', '8123456789', '42 ABC Avenue', 'Bangalore', 'Karnataka');

-- 2. Insert records into Patient (using person_id from Person)
INSERT INTO Patient (person_id, gender, dob, age, blood_group) VALUES
(1, 'Male', '1990-05-15', 33, 'A+'),
(2, 'Female', '1985-11-20', 38, 'O-');

-- 3. Insert records into Technician (using person_id from Person)
INSERT INTO Technician (person_id, qualification, specialization) VALUES
(3, 'M.Sc. Medical Lab Tech', 'Phlebotomy'),
(4, 'B.Sc. Biochemistry', 'Clinical Pathology');

-- 4. Insert records into LabTest
INSERT INTO LabTest (test_name, test_cost, description, sample_type) VALUES
('Complete Blood Count', 500.00, 'A test to evaluate overall health and detect a variety of diseases.', 'Blood'),
('Urine Analysis', 350.00, 'Checks for various diseases by analyzing the content of urine.', 'Urine');

-- 5. Insert records into Booking (now using patient_id and tech_id)
INSERT INTO Booking (patient_id, test_id, tech_id, booking_date, scheduled_date, status) VALUES
(1, 1, 1, '2025-09-24 09:00:00', '2025-09-25 10:00:00', 'Confirmed'),
(2, 2, 2, '2025-09-24 10:30:00', '2025-09-25 11:30:00', 'Confirmed');

-- 6. Insert records into Diagnosis
INSERT INTO Diagnosis (booking_id, diagnosis_date, remarks) VALUES
(1, '2025-09-25 15:00:00', 'Patient results show normal blood count. No intervention required.'),
(2, '2025-09-25 16:30:00', 'Urine analysis indicates no abnormalities. Results are normal.');

-- 7. Insert records into TestResults
INSERT INTO TestResults (diagnosis_id, test_parameter, test_value, unit, normal_range, test_comments) VALUES
(1, 'White Blood Cell Count', '6.5', '10^9/L', '4.5 - 11.0', 'Within normal range.'),
(1, 'Hemoglobin', '14.2', 'g/dL', '13.5 - 17.5', 'Normal.'),
(2, 'Urine pH', '6.2', NULL, '4.5 - 8.0', 'Slightly acidic but within normal range.');

-- 8. Insert records into Bill
INSERT INTO Bill (diagnosis_id, total_amt, payment_status, payment_date) VALUES
(1, 500.00, 'Paid', '2025-09-26'),
(2, 350.00, 'Paid', '2025-09-26');