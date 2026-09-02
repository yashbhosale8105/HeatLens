from app.services.weather_service import WeatherService

def test_noaa_heat_index_calculation():
    # Standard 30°C and 70% humidity
    hi = WeatherService.calculate_noaa_heat_index(30.0, 70.0)
    assert isinstance(hi, float)
    assert hi > 30.0

def test_risk_category_classification():
    cat_normal = WeatherService.classify_risk_category(25.0)
    assert cat_normal["level"] == "Normal"

    cat_danger = WeatherService.classify_risk_category(42.0)
    assert cat_danger["level"] == "Danger"

    cat_extreme_danger = WeatherService.classify_risk_category(55.0)
    assert cat_extreme_danger["level"] == "Extreme Danger"

def test_weather_service_fallback():
    weather = WeatherService.get_current_weather(19.2183, 72.9781)
    assert "ambient_temp_celsius" in weather
    assert "heat_index_celsius" in weather
    assert "risk_category" in weather
