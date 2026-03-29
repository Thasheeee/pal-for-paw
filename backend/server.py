import os
import io
import pickle
import numpy as np
import tensorflow as tf
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
from PIL import Image, ImageOps
from transformers import CLIPProcessor, CLIPModel
from bson import ObjectId

# SETUP FLASK & MONGODB ATLAS
app = Flask(__name__)
CORS(app) 

app.config["MONGO_URI"] = os.environ.get("MONGO_URI")
mongo = PyMongo(app)

# EMAIL CONFIGURATION
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_USERNAME')
 
mail = Mail(app)

# GET CURRENT DIRECTORY (where server.py is located)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

print(f"Server running from: {BASE_DIR}")
print(f"Files in backend directory: {os.listdir(BASE_DIR)}")

# Initialization Check
with app.app_context():
    try:
        mongo.db.command('ping')
        print("Successfully connected to MongoDB Atlas (palForPaw database)!")
    except Exception as e:
        print(f"MongoDB Connection Failed: {e}")

# ========================================
# LOAD VISION MODEL (FIXED VERSION)
# ========================================
print("\nLoading Vision Model...")

# Model path (in same directory as server.py)
model_path = os.path.join(BASE_DIR, 'final_dog_skin_model_tf')

print(f"Looking for model at: {model_path}")
print(f"Model exists: {os.path.exists(model_path)}")

vision_model = None

if os.path.exists(model_path):
    try:
        print(f"📂 Contents of model folder: {os.listdir(model_path)}")
        
        # Load the model
        loaded_model = tf.saved_model.load(model_path)
        vision_model = loaded_model.signatures["serving_default"]
        
        print(f"✅ Vision Model Loaded Successfully!")
        print(f"✅ Model signature: {list(vision_model.structured_outputs.keys())}")
        
    except Exception as e:
        print(f"Error loading vision model: {e}")
        import traceback
        traceback.print_exc()
        vision_model = None
else:
    print(f"Model folder not found at: {model_path}")
    print(f"Available files in {BASE_DIR}: {os.listdir(BASE_DIR)}")

# ========================================
# LOAD TEXT EXPERT (CLIP)
# ========================================
print("\nLoading Text Expert (CLIP)...")
device = "cpu"

clip_db_path = os.path.join(BASE_DIR, 'dog_skin_clip_db_large.pkl')
print(f"Looking for CLIP database at: {clip_db_path}")

try:
    clip_model = CLIPModel.from_pretrained("openai/clip-vit-large-patch14").to(device)
    clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-large-patch14")
    
    with open(clip_db_path, 'rb') as f:
        vector_db = pickle.load(f)
    print(f"Text Database Loaded! ({len(vector_db)} entries)")
except Exception as e:
    print(f"Error loading text resources: {e}")
    vector_db = []

# CONSTANTS & MAPPINGS
CLASSES = ['Dermatitis', 'Fungal_infections', 'Healthy', 'Hypersensitivity', 'demodicosis', 'ringworm']
KEYWORDS = {
    "ringworm": ["circle", "circular", "ring", "round", "bald spot", "coin", "oval", "lesion"],
    "demodicosis": ["mite", "mange", "demodex", "crust", "eye", "bug", "scab", "insect", "patchy"],
    "Fungal_infections": ["yeast", "smell", "odor", "greasy", "black", "stink", "oily", "thick", "musty"],
    "Dermatitis": ["hot spot", "inflamed", "irritated", "wet", "red skin", "scratch", "raw", "rash", "angry"],
    "Hypersensitivity": ["flea", "tail", "allergic", "allergy", "hives", "summer", "grass", "season", "reaction"],
    "Healthy": ["clean", "shiny", "healthy", "normal", "clear", "soft", "pretty", "no issue"]
}

# ========================================
# EMAIL HELPER FUNCTION
# ========================================
def send_appointment_email(appointment, status, response=""):
    """Send email notification to user about appointment status"""
    try:
        user_email = appointment.get('email')
        dog_name = appointment.get('dogName', 'Your pet')
        owner_name = appointment.get('ownerName', 'Dear pet owner')
        apt_date = appointment.get('date', 'N/A')
        apt_time = appointment.get('time', 'N/A')
        
        if not user_email:
            print("No email address found for appointment")
            return False
        
        # Email subject based on status
        if status == 'accepted':
            subject = f"✅ Appointment Confirmed - {dog_name}"
            status_text = "ACCEPTED"
            status_color = "#6B8F71"
            message_text = "Great news! Your appointment has been confirmed by our veterinarian."
        else:  # rejected
            subject = f"❌ Appointment Update - {dog_name}"
            status_text = "DECLINED"
            status_color = "#B47B7B"
            message_text = "We're sorry, but your appointment request could not be confirmed at this time."
        
        # HTML Email Template
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Arial', sans-serif; background-color: #E8E3D6; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #5B7C99, #8A9A7B); padding: 30px; text-align: center; color: white; }}
                .header h1 {{ margin: 0; font-size: 28px; }}
                .content {{ padding: 30px; }}
                .status-badge {{ display: inline-block; padding: 8px 16px; border-radius: 8px; background: {status_color}; color: white; font-weight: bold; margin: 10px 0; }}
                .info-box {{ background: #F5F1E8; padding: 20px; border-radius: 12px; margin: 20px 0; }}
                .info-row {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E8E3D6; }}
                .info-row:last-child {{ border-bottom: none; }}
                .label {{ font-weight: bold; color: #5B7C99; }}
                .response-box {{ background: #E8E3D6; padding: 15px; border-left: 4px solid #5B7C99; border-radius: 8px; margin: 20px 0; font-style: italic; }}
                .footer {{ background: #2C3338; color: white; padding: 20px; text-align: center; font-size: 12px; }}
                .button {{ display: inline-block; background: #5B7C99; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🐾 Pal for Paw</h1>
                    <p>Veterinary Appointment Update</p>
                </div>
                <div class="content">
                    <h2>Hello, {owner_name}!</h2>
                    <p>{message_text}</p>
                    
                    <div class="status-badge">STATUS: {status_text}</div>
                    
                    <div class="info-box">
                        <h3>📋 Appointment Details</h3>
                        <div class="info-row">
                            <span class="label">Pet Name:</span>
                            <span>{dog_name}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Date:</span>
                            <span>{apt_date}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Time:</span>
                            <span>{apt_time}</span>
                        </div>
                    </div>
                    
                    {f'<div class="response-box"><strong>💬 Veterinarian Note:</strong><br>{response}</div>' if response else ''}
                    
                    <p>If you have any questions, please contact us at <strong>info@palforpaw.com</strong></p>
                </div>
                <div class="footer">
                    <p>© 2024 Pal for Paw - AI-Powered Pet Care</p>
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        text_body = f"""
        Pal for Paw - Appointment Update
        
        Hello {owner_name},
        
        {message_text}
        
        Status: {status_text}
        
        Appointment Details:
        - Pet Name: {dog_name}
        - Date: {apt_date}
        - Time: {apt_time}
        
        {f'Veterinarian Note: {response}' if response else ''}
        
        If you have questions, contact us at info@palforpaw.com
        
        Best regards,
        Pal for Paw Team
        """
        
        # Create and send email
        msg = Message(
            subject=subject,
            recipients=[user_email],
            body=text_body,
            html=html_body
        )
        
        mail.send(msg)
        print(f"Email sent to {user_email} - Status: {status}")
        return True
        
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False

# ========================================
# AUTHENTICATION ENDPOINTS
# ========================================
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if mongo.db.users.find_one({"email": data['email'], "role": data['role']}):
        return jsonify({"error": f"Email already registered as {data['role']}"}), 400
    
    hashed_pw = generate_password_hash(data['password'])
    mongo.db.users.insert_one({
        "fullName": data['fullName'],
        "email": data['email'],
        "password": hashed_pw,
        "role": data['role']
    })
    return jsonify({"message": "Registration successful"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = mongo.db.users.find_one({"email": data['email'], "role": data['role']})
    
    if user and check_password_hash(user['password'], data['password']):
        return jsonify({"email": user['email'], "role": user['role']}), 200
    return jsonify({"error": "Invalid email, password, or role choice"}), 401

# ========================================
# DATA MANAGEMENT ENDPOINTS
# ========================================
@app.route('/api/appointments', methods=['POST', 'GET'])
def manage_appointments():
    if request.method == 'POST':
        appointment_data = request.get_json()
        if 'status' not in appointment_data:
            appointment_data['status'] = 'pending'
        
        result = mongo.db.appointments.insert_one(appointment_data)
        return jsonify({"message": "Appointment booked", "id": str(result.inserted_id)}), 201
    
    # GET appointments
    role = request.args.get('role')
    email = request.args.get('email')
    
    query = {} if role == 'vet' else {"email": email}
    apts = list(mongo.db.appointments.find(query))
    
    for a in apts: 
        a['_id'] = str(a['_id'])
    return jsonify(apts), 200

# VET DASHBOARD: UPDATE APPOINTMENT STATUS + SEND EMAIL
@app.route('/api/appointments/<id>', methods=['PATCH'])
def update_appointment_status(id):
    print(f"PATCH request received for appointment ID: {id}")
    try:
        data = request.get_json()
        new_status = data.get('status')
        response_message = data.get('response', '')
        
        # Get the appointment first
        appointment = mongo.db.appointments.find_one({'_id': ObjectId(id)})
        
        if not appointment:
            print(" Appointment not found")
            return jsonify({"error": "Appointment not found"}), 404
        
        # Update the appointment
        update_data = {'status': new_status}
        if response_message:
            update_data['response'] = response_message
        
        result = mongo.db.appointments.update_one(
            {'_id': ObjectId(id)},
            {'$set': update_data}
        )
        
        if result.modified_count > 0:
            # Get updated appointment data
            updated_appointment = mongo.db.appointments.find_one({'_id': ObjectId(id)})
            
            # Send email notification
            email_sent = send_appointment_email(updated_appointment, new_status, response_message)
            
            return jsonify({
                "message": f"Appointment {new_status}",
                "emailSent": email_sent
            }), 200
        
        return jsonify({"error": "No changes made"}), 400
        
    except Exception as e:
        print(f" Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/dogs', methods=['POST', 'GET'])
def manage_dogs():
    if request.method == 'POST':
        mongo.db.dogs.insert_one(request.get_json())
        return jsonify({"message": "Dog added for adoption"}), 201
    
    dogs = list(mongo.db.dogs.find())
    for d in dogs: 
        d['_id'] = str(d['_id'])
    return jsonify(dogs), 200

@app.route('/api/dogs/<id>', methods=['DELETE'])
def delete_dog(id):
    try:
        result = mongo.db.dogs.delete_one({'_id': ObjectId(id)})
        if result.deleted_count > 0:
            return jsonify({"message": "Dog removed from adoption list"}), 200
        return jsonify({"error": "Dog not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========================================
# ML PREDICTION ENDPOINTS
# ========================================
@app.route('/predict_image', methods=['POST'])
def predict_image():
    print("\nImage prediction request received")
    
    if not vision_model:
        return jsonify({'error': 'Vision model not loaded.'}), 500
    
    try:
        file = request.files['image']
        # 1. FIX: Ensure image is RGB (converts PNG/Grayscale to 3 channels)
        image = Image.open(io.BytesIO(file.read())).convert('RGB')
        
        # 2. Resize
        img = ImageOps.fit(image, (224, 224), Image.Resampling.LANCZOS)
        img_array = np.asarray(img)
        
        # 3. Shape check: Ensure it's (1, 224, 224, 3)
        img_array = np.expand_dims(img_array, axis=0)
        
        # 4. Preprocess specifically for EfficientNet
        img_array = tf.keras.applications.efficientnet.preprocess_input(img_array)
        
        # 5. Predict
        input_tensor = tf.constant(img_array, dtype=tf.float32)
        preds_dict = vision_model(input_tensor)
        
        # 6. Extract the result tensor safely
        output_key = list(preds_dict.keys())[0]
        preds = preds_dict[output_key].numpy()[0]
        
        # 7. Apply Softmax if the model output is raw logits
        score = tf.nn.softmax(preds).numpy()
        top_index = np.argmax(score)
        
        result = {
            'disease': CLASSES[top_index],
            'confidence': f"{float(np.max(score) * 100):.1f}%"
        }
        
        print(f"Prediction: {result['disease']} ({result['confidence']})")
        return jsonify(result)
        
    except Exception as e:
        print(f" Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/predict_text', methods=['POST'])
def predict_text():
    print("\n📝 Text prediction request received")
    
    if not vector_db:
        return jsonify({'error': 'Database not loaded'}), 500

    data = request.json
    user_text = data.get('text', '')
    
    if not user_text:
        return jsonify({'error': 'No text provided'}), 400

    try:
        print(f"Processing text: {user_text[:50]}...")
        
        inputs = clip_processor(text=[user_text], return_tensors="pt", padding=True).to(device)

        with torch.no_grad():
            outputs = clip_model.text_model(**inputs)
            text_features = outputs.pooler_output

        # Normalize embedding
        text_features = text_features / text_features.norm(p=2, dim=-1, keepdim=True)
        text_vector = text_features.cpu().numpy().reshape(-1)
        ai_scores = {d: 0.0 for d in CLASSES}
        
        for entry in vector_db:
            db_vector = np.array(entry['vector']).reshape(-1)
            sim = float(np.dot(text_vector, db_vector))
            ai_scores[entry['label']] = max(ai_scores[entry['label']], sim)
            
        # Keyword Boosting
        user_words = user_text.lower()
        for disease, keys in KEYWORDS.items():
            if any(k in user_words for k in keys):
                ai_scores[disease] += 0.5

        winner = max(ai_scores, key=ai_scores.get)
        confidence = min(float(ai_scores[winner]) * 100, 99.9)
        
        result = {'disease': winner, 'confidence': f"{confidence:.1f}%"}
        print(f"Prediction: {result['disease']} ({result['confidence']})")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Detailed Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ========================================
# START SERVER
# ========================================
if __name__ == "__main__":
    print("\n" + "="*50)
    print("Pal for Paw Server Starting")
    print("="*50)
    print(f"Vision Model Status: {'✅ Loaded' if vision_model else '❌ Not Loaded'}")
    print(f"Text Model Status: {'✅ Loaded' if vector_db else '❌ Not Loaded'}")
    print(f"Database Status: Connected to MongoDB Atlas")
    print("="*50 + "\n")
    
    app.run(host="0.0.0.0", port=10000, debug=True)
