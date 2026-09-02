from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_current_weather():
    response = client.get("/api/v1/weather/current?lat=19.2183&lon=72.9781")
    assert response.status_code == 200
    data = response.json()
    assert "ambient_temp_celsius" in data
    assert "heat_index_celsius" in data
    assert "risk_category" in data

def test_query_point_lst():
    response = client.get("/api/v1/earth-engine/query-point?lat=19.2183&lon=72.9781")
    assert response.status_code == 200
    data = response.json()
    assert "lst_celsius" in data
    assert "ndvi_index" in data
    assert "vegetation_density" in data

def test_grid_ranks():
    response = client.get("/api/v1/earth-engine/grid-ranks?count=25")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 25
    assert data[0]["heat_rank"] == 1

def test_export_geojson():
    response = client.get("/api/v1/earth-engine/export?format=geojson&count=16")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) == 16

def test_export_csv():
    response = client.get("/api/v1/earth-engine/export?format=csv&count=16")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert "rank,id,neighborhood" in response.text

def test_historical_trends():
    response = client.get("/api/v1/earth-engine/historical")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5
    assert "summer_max" in data[0]
