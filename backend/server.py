import os
import io
import pickle
import numpy as np
import tensorflow as tf
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from PIL import Image, ImageOps
from transformers import CLIPProcessor, CLIPModel
from bson import ObjectId

# SETUP FLASK & MONGODB ATLAS
app = Flask(__name__)
CORS(app) 

app.config["MONGO_URI"] = "mongodb+srv://thashee2003_db_user:93vKGCTFjsUWCTZu@palforpawcluster0.ao04vhy.mongodb.net/palForPaw?retryWrites=true&w=majority&appName=PalForPawCluster0"
mongo = PyMongo(app) #

# Initialization Check
with app.app_context():
    try:
        mongo.db.command('ping')
        print("✅ Successfully connected to MongoDB Atlas (palForPaw database)!")
    except Exception as e:
        print(f" MongoDB Connection Failed: {e}")


#  LOAD VISION MODEL
print("⏳ Loading Vision Model...")
try:
    loaded_model = tf.saved_model.load('final_dog_skin_model_tf')
    vision_model = loaded_model.signatures["serving_default"]
    print("✅ Vision Model Loaded!")
except Exception as e:
    print(f" Error loading vision model: {e}")
    vision_model = None

# LOAD TEXT EXPERT (CLIP)
print("⏳ Loading Text Expert (CLIP)...")
device = "cpu"
try:
    clip_model = CLIPModel.from_pretrained("openai/clip-vit-large-patch14").to(device)
    clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-large-patch14")
    
    with open('dog_skin_clip_db_large.pkl', 'rb') as f:
        vector_db = pickle.load(f)
    print("✅ Text Database Loaded!")
except Exception as e:
    print(f" Error loading text resources: {e}")
    vector_db = []

#  CONSTANTS & MAPPINGS
CLASSES = ['Dermatitis', 'Fungal_infections', 'Healthy', 'Hypersensitivity', 'demodicosis', 'ringworm']
KEYWORDS = {
    "ringworm": ["circle", "circular", "ring", "round", "bald spot", "coin", "oval", "lesion"],
    "demodicosis": ["mite", "mange", "demodex", "crust", "eye", "bug", "scab", "insect", "patchy"],
    "Fungal_infections": ["yeast", "smell", "odor", "greasy", "black", "stink", "oily", "thick", "musty"],
    "Dermatitis": ["hot spot", "inflamed", "irritated", "wet", "red skin", "scratch", "raw", "rash", "angry"],
    "Hypersensitivity": ["flea", "tail", "allergic", "allergy", "hives", "summer", "grass", "season", "reaction"],
    "Healthy": ["clean", "shiny", "healthy", "normal", "clear", "soft", "pretty", "no issue"]
}

#  AUTHENTICATION ENDPOINTS 

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    # Enforce role-based uniqueness
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
    user = mongo.db.users.find_one({"email": data['email'], "role": data['role']}) #
    
    if user and check_password_hash(user['password'], data['password']):
        return jsonify({"email": user['email'], "role": user['role']}), 200
    return jsonify({"error": "Invalid email, password, or role choice"}), 401 #

#  DATA MANAGEMENT ENDPOINTS

@app.route('/api/appointments', methods=['POST', 'GET'])
def manage_appointments():
    if request.method == 'POST':
        # Used by BookingPage.jsx to save new requests
        mongo.db.appointments.insert_one(request.get_json())
        return jsonify({"message": "Appointment booked"}), 201
    
    # Used by App.jsx to fetch data for display
    role = request.args.get('role')
    email = request.args.get('email')
    
    # Filter: Vets see everything; Users see only theirs
    query = {} if role == 'vet' else {"email": email}
    apts = list(mongo.db.appointments.find(query))
    
    # Convert MongoDB ObjectIds to strings so React can read them
    for a in apts: a['_id'] = str(a['_id'])
    return jsonify(apts), 200


# VET DASHBOARD: UPDATE APPOINTMENT STATUS 
@app.route('/api/appointments/<id>', methods=['PATCH'])
def update_appointment_status(id):
    try:
        data = request.get_json()
        new_status = data.get('status') # e.g., 'accepted' or 'rejected'
        
        # Update the specific appointment in MongoDB Atlas
        result = mongo.db.appointments.update_one(
            {'_id': ObjectId(id)},
            {'$set': {'status': new_status}}
        )
        
        if result.modified_count > 0:
            return jsonify({"message": f"Appointment {new_status}"}), 200
        return jsonify({"error": "Appointment not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/dogs', methods=['POST', 'GET'])
def manage_dogs():
    if request.method == 'POST':
        # Stores dog data including Base64 image string directly to Atlas
        mongo.db.dogs.insert_one(request.get_json())
        return jsonify({"message": "Dog added for adoption"}), 201
    
    dogs = list(mongo.db.dogs.find())
    for d in dogs: d['_id'] = str(d['_id'])
    return jsonify(dogs), 200

#  DELETE DOG LISTING 
@app.route('/api/dogs/<id>', methods=['DELETE'])
def delete_dog(id):
    try:
        result = mongo.db.dogs.delete_one({'_id': ObjectId(id)})
        if result.deleted_count > 0:
            return jsonify({"message": "Dog removed from adoption list"}), 200
        return jsonify({"error": "Dog not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

#  ML PREDICTION ENDPOINTS 

@app.route('/predict_image', methods=['POST'])
def predict_image():
    if not vision_model:
        return jsonify({'error': 'Vision model not loaded.'}), 500
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    try:
        file = request.files['image']
        image = Image.open(io.BytesIO(file.read()))
        img = ImageOps.fit(image, (224, 224), Image.Resampling.LANCZOS)
        img_array = np.asarray(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = tf.keras.applications.efficientnet.preprocess_input(img_array)
        
        input_tensor = tf.constant(img_array, dtype=tf.float32)
        preds_dict = vision_model(input_tensor)
        preds_tensor = list(preds_dict.values())[0]
        preds = preds_tensor.numpy()[0]
        
        score = tf.nn.softmax(preds)
        top_index = np.argmax(score)
        
        return jsonify({
            'disease': CLASSES[top_index],
            'confidence': f"{float(np.max(score) * 100):.1f}%"
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict_text', methods=['POST'])
def predict_text():
    if not vector_db:
        return jsonify({'error': 'Database not loaded'}), 500

    data = request.json
    user_text = data.get('text', '')
    if not user_text:
        return jsonify({'error': 'No text provided'}), 400

    try:
        inputs = clip_processor(text=[user_text], return_tensors="pt", padding=True).to(device)
        with torch.no_grad():
            text_features = clip_model.get_text_features(**inputs)
        
        text_features /= text_features.norm(p=2, dim=-1, keepdim=True)
        text_vector = text_features.numpy()
        
        ai_scores = {d: 0.0 for d in CLASSES}
        for entry in vector_db:
            sim = np.dot(text_vector, entry['vector'].T).item()
            ai_scores[entry['label']] = max(ai_scores[entry['label']], sim)
            
        # Keyword Boosting
        user_words = user_text.lower()
        for disease, keys in KEYWORDS.items():
            if any(k in user_words for k in keys):
                ai_scores[disease] += 0.5

        winner = max(ai_scores, key=ai_scores.get)
        confidence = min(ai_scores[winner] * 100, 99.9)
        
        return jsonify({'disease': winner, 'confidence': f"{confidence:.1f}%"})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Pal for Paw Server starting on http://localhost:5000")
    app.run(port=5000, debug=True)