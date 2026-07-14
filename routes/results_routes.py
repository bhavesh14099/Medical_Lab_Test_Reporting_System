# results_routes.py
from flask import Blueprint, request, jsonify
from models import db, TestResults

results_bp = Blueprint('results_bp', __name__)

def result_to_dict(r: TestResults):
    return {
        "result_id": r.result_id,
        "diagnosis_id": r.diagnosis_id,
        "test_parameter": r.test_parameter,
        "test_value": r.test_value,
        "unit": r.unit,
        "normal_range": r.normal_range,
        "test_comments": r.test_comments
    }

@results_bp.route('/results', methods=['GET'])
def get_results():
    results = TestResults.query.all()
    return jsonify([result_to_dict(r) for r in results])

@results_bp.route('/results/<int:id>', methods=['GET'])
def get_result(id):
    r = TestResults.query.get_or_404(id)
    return jsonify(result_to_dict(r))

@results_bp.route('/results', methods=['POST'])
def add_result():
    data = request.json or {}
    r = TestResults(
        diagnosis_id=data.get('diagnosis_id'),
        test_parameter=data.get('test_parameter'),
        test_value=data.get('test_value'),
        unit=data.get('unit'),
        normal_range=data.get('normal_range'),
        test_comments=data.get('test_comments')
    )
    db.session.add(r)
    db.session.commit()
    return jsonify({"message": "Result added", "result_id": r.result_id}), 201

@results_bp.route('/results/<int:id>', methods=['PUT'])
def update_result(id):
    data = request.json or {}
    r = TestResults.query.get_or_404(id)
    r.test_parameter = data.get('test_parameter', r.test_parameter)
    r.test_value = data.get('test_value', r.test_value)
    r.unit = data.get('unit', r.unit)
    r.normal_range = data.get('normal_range', r.normal_range)
    r.test_comments = data.get('test_comments', r.test_comments)
    db.session.commit()
    return jsonify({"message": "Result updated"})

@results_bp.route('/results/<int:id>', methods=['DELETE'])
def delete_result(id):
    r = TestResults.query.get_or_404(id)
    db.session.delete(r)
    db.session.commit()
    return jsonify({"message": "Result deleted"})
