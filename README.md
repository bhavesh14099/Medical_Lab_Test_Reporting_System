# 🧪 Medical Lab Test Reporting System  

## 📖 Introduction  
The **Medical Lab Test Reporting System** is a web-based application developed to digitalize and streamline the end-to-end process of laboratory management. It enables medical labs to efficiently handle patient information, manage technicians, maintain a catalog of lab tests, schedule bookings, record diagnosis details, generate automated test reports, and produce bills. The system replaces manual paperwork with a centralized database that improves accuracy, reduces delays, and ensures data integrity through a secure and structured workflow.

---

## ⚙️ Features  
- **User Authentication:** Secure admin login with predefined credentials to protect data access.  
- **Patient Management:** Add, view, edit, or remove patient details including personal and medical information.  
- **Technician Management:** Maintain technician profiles with qualifications and areas of specialization.  
- **Lab Test Management:** Define and manage lab tests, including name, description, cost, and sample type.  
- **Booking System:** Schedule and track test bookings by linking patients, technicians, and selected lab tests.  
- **Diagnosis Module:** Record diagnostic remarks and generate test reports for completed bookings.  
- **Result Management:** Add multiple test parameters, values, units, and comments for each diagnosis.  
- **Billing System:** Automatically create bills linked to diagnoses with payment tracking (pending/paid).  
- **Comprehensive Reporting:** Generate complete printable reports that include patient, test, result, and billing details.  

---

## 🧩 Working of Each Module  

### 1. Login Module  
The application begins with an **admin authentication** step. The admin enters valid credentials to access the dashboard. This ensures only authorized personnel can manage the system data.

### 2. Patient Management Module  
Admin can register new patients by filling in personal details such as name, gender, DOB, blood group, and contact information. The admin can update existing patient information or delete records if necessary. All data is stored in the `patient` and `person` tables.

### 3. Technician Management Module  
This module allows the admin to add or edit details of lab technicians including their qualifications, specialization, and contact details. It ensures that each test booking is handled by a qualified technician.

### 4. Lab Test Management Module  
The system maintains a catalog of all available lab tests. Each record includes the test name, cost, description, and sample type (e.g., blood, urine, saliva). These tests can be updated or removed as needed.

### 5. Booking Module  
The admin books lab tests by linking a **patient**, **test**, and **technician** to a specific date. Bookings are stored with a status such as *Pending*, *Confirmed*, or *Completed*. Once a test is completed, the system automatically updates the booking status.

### 6. Diagnosis & Result Module  
Once the test is completed, the admin or technician records the **diagnosis details** such as remarks and date. For each diagnosis, multiple **test results** are added including parameters, measured values, units, normal range, and comments. This creates a structured dataset for accurate report generation.

### 7. Billing Module  
When a diagnosis is saved, a **bill record** is automatically created. It includes the total amount for the test and payment status (Pending/Paid). This feature ensures easy tracking of transactions without manual calculations.

### 8. Report Generation Module  
After the test results are entered, the system generates a complete report that consolidates all patient information, diagnosis remarks, and billing details. The report can be viewed or printed directly for the patient.

---

## 💻 Tech Stack  

| Layer | Technology Used |
|-------|-----------------|
| **Frontend** | HTML, CSS, JavaScript, Tailwind CSS |
| **Backend** | Python (Flask Framework) |
| **Database** | MySQL |
| **Libraries** | Flask-SQLAlchemy, Flask-CORS, PyMySQL |
| **IDE** | Visual Studio Code |
| **Supported OS** | Windows / Linux |
| **Browser** | Chrome / Edge |
| **Python Version** | 3.10 or above |

---

## 🗄️ Database Design  

The database follows **Third Normal Form (3NF)** to minimize redundancy and maintain integrity.  

### **Main Tables**
| Table | Description | Key Fields |
|--------|--------------|------------|
| `person` | Stores general info for patients and technicians | person_id (PK) |
| `patient` | Patient-specific data | patient_id (PK), person_id (FK) |
| `technician` | Technician-specific data | tech_id (PK), person_id (FK) |
| `labtest` | Stores available tests and details | test_id (PK) |
| `booking` | Links patient, technician, and test | booking_id (PK), patient_id, tech_id, test_id |
| `diagnosis` | Contains diagnosis info for a booking | diagnosis_id (PK), booking_id (FK) |
| `testresults` | Holds individual test parameters and results | result_id (PK), diagnosis_id (FK) |
| `bill` | Manages billing for each diagnosis | bill_id (PK), diagnosis_id (FK) |

This schema ensures efficient relational mapping between entities and smooth CRUD operations across modules.

---

## ⚙️ How to Run  

### 1. Prerequisites
- Install **Python 3.10+** and **MySQL Server**  
- Ensure **pip** is available in the system path  

### 2. Clone the Repository
```bash
git clone https://github.com/bhavesh14099/Medical_Lab_Test_Reporting_System.git
cd Medical_Lab_Test_Reporting_System
```

### 3. Install Required Libraries
```bash
pip install flask flask_sqlalchemy flask_cors pymysql mysql-connector-python
```

### 4. Database Setup
1. Create a database in MySQL (e.g., `medlabdb`).  
2. Update the database credentials (host, user, password, dbname) inside the Flask configuration section of `app.py`.  
3. Import the provided SQL schema if available.

### 5. Run the Application
```bash
python app.py
```

### 6. Access the Application
Open your browser and visit:
```
http://localhost:5000
```
Use the default admin credentials (e.g., **Username:** admin, **Password:** admin) to log in.

---

## 🔮 Future Scope  
- Integration with **Hospital Management Systems (HMS)** for seamless data exchange.  
- **Cloud-based storage** for large-scale deployment and remote accessibility.  
- Implementation of **AI-based anomaly detection** in test results.  
- Addition of **voice-based search** and **chatbot support** for assistance.  
- Development of a **mobile app** for patients and doctors for real-time report access.

---

## 🧾 Conclusion  
The **Medical Lab Test Reporting System** offers an efficient digital alternative to manual laboratory management. By integrating Flask and MySQL, it ensures secure data handling, faster operations, and accurate reporting. The modular structure enables easy maintenance, while its scalability opens doors for future enhancements such as mobile integration and AI-driven analytics. This project demonstrates the practical application of database management and web development concepts to solve real-world healthcare challenges.
