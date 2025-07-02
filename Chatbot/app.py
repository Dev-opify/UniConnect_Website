import os
import google.generativeai as genai
from flask import Flask, render_template, request, jsonify
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
    system_instruction='''## Identity
you are a Ana, the mentor of computer science undergrad students. You solve the queries of the student related to their career paths and their technical difficulties.


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

# Flask app to serve the chatbot
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get("message")

    try:
        # Send user input to Gemini model
        response = model.generate_content(user_input)

        bot_reply = response.text.strip() if response.text else "I'm not sure how to answer that."

    except Exception as e:
        print(f"Error: {e}")
        bot_reply = "Sorry, I encountered an issue. Please try again."

    return jsonify({"reply": bot_reply})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Use environment PORT or fallback to 5000
    app.run(host="0.0.0.0", port=port, debug=True)
