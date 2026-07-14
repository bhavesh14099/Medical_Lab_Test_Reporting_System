# bill_routes.py
from flask import Blueprint, request, jsonify
from models import db, Bill

bill_bp = Blueprint('bill_bp', __name__)

def bill_to_dict(b: Bill):
    return {
        "bill_id": b.bill_id,
        "diagnosis_id": b.diagnosis_id,
        "total_amt": float(b.total_amt) if b.total_amt is not None else 0.0,
        "payment_status": b.payment_status,
        "payment_date": b.payment_date.isoformat() if b.payment_date else None
    }

@bill_bp.route('/bills', methods=['GET'])
def get_bills():
    bills = Bill.query.all()
    return jsonify([bill_to_dict(b) for b in bills])

@bill_bp.route('/bills/<int:id>', methods=['GET'])
def get_bill(id):
    b = Bill.query.get_or_404(id)
    return jsonify(bill_to_dict(b))

@bill_bp.route('/bills', methods=['POST'])
def add_bill():
    data = request.json or {}
    b = Bill(
        diagnosis_id=data.get('diagnosis_id'),
        total_amt=data.get('total_amt', 0.0),
        payment_status=data.get('payment_status', 'Pending'),
        payment_date=data.get('payment_date')
    )
    db.session.add(b)
    db.session.commit()
    return jsonify({"message": "Bill added", "bill_id": b.bill_id}), 201

@bill_bp.route('/bills/<int:id>', methods=['PUT'])
def update_bill(id):
    data = request.json or {}
    b = Bill.query.get_or_404(id)
    b.total_amt = data.get('total_amt', b.total_amt)
    b.payment_status = data.get('payment_status', b.payment_status)
    b.payment_date = data.get('payment_date', b.payment_date)
    db.session.commit()
    return jsonify({"message": "Bill updated"})

@bill_bp.route('/bills/<int:id>', methods=['DELETE'])
def delete_bill(id):
    b = Bill.query.get_or_404(id)
    db.session.delete(b)
    db.session.commit()
    return jsonify({"message": "Bill deleted"})
