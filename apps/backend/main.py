from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()

# Updated CORS middleware configuration to include Vite's default port
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",  # Vite's default port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"


@app.get("/api/weather/{city}")
async def get_weather(city: str):
    if not WEATHER_API_KEY:
        logger.error("Weather API key is not set")
        raise HTTPException(status_code=500, detail="Weather API key is not configured")

    try:
        logger.info(f"Fetching weather data for city: {city}")
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{WEATHER_BASE_URL}/weather",
                params={"q": city, "appid": WEATHER_API_KEY, "units": "metric"},
                timeout=10.0,
            )

            logger.info(f"OpenWeather API Response Status: {response.status_code}")

            if response.status_code == 404:
                raise HTTPException(status_code=404, detail=f"City '{city}' not found")

            response.raise_for_status()
            return response.json()

    except httpx.TimeoutException:
        logger.error("Request to OpenWeather API timed out")
        raise HTTPException(status_code=504, detail="Weather service timeout")
    except httpx.HTTPError as e:
        logger.error(f"HTTP error occurred: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error fetching weather data: {str(e)}"
        )
