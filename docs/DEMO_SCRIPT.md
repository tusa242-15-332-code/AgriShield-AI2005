# Judge Demo Script (5–7 minutes)

## 1. Introduce the problem (30–45 seconds)

AgriShield AI is a Bangladesh-focused agriculture decision-support prototype. It brings farm planning, climate-risk guidance, crop health support, irrigation guidance, traceability and market exchange into one interface.

## 2. Show the role-based UI (45 seconds)

Switch between Farmer, Consumer and Admin workspaces. Explain that the current role switcher is a prototype demonstration control, not production authentication.

## 3. Show the trained ML module (2–3 minutes)

1. Open **AI Yield Prediction**.
2. Select Boro and Gazipur.
3. Point out the historical CRU TS crop-season climate baseline and explain that it is editable, not a live forecast.
4. Run the prediction.
5. Show the XGBoost output, units, MAE, RMSE and R².
6. Change to Jute and show that the unit changes to bales/acre.
7. Change to Aus and explain the negative R² transparently. This demonstrates that the team reports model weaknesses rather than hiding them.

## 4. Prove it is a backend model call (30 seconds)

Open `/health` or `/docs` in another tab. Show the five loaded model names, the 64 districts and the API prediction endpoint. The UI result is returned by the API, not a static frontend constant.

## 5. Show the wider platform (1–2 minutes)

Briefly demonstrate the planner, climate-risk panel, disease scanner, AgriBot, irrigation, marketplace and traceability. Be explicit that these are prototype modules with sample records or rule-based/demo behaviour where applicable. Do not describe them as live services unless they have been separately configured and verified.

## Suggested technical explanation

"We trained separate Random Forest and XGBoost regressors for five crops. We used a chronological split, training on 1984–2015 and evaluating on 2016–2023. Each model uses year, district and six CRU TS crop-season climate variables. We selected the lower-RMSE model for each crop. The live demo routes to the selected XGBoost pipeline and shows the actual held-out benchmark metrics alongside the prediction."
