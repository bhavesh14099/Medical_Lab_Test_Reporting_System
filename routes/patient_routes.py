# patient_routes.py
from flask import Blueprint, request, jsonify
from models import db, Person, Patient

patient_bp = Blueprint('patient_bp', __name__)

def patient_to_dict(p: Patient):
    per = p.person
    return {
        "patient_id": p.patient_id,
        "person_id": per.person_id,
        "first_name": per.first_name,
        "last_name": per.last_name,
        "phone": per.phone,
        "street": per.street,
        "city": per.city,
        "state": per.state,
        "gender": p.gender,
        "dob": p.dob.isoformat() if p.dob else None,
        "age": p.age,
        "blood_group": p.blood_group
    }

@patient_bp.route('/patients', methods=['GET'])
def get_patients():
    patients = Patient.query.all()
    return jsonify([patient_to_dict(p) for p in patients])

@patient_bp.route('/patients/<int:id>', methods=['GET'])
def get_patient(id):
    p = Patient.query.get_or_404(id)
    return jsonify(patient_to_dict(p))

@patient_bp.route('/patients', methods=['POST'])
def add_patient():
    data = request.json or {}
    person = Person(
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', ''),
        phone=data.get('phone'),
        street=data.get('street'),
        city=data.get('city'),
        state=data.get('state'),
    )
    db.session.add(person)
    db.session.commit()
    patient = Patient(
        person_id=person.person_id,
        gender=data.get('gender'),
        dob=data.get('dob'),
        age=data.get('age'),
        blood_group=data.get('blood_group')
    )
    db.session.add(patient)
    db.session.commit()
    return jsonify({"message": "Patient added", "patient_id": patient.patient_id}), 201

@patient_bp.route('/patients/<int:id>', methods=['PUT'])
def update_patient(id):
    data = request.json or {}
    patient = Patient.query.get_or_404(id)
    person = patient.person
    person.first_name = data.get('first_name', person.first_name)
    person.last_name = data.get('last_name', person.last_name)
    person.phone = data.get('phone', person.phone)
    person.street = data.get('street', person.street)
    person.city = data.get('city', person.city)
    person.state = data.get('state', person.state)

    patient.gender = data.get('gender', patient.gender)
    patient.dob = data.get('dob', patient.dob)
    patient.age = data.get('age', patient.age)
    patient.blood_group = data.get('blood_group', patient.blood_group)

    db.session.commit()
    return jsonify({"message": "Patient updated"})

@patient_bp.route('/patients/<int:id>', methods=['DELETE'])
def delete_patient(id):
    patient = Patient.query.get_or_404(id)
    person = patient.person
    db.session.delete(patient)
    if person:
        db.session.delete(person)
    db.session.commit()
    return jsonify({"message": "Patient deleted"})