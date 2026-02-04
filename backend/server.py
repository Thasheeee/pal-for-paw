import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import torch  # <--- FIXED: Added missing import
import pickle
import numpy as np
from PIL import Image, ImageOps
from transformers import CLIPProcessor, CLIPModel
import io

# 1. SETUP FLASK
app = Flask(__name__)
CORS(app) 

# 2. LOAD VISION MODEL (Universal Low-Level Loader)
print("⏳ Loading Vision Model...")
try:
    # We use tf.saved_model.load instead of keras. This works on ALL versions.
    loaded_model = tf.saved_model.load('final_dog_skin_model_tf')
    # Get the "serving" function (the actual predictor)
    vision_model = loaded_model.signatures["serving_default"]
    print("✅ Vision Model Loaded!")
except Exception as e:
    print(f"❌ Error loading vision model: {e}")
    print("⚠️ Ensure 'final_dog_skin_model_tf' folder is in backend/")
    vision_model = None

# 3. LOAD TEXT EXPERT
print("⏳ Loading Text Expert (CLIP)...")
device = "cpu"
try:
    clip_model = CLIPModel.from_pretrained("openai/clip-vit-large-patch14").to(device)
    clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-large-patch14")
    
    with open('dog_skin_clip_db_large.pkl', 'rb') as f:
        vector_db = pickle.load(f)
    print("✅ Text Database Loaded!")
except Exception as e:
    print(f"❌ Error loading text resources: {e}")
    vector_db = []

# 4. CONSTANTS
CLASSES = ['Dermatitis', 'Fungal_infections', 'Healthy', 'Hypersensitivity', 'demodicosis', 'ringworm']
KEYWORDS = {
    "ringworm": ["circle", "circular", "ring", "round", "bald spot", "coin", "oval", "lesion"],
    "demodicosis": ["mite", "mange", "demodex", "crust", "eye", "bug", "scab", "insect", "patchy"],
    "Fungal_infections": ["yeast", "smell", "odor", "greasy", "black", "stink", "oily", "thick", "musty"],
    "Dermatitis": ["hot spot", "inflamed", "irritated", "wet", "red skin", "scratch", "raw", "rash", "angry"],
    "Hypersensitivity": ["flea", "tail", "allergic", "allergy", "hives", "summer", "grass", "season", "reaction"],
    "Healthy": ["clean", "shiny", "healthy", "normal", "clear", "soft", "pretty", "no issue"]
}

# --- 5. ENDPOINT: IMAGE PREDICTION ---
@app.route('/predict_image', methods=['POST'])
def predict_image():
    if not vision_model:
        return jsonify({'error': 'Vision model not loaded.'}), 500
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    try:
        file = request.files['image']
        image = Image.open(io.BytesIO(file.read()))
        
        # Preprocess
        img = ImageOps.fit(image, (224, 224), Image.Resampling.LANCZOS)
        img_array = np.asarray(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = tf.keras.applications.efficientnet.preprocess_input(img_array)
        
        # Predict (Using Low-Level Signature)
        # We must convert numpy array to Tensor explicitly
        input_tensor = tf.constant(img_array, dtype=tf.float32)
        
        # The model returns a dictionary. We grab the first output.
        preds_dict = vision_model(input_tensor)
        
        # Extract the prediction tensor (usually named 'output_0' or 'dense')
        # We just take the first value found in the dictionary to be safe
        preds_tensor = list(preds_dict.values())[0]
        preds = preds_tensor.numpy()[0] # Convert back to numpy
        
        score = tf.nn.softmax(preds)
        
        top_index = np.argmax(score)
        result = {
            'disease': CLASSES[top_index],
            'confidence': f"{float(np.max(score) * 100):.1f}%"
        }
        return jsonify(result)

    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({'error': str(e)}), 500

# --- 6. ENDPOINT: TEXT PREDICTION ---
@app.route('/predict_text', methods=['POST'])
def predict_text():
    if not vector_db:
        return jsonify({'error': 'Text database not loaded'}), 500

    data = request.json
    user_text = data.get('text', '')
    
    if not user_text:
        return jsonify({'error': 'No text provided'}), 400

    try:
        # Vector Search
        prompts = [f"a photo of a dog with {user_text}", f"veterinary clinical image of {user_text}", user_text]
        inputs = clip_processor(text=prompts, return_tensors="pt", padding=True).to(device)
        with torch.no_grad():
            text_features = clip_model.get_text_features(**inputs)
        
        text_features /= text_features.norm(p=2, dim=-1, keepdim=True)
        mean_vector = torch.mean(text_features, dim=0, keepdim=True)
        mean_vector /= mean_vector.norm()
        text_vector = mean_vector.numpy()
        
        ai_scores = {d: 0.0 for d in CLASSES}
        scores = []
        for entry in vector_db:
            sim = np.dot(text_vector, entry['vector'].T).item()
            scores.append((sim, entry['label']))
        
        scores.sort(key=lambda x: x[0], reverse=True)
        for sim, label in scores[:30]:
            ai_scores[label] += sim
            
        max_val = max(ai_scores.values()) if ai_scores.values() else 1
        for d in ai_scores: ai_scores[d] /= max_val

        # Keyword Boost
        user_words = user_text.lower()
        for disease, keys in KEYWORDS.items():
            if any(k in user_words for k in keys):
                ai_scores[disease] += 2.0

        if ai_scores.get('ringworm', 0) > 0.8 and not any(k in user_words for k in KEYWORDS['ringworm']):
            ai_scores['ringworm'] *= 0.3

        winner = max(ai_scores, key=ai_scores.get)
        confidence = min(ai_scores[winner] * 35, 99.9)
        
        return jsonify({'disease': winner, 'confidence': f"{confidence:.1f}%"})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Server starting on http://localhost:5000")
    app.run(port=5000, debug=True)