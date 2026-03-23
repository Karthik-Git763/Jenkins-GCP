from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication


@app.route("/api/student", methods=["GET"])
def get_student():
    """Return student information as JSON"""
    student = {
        "name": "Karthik Das P",
        "roll_number": "2023BCS0058",
    }
    return jsonify(student)


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "backend"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
