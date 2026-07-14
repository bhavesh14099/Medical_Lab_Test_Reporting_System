# diagnosis_routes.py
from flask import Blueprint, request, jsonify
from models import db, Diagnosis

diagnosis_bp = Blueprint('diagnosis_bp', __name__)

def diag_to_dict(d: Diagnosis):
    return {
        "diagnosis_id": d.diagnosis_id,
        "booking_id": d.booking_id,
        "diagnosis_date": d.diagnosis_date.isoformat() if d.diagnosis_date else None,
        "remarks": d.remarks
    }

@diagnosis_bp.route('/diagnosis', methods=['GET'])
def get_all():
    items = Diagnosis.query.all()
    return jsonify([diag_to_dict(d) for d in items])

@diagnosis_bp.route('/diagnosis/<int:id>', methods=['GET'])
def get_one(id):
    d = Diagnosis.query.get_or_404(id)
    return jsonify(diag_to_dict(d))

@diagnosis_bp.route('/diagnosis', methods=['POST'])
def add_diag():
    data = request.json or {}
    diag = Diagnosis(
        booking_id=data.get('booking_id'),
        remarks=data.get('remarks')
    )
    db.session.add(diag)
    db.session.commit()
    return jsonify({"message": "Diagnosis added", "diagnosis_id": diag.diagnosis_id}), 201

@diagnosis_bp.route('/diagnosis/<int:id>', methods=['PUT'])
def update_diag(id):
    data = request.json or {}
    d = Diagnosis.query.get_or_404(id)
    if 'booking_id' in data: d.booking_id = data['booking_id']
    if 'remarks' in data: d.remarks = data['remarks']
    db.session.commit()
    return jsonify({"message": "Diagnosis updated"})

@diagnosis_bp.route('/diagnosis/<int:id>', methods=['DELETE'])
def delete_diag(id):
    d = Diagnosis.query.get_or_404(id)
    db.session.delete(d)
    db.session.commit()
    return jsonify({"message": "Diagnosis deleted"})
