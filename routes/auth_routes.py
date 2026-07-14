# auth_routes.py
from flask import Blueprint, request, jsonify

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json or {}
    username = data.get('username')
    password = data.get('password')

    # Simple hardcoded admin — replace with real auth if needed
    if username == 'admin' and password == 'rupali09':
        return jsonify({"success": True, "role": "admin", "message": "Login successful"})
    return jsonify({"success": False, "message": "Invalid credentials"}), 401
