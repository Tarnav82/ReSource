import pandas as pd
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.pipeline import Pipeline

# 1. Create Dummy Data (If CSV doesn't exist)
data = {
    'text': [
        "rusted iron pipes", "steel beams and scraps", "aluminum cans", 
        "copper wire scraps", "cardboard boxes", "office paper waste", 
        "plastic bottles", "pvc pipes", "glass bottles", "broken window panes", 
        "wooden pallets", "sawdust and chips", "spent grain", "organic food waste", 
        "chemical sludge", "industrial solvents", "concrete rubble", "fly ash"
    ],
    'category': [
        "Metal", "Metal", "Metal", 
        "Metal", "Paper", "Paper", 
        "Plastic", "Plastic", "Glass", "Glass", 
        "Wood", "Wood", "Organic", "Organic", 
        "Chemical", "Chemical", "Construction", "Construction"
    ]
}
df = pd.DataFrame(data)

X = df['text']
y = df['category']

# 2. Create Training Pipeline
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(ngram_range=(1,2))), 
    ('clf', SGDClassifier(loss='hinge', penalty='l2', alpha=1e-3, random_state=42))
])

# 3. Train
print("Training model...")
pipeline.fit(X, y)

# 4. Save
with open('waste_classifier.pkl', 'wb') as f:
    pickle.dump(pipeline, f)
    
print("✅ Model saved successfully as 'waste_classifier.pkl'")