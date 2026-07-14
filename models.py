# models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Person(db.Model):
    __tablename__ = 'Person'
    person_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(15))
    street = db.Column(db.String(100))
    city = db.Column(db.String(50))
    state = db.Column(db.String(50))

    # relationships
    patient = db.relationship('Patient', back_populates='person', uselist=False, cascade="all, delete")
    technician = db.relationship('Technician', back_populates='person', uselist=False, cascade="all, delete")

class Patient(db.Model):
    __tablename__ = 'Patient'
    patient_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    person_id = db.Column(db.Integer, db.ForeignKey('Person.person_id'), unique=True)
    gender = db.Column(db.String(10))
    dob = db.Column(db.Date)
    age = db.Column(db.Integer)
    blood_group = db.Column(db.String(5))

    person = db.relationship('Person', back_populates='patient')
    bookings = db.relationship('Booking', back_populates='patient', cascade="all, delete-orphan")

class Technician(db.Model):
    __tablename__ = 'Technician'
    tech_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    person_id = db.Column(db.Integer, db.ForeignKey('Person.person_id'), unique=True)
    qualification = db.Column(db.String(100))
    specialization = db.Column(db.String(100))

    person = db.relationship('Person', back_populates='technician')
    bookings = db.relationship('Booking', back_populates='technician', cascade="all, delete-orphan")

class LabTest(db.Model):
    __tablename__ = 'LabTest'
    test_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    test_name = db.Column(db.String(100), nullable=False)
    test_cost = db.Column(db.Numeric(10,2), nullable=False)
    description = db.Column(db.Text)
    sample_type = db.Column(db.String(50))

    bookings = db.relationship('Booking', back_populates='labtest', cascade="all, delete-orphan")

class Booking(db.Model):
    __tablename__ = 'Booking'
    booking_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('Patient.patient_id'))
    test_id = db.Column(db.Integer, db.ForeignKey('LabTest.test_id'))
    tech_id = db.Column(db.Integer, db.ForeignKey('Technician.tech_id'))
    booking_date = db.Column(db.DateTime, default=datetime.utcnow)
    scheduled_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='Pending')

    patient = db.relationship('Patient', back_populates='bookings')
    labtest = db.relationship('LabTest', back_populates='bookings')
    technician = db.relationship('Technician', back_populates='bookings')
    diagnosis = db.relationship('Diagnosis', back_populates='booking', uselist=False, cascade="all, delete-orphan")

class Diagnosis(db.Model):
    __tablename__ = 'Diagnosis'
    diagnosis_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('Booking.booking_id'), unique=True)
    diagnosis_date = db.Column(db.DateTime, default=datetime.utcnow)
    remarks = db.Column(db.Text)

    booking = db.relationship('Booking', back_populates='diagnosis')
    results = db.relationship('TestResults', back_populates='diagnosis', cascade="all, delete-orphan")
    bill = db.relationship('Bill', back_populates='diagnosis', uselist=False, cascade="all, delete-orphan")

class TestResults(db.Model):
    __tablename__ = 'TestResults'
    result_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    diagnosis_id = db.Column(db.Integer, db.ForeignKey('Diagnosis.diagnosis_id'))
    test_parameter = db.Column(db.String(100), nullable=False)
    test_value = db.Column(db.String(50))
    unit = db.Column(db.String(20))
    normal_range = db.Column(db.String(50))
    test_comments = db.Column(db.Text)

    diagnosis = db.relationship('Diagnosis', back_populates='results')

class Bill(db.Model):
    __tablename__ = 'Bill'
    bill_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    diagnosis_id = db.Column(db.Integer, db.ForeignKey('Diagnosis.diagnosis_id'), unique=True)
    total_amt = db.Column(db.Numeric(10,2), nullable=False)
    payment_status = db.Column(db.String(20), default='Pending')
    payment_date = db.Column(db.Date)

    diagnosis = db.relationship('Diagnosis', back_populates='bill')