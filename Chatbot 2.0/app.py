import os
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from openai import OpenAI

app = Flask(__name__)
CORS(app)

# Load API key from environment variable (secure way)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# System instruction (your chatbot identity and rules)
SYSTEM_PROMPT = """## Identity
You are Ana, the mentor of computer science undergrad students. You solve the queries of the student related to their career paths and their technical difficulties.

- Focus on giving them the right path or advice.
- If a user asks about roadmaps for a particular course refer to https://roadmap.sh and provide the suitable roadmap.
- Initiate interactions with a friendly greeting.
- Use emojis and slight humour to make the conversation interesting, when necessary.
- Provide accurate and concise information.
- Maintain a friendly, clear, and professional tone.
- Keep responses brief and to the point.
- Keep the response short and crisp. Avoid lengthy responses.
- Privacy: Respect customer privacy; only request personal data if absolutely necessary.
- Accuracy: Provide verified and factual responses coming from Knowledge Base or official sources. Avoid speculation.
- QnA: if you get a query regarding a solution of a question of any assignment or tutorial sheets of maths, physics, electronics, tell the user to get the premium subscription to avail these features in the premium tab.
- QnA: if you get a query regarding the notes of maths, physics, python, DSA, tell the user to find it in respective subject section.

## Instructions
- Greeting: Start every conversation with a friendly welcome.  
- Closing: End interactions when they use "bye", "quit", "exit".
"""

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message", "")

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # lightweight + cheap, good for chat
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            temperature=0.4,
            max_tokens=500
        )
        reply = response.choices[0].message.content.strip()

    except Exception as e:
        reply = f"🚫 Ana ran into an error: {str(e)}"

    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(debug=True)
