from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_has_all_five_models_and_64_districts():
    response = client.get('/health')
    assert response.status_code == 200
    body = response.json()
    assert body['status'] == 'healthy'
    assert len(body['loaded_models']) == 5
    assert body['district_count'] == 64
    assert body['dataset_rows'] == 12800


def test_all_crop_models_predict_from_historical_baseline():
    for crop in ['Aman', 'Aus', 'Boro', 'Jute', 'Potato']:
        baseline = client.get('/api/yield/baseline', params={'crop': crop, 'district': 'Gazipur'})
        assert baseline.status_code == 200
        payload = {
            'crop': crop,
            'district': 'Gazipur',
            'year': 2027,
            **baseline.json()['climate'],
        }
        prediction = client.post('/api/yield/predict', json=payload)
        assert prediction.status_code == 200
        body = prediction.json()
        assert body['model_name'] == 'XGBoost Regressor'
        assert body['predicted_yield'] > 0
        assert body['yield_unit'] == ('bales/acre' if crop == 'Jute' else 't/acre')
        assert body['benchmark']['test_rows'] == 512


def test_unknown_district_is_rejected():
    response = client.get('/api/yield/baseline', params={'crop': 'Boro', 'district': 'Atlantis'})
    assert response.status_code == 404


def test_prediction_includes_real_rf_xgboost_comparison():
    baseline = client.get('/api/yield/baseline', params={'crop': 'Boro', 'district': 'Gazipur'}).json()
    response = client.post('/api/yield/predict', json={
        'crop': 'Boro', 'district': 'Gazipur', 'year': 2027, **baseline['climate']
    })
    body = response.json()
    assert {item['model'] for item in body['model_comparison']} == {'Random Forest', 'XGBoost'}
    rf = next(item for item in body['model_comparison'] if item['model'] == 'Random Forest')
    xgb_row = next(item for item in body['model_comparison'] if item['model'] == 'XGBoost')
    assert xgb_row['rmse'] < rf['rmse']
