---
title: Serving ML Models with FastAPI
---

# Serving Machine Learning Models with FastAPI

**Original Description**: Using FastAPI to serve machine learning models, including considerations for loading models and handling predictions.

FastAPI is a popular choice for serving machine learning (ML) models as APIs due to its high performance (handling concurrent prediction requests efficiently), Pythonic nature (most ML workflows use Python), and automatic data validation/serialization with Pydantic.

**Key Considerations:**

1.  **Model Loading**:
    *   **Loading Time**: ML models (especially deep learning models) can be large and take time to load into memory. Avoid loading the model on every request.
    *   **Strategy**: Load the model **once** when the FastAPI application starts and keep it in memory. FastAPI's `startup` event handler (or `lifespan` context manager) is the ideal place for this.
    *   **Memory Usage**: Ensure your deployment environment has enough RAM to hold the loaded model(s).

2.  **Prediction Function**:
    *   Wrap your model's prediction logic in a function. This function will take input data (validated by Pydantic), perform any necessary pre-processing, feed the data to the loaded model, get the prediction, and perform any post-processing before returning the result.

3.  **Input/Output Validation (Pydantic)**:
    *   Define Pydantic models for the expected input data structure for your prediction endpoint. This ensures incoming data is valid before it hits your model.
    *   Define Pydantic models for the structure of the prediction response you want to return to the client.

4.  **Concurrency**:
    *   **CPU-Bound Models**: Many traditional ML models (Scikit-learn, XGBoost) or inference operations can be CPU-bound. If a single prediction takes significant CPU time, running multiple predictions concurrently might saturate the CPU.
        *   FastAPI runs synchronous (`def`) endpoint functions in a thread pool. This prevents a single CPU-bound prediction from blocking the event loop but might lead to thread pool exhaustion under high load.
        *   Consider running multiple Uvicorn/Gunicorn workers to utilize multiple CPU cores.
        *   For very heavy models, consider offloading predictions to a dedicated background task queue (like Celery) managed by workers optimized for CPU tasks.
    *   **I/O-Bound Pre/Post-processing**: If your prediction involves significant I/O (e.g., fetching features from a database before prediction), make the endpoint `async def` and use async libraries for the I/O parts. The model prediction itself might still be synchronous (run it with `run_in_threadpool` if necessary).
    *   **GPU Usage**: If using GPU for inference (e.g., deep learning models with TensorFlow/PyTorch), ensure proper GPU driver setup and library configuration in your deployment environment. Concurrency management on GPUs requires careful handling (e.g., batching requests).

5.  **Batching (Optional but Recommended for Performance)**:
    *   Many ML models (especially deep learning) perform inference much more efficiently on batches of data rather than single instances.
    *   Consider implementing logic (perhaps using background tasks or queueing) to collect incoming prediction requests and process them in batches if throughput is critical. This adds complexity.

**Example: Serving a Simple Scikit-learn Model**

Let's assume we have a pre-trained Scikit-learn model saved to a file (e.g., `model.joblib`).

1.  **Train and Save Model (Example - run this once)**:
    ```python
    # train_model.py 
    from sklearn.linear_model import LogisticRegression
    from sklearn.datasets import make_classification
    from joblib import dump

    X, y = make_classification(n_samples=100, n_features=4, n_informative=2, n_redundant=0, random_state=42)
    model = LogisticRegression()
    model.fit(X, y)

    # Save the trained model
    dump(model, 'model.joblib') 
    print("Model trained and saved to model.joblib")
    print(f"Example input features shape: {X[0].reshape(1, -1).shape}") # e.g., (1, 4)
    print(f"Example prediction for first sample: {model.predict(X[0].reshape(1, -1))}") # e.g., [1]
    ```

2.  **FastAPI Application**:
    ```python
    # main.py
    import os
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel, Field
    from joblib import load
    from typing import List
    import numpy as np # ML models often work with numpy arrays
    # from contextlib import asynccontextmanager # For newer lifespan syntax

    # --- Configuration ---
    MODEL_PATH = "model.joblib"
    MODEL_INSTANCE = None # Global variable to hold the loaded model

    # --- Pydantic Models ---
    class PredictionInput(BaseModel):
        # Assuming the model expects 4 features
        features: List[float] = Field(..., min_length=4, max_length=4) 
        
        model_config = { # Pydantic V2, use Config class for V1
            "json_schema_extra": {
                "example": {
                    "features": [1.0, -0.5, 2.1, 0.3] 
                }
            }
        }


    class PredictionOutput(BaseModel):
        prediction: int # Assuming binary classification 0 or 1
        probability_class_1: Optional[float] = None # Example: Add probability


    # --- Model Loading Logic ---
    def load_model():
        """Loads the ML model from disk."""
        global MODEL_INSTANCE
        try:
            if not os.path.exists(MODEL_PATH):
                 raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
            MODEL_INSTANCE = load(MODEL_PATH)
            print(f"ML Model loaded successfully from {MODEL_PATH}")
            # Simple check: print expected input shape if available
            if hasattr(MODEL_INSTANCE, 'n_features_in_'):
                print(f"Model expects {MODEL_INSTANCE.n_features_in_} features.")
        except Exception as e:
            print(f"Error loading ML model: {e}")
            # Decide how to handle failure: exit, run without model, etc.
            # For this example, we'll allow startup but prediction will fail.
            MODEL_INSTANCE = None 

    # --- FastAPI App Setup ---

    # Option 1: Startup event (older style)
    # app = FastAPI(title="ML Model Serving API")
    # @app.on_event("startup")
    # async def startup_event():
    #     print("Application startup: Loading ML Model...")
    #     load_model()

    # Option 2: Lifespan context manager (newer style, recommended)
    # @asynccontextmanager
    # async def lifespan(app: FastAPI):
    #     # Code to run on startup
    #     print("Lifespan startup: Loading ML Model...")
    #     load_model()
    #     yield # Application runs here
    #     # Code to run on shutdown
    #     print("Lifespan shutdown.")
    #     global MODEL_INSTANCE
    #     MODEL_INSTANCE = None # Clear model instance on shutdown

    # app = FastAPI(title="ML Model Serving API", lifespan=lifespan)
    
    # --- For simplicity in example, load model directly ---
    # (In production, use startup event or lifespan manager)
    app = FastAPI(title="ML Model Serving API")
    load_model() # Load model when module is imported (simpler for demo)


    # --- Prediction Endpoint ---
    @app.post("/predict", response_model=PredictionOutput)
    async def predict(input_data: PredictionInput):
        """Receives input features and returns model prediction."""
        if MODEL_INSTANCE is None:
            raise HTTPException(status_code=503, detail="Model is not loaded or failed to load.")

        try:
            # 1. Prepare data for the model (e.g., convert to NumPy array)
            features_array = np.array(input_data.features).reshape(1, -1) # Reshape for single prediction

            # 2. Make prediction
            # Since scikit-learn predict() is synchronous (CPU-bound),
            # in a high-load async app, you might wrap it:
            # prediction_result = await run_in_threadpool(MODEL_INSTANCE.predict, features_array)
            # For simplicity here, call directly (FastAPI handles sync endpoint in threadpool)
            prediction_result = MODEL_INSTANCE.predict(features_array)
            prediction = int(prediction_result[0]) # Get the first (only) prediction

            # 3. (Optional) Get probabilities
            probability = None
            if hasattr(MODEL_INSTANCE, "predict_proba"):
                 # prob_result = await run_in_threadpool(MODEL_INSTANCE.predict_proba, features_array)
                 prob_result = MODEL_INSTANCE.predict_proba(features_array)
                 probability = float(prob_result[0][1]) # Probability of class 1

            # 4. Format and return response
            return PredictionOutput(prediction=prediction, probability_class_1=probability)

        except Exception as e:
            # Log the exception for debugging
            print(f"Prediction error: {e}") 
            raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")


    @app.get("/health")
    async def health_check():
        # Simple health check, could add model loaded status
        return {"status": "ok", "model_loaded": MODEL_INSTANCE is not None}

    # To run:
    # 1. python train_model.py # To create model.joblib
    # 2. uvicorn main:app --reload
    #
    # Send POST request to /predict with JSON body like:
    # { "features": [0.5, 1.2, -0.8, 2.0] }
    ```

**Key Steps in the Example:**

1.  **Model Loading**: `load_model()` function loads the Joblib file. It's called once when the module loads (or ideally via FastAPI's `startup`/`lifespan`).
2.  **Pydantic Models**: `PredictionInput` defines the expected JSON input, and `PredictionOutput` defines the JSON response.
3.  **Prediction Endpoint (`/predict`)**:
    *   Checks if the model is loaded.
    *   Takes validated `PredictionInput` data.
    *   Converts the input list to a NumPy array suitable for Scikit-learn.
    *   Calls `MODEL_INSTANCE.predict()`. (Note: For truly async behavior with CPU-bound tasks, `run_in_threadpool` might be needed, but FastAPI handles sync endpoints reasonably well).
    *   Optionally calls `predict_proba()` if available.
    *   Formats the result using the `PredictionOutput` model.
    *   Includes basic error handling.
4.  **Health Check**: A simple `/health` endpoint is good practice.

This structure provides a robust way to serve ML models using FastAPI, leveraging its performance and validation features. Remember to adapt the model loading, pre/post-processing, and concurrency handling based on your specific model and deployment requirements.

    