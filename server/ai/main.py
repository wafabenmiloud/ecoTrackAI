# server/ai/main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from sklearn.ensemble import IsolationForest
from datetime import datetime, timedelta
import joblib
import os
from pathlib import Path

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models directory
MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)

class DataPoint(BaseModel):
    timestamp: str
    value: float

class PredictionRequest(BaseModel):
    data: List[DataPoint]
    periods: int = 7
    freq: str = 'D'  # D for day, H for hour, etc.

class AnomalyDetectionRequest(BaseModel):
    data: List[DataPoint]
    contamination: float = 0.1

def train_arima_model(series, order=(1,1,1)):
    """Train ARIMA model for time series forecasting."""
    model = ARIMA(series, order=order)
    model_fit = model.fit()
    return model_fit

def detect_anomalies(data: List[DataPoint], contamination=0.1):
    """Detect anomalies using Isolation Forest."""
    values = np.array([[d.value] for d in data])
    timestamps = [d.timestamp for d in data]
    
    # Train model
    model = IsolationForest(contamination=contamination, random_state=42)
    model.fit(values)
    
    # Predict anomalies
    preds = model.predict(values)
    anomalies = [timestamps[i] for i, pred in enumerate(preds) if pred == -1]
    
    return anomalies

@app.post("/predict")
async def predict(request: PredictionRequest):
    try:
        # Convert to DataFrame
        df = pd.DataFrame([d.dict() for d in request.data])
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.set_index('timestamp').sort_index()
        
        # Train ARIMA model
        model = train_arima_model(df['value'])
        
        # Make predictions
        forecast = model.forecast(steps=request.periods)
        
        # Generate future dates
        last_date = df.index[-1]
        if request.freq == 'D':
            future_dates = [last_date + timedelta(days=x+1) for x in range(request.periods)]
        elif request.freq == 'H':
            future_dates = [last_date + timedelta(hours=x+1) for x in range(request.periods)]
        else:
            future_dates = pd.date_range(start=last_date, periods=request.periods+1, freq=request.freq)[1:]
        
        # Prepare response
        predictions = [
            {"timestamp": str(date), "value": float(value)}
            for date, value in zip(future_dates, forecast)
        ]
        
        return {
            "success": True,
            "predictions": predictions,
            "model_summary": str(model.summary())
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-anomalies")
async def detect_anomalies_endpoint(request: AnomalyDetectionRequest):
    try:
        anomalies = detect_anomalies(request.data, request.contamination)
        return {
            "success": True,
            "anomaly_timestamps": anomalies,
            "total_anomalies": len(anomalies)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)