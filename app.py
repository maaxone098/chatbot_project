from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, session
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import google.generativeai as genai
import os

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "default-secret-key")  # Use an environment variable for security

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
db = client["chatbot"]
users_collection = db["users"]

# Configure the Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY", "YOUR_API_KEY"))

# Initialize the Gemini model
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

@app.route('/')
def home():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user_input = request.form['username']
        password = request.form['password']

        # Check if input is email or username
        if '@' in user_input:
            user = users_collection.find_one({"email": user_input})
        else:
            user = users_collection.find_one({"username": user_input})

        if user and check_password_hash(user['password'], password):
            session['username'] = user['username']
            return redirect(url_for('chat'))
        else:
            flash("Invalid username/email or password.", "error")
            return redirect(url_for('login'))

    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']

        if users_collection.find_one({"username": username}) or users_collection.find_one({"email": email}):
            flash("Username or Email already exists.", "error")
            return redirect(url_for('login'))

        hashed_password = generate_password_hash(password)
        users_collection.insert_one({
            "username": username,
            "email": email,
            "password": hashed_password
        })

        flash("Registration successful! Please log in.", "success")
        return redirect(url_for('login'))

    return render_template('login.html')

@app.route('/chat', methods=['GET', 'POST'])
def chat():
    if 'username' not in session:
        return redirect(url_for('login'))

    if request.method == 'POST':
        user_input = request.json['message']
        session['history'] = session.get('history', [])
        session['history'].append({"user": user_input})

        try:
            # Start chat session and send message to Gemini API
            chat_session = model.start_chat(history=[])
            response = chat_session.send_message(user_input)
            bot_response = response.text

        except Exception as e:
            bot_response = f"Error with Gemini API: {str(e)}"

        session['history'].append({"bot": bot_response})
        return jsonify({"response": bot_response})

    return render_template('chat.html', history=session.get('history', []))

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)
