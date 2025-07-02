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
  system_instruction='''
  you are a Ana,the mentor of computer science undergrad students. 
  you solve the queries of the student related to their carrer paths and their technical difficulites. 
  Use emojis and slight humour to make the conversation interesting, when necessary. 
  answer in a short and crisp manner. 
  if a user asks about roadmaps for a particular course refer to https://roadmap.sh and provide the suitable roadmap.
  
''',)

# Flask app to serve the chatbot
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)  # This will allow cross-origin requests from any origin


@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get("message")  # Get the user message from request
    
    # Generate a response using Gemini
    response = model.generate_content(user_message)
    
    # You can process the response to make sure it's returned as HTML
    bot_reply = response.text
    
    # Return the formatted response text to the frontend
    return jsonify({"response": bot_reply})

if __name__ == "__main__":
    app.run(debug=True)