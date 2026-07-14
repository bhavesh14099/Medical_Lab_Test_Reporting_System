# booking_routes.py
from flask import Blueprint, request, jsonify
from models import db, Booking
from datetime import datetime

booking_bp = Blueprint('booking_bp', __name__)

def booking_to_dict(b: Booking):
    return {
        "booking_id": b.booking_id,
        "patient_id": b.patient_id,
        "test_id": b.test_id,
        "tech_id": b.tech_id,
        "booking_date": b.booking_date.isoformat() if b.booking_date else None,
        "scheduled_date": b.scheduled_date.isoformat() if b.scheduled_date else None,
        "status": b.status
    }

@booking_bp.route('/bookings', methods=['GET'])
def get_bookings():
    bookings = Booking.query.all()
    return jsonify([booking_to_dict(b) for b in bookings])

@booking_bp.route('/bookings/<int:id>', methods=['GET'])
def get_booking(id):
    b = Booking.query.get_or_404(id)
    return jsonify(booking_to_dict(b))

@booking_bp.route('/bookings', methods=['POST'])
def add_booking():
    data = request.json or {}
    scheduled = data.get('scheduled_date')
    # Expecting ISO-like string e.g. "2025-09-25T14:30"
    if scheduled:
        try:
            scheduled_dt = datetime.fromisoformat(scheduled)
        except Exception:
            # try simple parsing fallback
            scheduled_dt = datetime.strptime(scheduled, '%Y-%m-%dT%H:%M')
    else:
        return jsonify({"message": "scheduled_date required"}), 400

    booking = Booking(
        patient_id=data.get('patient_id'),
        test_id=data.get('test_id'),
        tech_id=data.get('tech_id'),
        scheduled_date=scheduled_dt,
        status=data.get('status', 'Pending')
    )
    db.session.add(booking)
    db.session.commit()
    return jsonify({"message": "Booking created", "booking_id": booking.booking_id}), 201

@booking_bp.route('/bookings/<int:id>', methods=['PUT'])
def update_booking(id):
    data = request.json or {}
    b = Booking.query.get_or_404(id)
    if 'patient_id' in data: b.patient_id = data['patient_id']
    if 'test_id' in data: b.test_id = data['test_id']
    if 'tech_id' in data: b.tech_id = data['tech_id']
    if 'scheduled_date' in data:
        try:
            b.scheduled_date = datetime.fromisoformat(data['scheduled_date'])
        except Exception:
            b.scheduled_date = datetime.strptime(data['scheduled_date'], '%Y-%m-%dT%H:%M')
    if 'status' in data: b.status = data['status']
    db.session.commit()
    return jsonify({"message": "Booking updated"})

@booking_bp.route('/bookings/<int:id>', methods=['DELETE'])
def delete_booking(id):
    b = Booking.query.get_or_404(id)
    db.session.delete(b)
    db.session.commit()
    return jsonify({"message": "Booking deleted"})