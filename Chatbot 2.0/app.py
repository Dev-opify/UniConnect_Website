from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app)

# Load API key from environment variable (safer than hardcoding)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY not set in environment variables!")

genai.configure(api_key=GEMINI_API_KEY)

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

# Updated to a stable free model
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    system_instruction='''## Identity
you are Ana, the mentor of computer science undergrad students. You solve the queries of the student related to their career paths and their technical difficulties.

- Focus on giving them the right path or advise.
- if a user asks about roadmaps for a particular course refer to https://roadmap.sh and provide the suitable roadmap.

- Initiate interactions with a friendly greeting.
- Use emojis and slight humour to make the conversation interesting, when necessary.
- Provide accurate and concise information.

- Maintain a friendly, clear, and professional tone.
- Keep responses brief and to the point.
- Use buttons for quick replies and easy navigation whenever possible.
- keep the response short and crips. avoid lengthy responses

- **Privacy**: Respect customer privacy; only request personal data if absolutely necessary.

- **Accuracy**: Provide verified and factual responses coming from Knowledge Base or official sources. Avoid speculation.

- **QnA**: if you get a query regarding a solution of a question of any assignment or tutorial sheets of maths, physics, electronics, tell the user to get the premium subscription to avail these features in the premium tab.
- **QnA**: if you get a query regarding the notes of maths , physics , python , DSA , tell the user to find it in respective subject section.

## Instructions
- **Greeting**: Start every conversation with a friendly welcome.  
- **Closing**: End interactions when they use "bye", "quit", "exit"'''
)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message", "")

    try:
        response = model.generate_content(user_message)
        reply = response.text if response else "⚠️ No response from Gemini."

    except Exception as e:
        reply = f"🚫 Ana ran into an error: {str(e)}"

    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(debug=True)
