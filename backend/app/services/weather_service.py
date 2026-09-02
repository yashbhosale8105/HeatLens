import requests
import math
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class WeatherService:
    @staticmethod
    def calculate_noaa_heat_index(temp_celsius: float, humidity_pct: float) -> float:
        """
        Calculates the official NOAA Heat Index formula given temperature in °C and relative humidity %.
        """
        T = (temp_celsius * 9/5) + 32  # Convert to Fahrenheit
        RH = humidity_pct

        # Simple formula first
        HI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (RH * 0.094))

        if HI >= 80:
            # Rothfusz regression equation
            HI = (-42.379 + 
                  2.04901523 * T + 
                  10.14333127 * RH - 
                  0.22475541 * T * RH - 
                  0.00683783 * T * T - 
                  0.05481717 * RH * RH + 
                  0.00122874 * T * T * RH + 
                  0.00085282 * T * RH * RH - 
                  0.00000199 * T * T * RH * RH)

            # Adjustments
            if RH < 13 and 80 <= T <= 112:
                adjustment = ((13 - RH) / 4) * math.sqrt((17 - abs(T - 95.0)) / 17)
                HI -= adjustment
            elif RH > 85 and 80 <= T <= 87:
                adjustment = ((RH - 85) / 10) * ((87 - T) / 5)
                HI += adjustment

        # Convert back to Celsius
        hi_celsius = (HI - 32) * 5/9
        return round(hi_celsius, 2)

    @staticmethod
    def classify_risk_category(heat_index_celsius: float) -> Dict[str, str]:
        """
        Classifies heat risk category according to NOAA guidelines.
        """
        if heat_index_celsius >= 54:
            return {"level": "Extreme Danger", "color": "#7F0000", "advice": "Heat stroke highly likely with continued exposure."}
        elif heat_index_celsius >= 41:
            return {"level": "Danger", "color": "#D32F2F", "advice": "Heat cramps or heat exhaustion likely. Avoid outdoor activity."}
        elif heat_index_celsius >= 32:
            return {"level": "Extreme Caution", "color": "#F57C00", "advice": "Heat cramps and heat exhaustion possible with prolonged activity."}
        elif heat_index_celsius >= 27:
            return {"level": "Caution", "color": "#FBC02D", "advice": "Fatigue possible with prolonged exposure and activity."}
        else:
            return {"level": "Normal", "color": "#388E3C", "advice": "Comfortable environmental conditions."}

    @classmethod
    def get_current_weather(cls, lat: float = 19.2183, lon: float = 72.9781) -> Dict[str, Any]:
        """
        Fetches current weather parameters from Open-Meteo API with fallback resilience.
        """
        try:
            url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,uv_index"
            resp = requests.get(url, timeout=3)
            if resp.status_code == 200:
                data = resp.json().get("current", {})
                temp = data.get("temperature_2m", 33.5)
                humidity = data.get("relative_humidity_2m", 68.0)
                wind = data.get("wind_speed_10m", 12.4)
                uv = data.get("uv_index", 8.5)
            else:
                temp, humidity, wind, uv = 33.5, 68.0, 12.4, 8.5
        except Exception as e:
            logger.warning(f"Open-Meteo API fallback activated: {e}")
            temp, humidity, wind, uv = 33.5, 68.0, 12.4, 8.5

        heat_index = cls.calculate_noaa_heat_index(temp, humidity)
        risk = cls.classify_risk_category(heat_index)

        return {
            "ambient_temp_celsius": round(temp, 1),
            "relative_humidity": round(humidity, 1),
            "wind_speed_kmh": round(wind, 1),
            "uv_index": round(uv, 1),
            "heat_index_celsius": heat_index,
            "risk_category": risk["level"],
            "risk_color": risk["color"],
            "advisory": risk["advice"],
            "location_name": "Thane City, Maharashtra"
        }
