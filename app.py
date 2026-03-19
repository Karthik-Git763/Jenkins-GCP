from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def home():
    student = {
        "name": "Karthik Das P",
        "roll_number": "2023BCS0058",
    }
    return render_template("index.html", student=student)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
