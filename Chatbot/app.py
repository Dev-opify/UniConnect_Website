import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS

genai.configure(api_key="AIzaSyBT0VyCSQy4Qd-KzXctalxUtA2d7ypdMq8")
generation_config = {
    "temperature": 0.4,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "stop_sequences": [
        "bye",
        "exit",
        "quit",
        "goodbye",
    ],
    "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    system_instruction='''You are Ana, the mentor of computer science undergrad students. 
You solve the queries of the student related to their career paths and their technical difficulties. 
Use emojis and slight humour to make the conversation interesting, when necessary. 
Answer in a short and crisp manner. 
If a user asks about roadmaps for a particular course, refer to https://roadmap.sh and provide the suitable roadmap.'''
)

# Flask app to serve the chatbot
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/')
def index():
    return "🚀 Chatbot API is running! Send POST requests to /chat"

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get("message")
    response = model.generate_content(user_message)
    bot_reply = response.text
    return jsonify({"response": bot_reply})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Use environment PORT or fallback to 5000
    app.run(host="0.0.0.0", port=port, debug=True)
