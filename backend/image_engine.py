import numpy as np
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image as keras_image
from PIL import Image
import io

# 1. Load the Pre-trained Model (Downloads once, then caches)
print("👁️ Loading Image Recognition Model...")
model = MobileNetV2(weights='imagenet')
print("✅ Vision System Online")

def analyze_image(image_bytes):
    """
    Input: Raw bytes of the image uploaded from React
    Output: The top prediction (e.g., "water_bottle", "carton")
    """
    try:
        # 2. Preprocess the image
        img = Image.open(io.BytesIO(image_bytes)).resize((224, 224))
        img_array = keras_image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)

        # 3. Predict
        predictions = model.predict(img_array)
        decoded = decode_predictions(predictions, top=3)[0]
        
        # decoded looks like: [('n0123', 'water_bottle', 0.85), ...]
        top_match = decoded[0][1] # Get the label name
        confidence = float(decoded[0][2])
        
        return top_match, confidence

    except Exception as e:
        print(f"❌ Image Error: {e}")
        return "unknown", 0.0

# Test block
if __name__ == "__main__":
    # You can test with a local file path if you want
    pass