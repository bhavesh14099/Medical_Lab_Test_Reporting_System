# app.py
from flask import Flask, render_template
from flask_cors import CORS
from config import SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS
from models import db

# Blueprints import
from routes.auth_routes import auth_bp
from routes.patient_routes import patient_bp
from routes.technician_routes import tech_bp
from routes.labtest_routes import labtest_bp
from routes.booking_routes import booking_bp
from routes.diagnosis_routes import diagnosis_bp
from routes.results_routes import results_bp
from routes.bill_routes import bill_bp

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS

CORS(app)
db.init_app(app)

# Serve frontend pages
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/patients')
def patients():
    return render_template('patients.html')

@app.route('/technicians')
def technicians():
    return render_template('technicians.html')

@app.route('/labtests')
def labtests():
    return render_template('labtests.html')

@app.route('/bookings')
def bookings():
    return render_template('bookings.html')

@app.route('/results')
def results():
    return render_template('results.html')

# Register API blueprints under /api
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(patient_bp, url_prefix='/api')
app.register_blueprint(tech_bp, url_prefix='/api')
app.register_blueprint(labtest_bp, url_prefix='/api')
app.register_blueprint(booking_bp, url_prefix='/api')
app.register_blueprint(diagnosis_bp, url_prefix='/api')
app.register_blueprint(results_bp, url_prefix='/api')
app.register_blueprint(bill_bp, url_prefix='/api')

# Create tables on startup (development convenience)
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)