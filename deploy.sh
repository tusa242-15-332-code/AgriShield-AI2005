#!/bin/bash
set -e

echo "[1/5] Pulling latest code from origin/main..."
cd /var/www/maxshield
git config --global --add safe.directory /var/www/maxshield
git fetch origin main
git reset --hard FETCH_HEAD

echo "[2/5] Updating Python backend dependencies..."
/var/www/maxshield/backend/.venv/bin/pip install -q -r /var/www/maxshield/backend/requirements.txt

echo "[3/5] Restarting FastAPI backend service..."
systemctl restart maxshield-backend

echo "[4/5] Building React production frontend..."
cd /var/www/maxshield/frontend
echo 'VITE_API_BASE_URL=' > /var/www/maxshield/frontend/.env
npm install --silent
npm run build

echo "[5/5] Reloading Nginx and Verifying Health..."
systemctl reload nginx
sleep 2

# Verify backend health directly and via Nginx SSL
curl -f -s http://127.0.0.1:8000/health >/dev/null || { echo 'Backend port 8000 health check failed!'; exit 1; }
curl -f -s -k -H 'Host: agrishield.solocraftstudios.tech' https://127.0.0.1/health >/dev/null || { echo 'Nginx SSL proxy health check failed!'; exit 1; }

echo "✅ Deployment successfully completed!"
