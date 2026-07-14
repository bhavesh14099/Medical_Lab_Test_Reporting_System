# labtest_routes.py
from flask import Blueprint, request, jsonify
from models import db, LabTest

labtest_bp = Blueprint('labtest_bp', __name__)

def test_to_dict(t: LabTest):
    return {
        "test_id": t.test_id,
        "test_name": t.test_name,
        "test_cost": float(t.test_cost) if t.test_cost is not None else 0,
        "description": t.description,
        "sample_type": t.sample_type
    }

@labtest_bp.route('/labtests', methods=['GET'])
def get_labtests():
    tests = LabTest.query.all()
    return jsonify([test_to_dict(t) for t in tests])

@labtest_bp.route('/labtests/<int:id>', methods=['GET'])
def get_labtest(id):
    t = LabTest.query.get_or_404(id)
    return jsonify(test_to_dict(t))

@labtest_bp.route('/labtests', methods=['POST'])
def add_labtest():
    data = request.json or {}
    t = LabTest(
        test_name=data.get('test_name'),
        test_cost=data.get('test_cost', 0),
        description=data.get('description'),
        sample_type=data.get('sample_type')
    )
    db.session.add(t)
    db.session.commit()
    return jsonify({"message": "LabTest added", "test_id": t.test_id}), 201

@labtest_bp.route('/labtests/<int:id>', methods=['PUT'])
def update_labtest(id):
    data = request.json or {}
    t = LabTest.query.get_or_404(id)
    t.test_name = data.get('test_name', t.test_name)
    t.test_cost = data.get('test_cost', t.test_cost)
    t.description = data.get('description', t.description)
    t.sample_type = data.get('sample_type', t.sample_type)
    db.session.commit()
    return jsonify({"message": "LabTest updated"})

@labtest_bp.route('/labtests/<int:id>', methods=['DELETE'])
def delete_labtest(id):
    t = LabTest.query.get_or_404(id)
    db.session.delete(t)
    db.session.commit()
    return jsonify({"message": "LabTest deleted"})
