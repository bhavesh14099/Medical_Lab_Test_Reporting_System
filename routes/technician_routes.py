# technician_routes.py
from flask import Blueprint, request, jsonify
from models import db, Person, Technician

tech_bp = Blueprint('tech_bp', __name__)
 
def tech_to_dict(t: Technician):
    per = t.person
    return {
        "tech_id": t.tech_id,
        "person_id": per.person_id if per else None,
        "first_name": per.first_name if per else None,
        "last_name": per.last_name if per else None,
        "phone": per.phone if per else None,
        "qualification": t.qualification,
        "specialization": t.specialization
    }

@tech_bp.route('/technicians', methods=['GET'])
def get_technicians():
    techs = Technician.query.all()
    return jsonify([tech_to_dict(t) for t in techs])

@tech_bp.route('/technicians/<int:id>', methods=['GET'])
def get_technician(id):
    t = Technician.query.get_or_404(id)
    return jsonify(tech_to_dict(t))

@tech_bp.route('/technicians', methods=['POST'])
def add_technician():
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
    tech = Technician(
        person_id=person.person_id,
        qualification=data.get('qualification'),
        specialization=data.get('specialization'),
    )
    db.session.add(tech)
    db.session.commit()
    return jsonify({"message": "Technician added", "tech_id": tech.tech_id}), 201

@tech_bp.route('/technicians/<int:id>', methods=['PUT'])
def update_technician(id):
    data = request.json or {}
    tech = Technician.query.get_or_404(id)
    person = tech.person
    person.first_name = data.get('first_name', person.first_name)
    person.last_name = data.get('last_name', person.last_name)
    person.phone = data.get('phone', person.phone)
    person.street = data.get('street', person.street)
    person.city = data.get('city', person.city)
    person.state = data.get('state', person.state)

    tech.qualification = data.get('qualification', tech.qualification)
    tech.specialization = data.get('specialization', tech.specialization)
    db.session.commit()
    return jsonify({"message": "Technician updated"})

@tech_bp.route('/technicians/<int:id>', methods=['DELETE'])
def delete_technician(id):
    tech = Technician.query.get_or_404(id)
    person = tech.person
    db.session.delete(tech)
    if person:
        db.session.delete(person)
    db.session.commit()
    return jsonify({"message": "Technician deleted"})
