#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/root/Mir-vpn"
SERVICE_NAME="slavik-vpn-bot"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run this script as root."
  exit 1
fi

cd "$APP_DIR"

apt-get update
apt-get install -y python3 python3-venv python3-pip git

python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

mkdir -p data configs

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
  echo "Edit it with: nano $APP_DIR/.env"
else
  echo ".env already exists, skipping copy"
fi

cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=SLAVIK VPN Telegram Bot
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=$APP_DIR
EnvironmentFile=$APP_DIR/.env
ExecStart=$APP_DIR/venv/bin/python $APP_DIR/bot/main.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable "$SERVICE_NAME"

echo "Setup complete."
echo "1) Edit secrets: nano $APP_DIR/.env"
echo "2) Start bot: systemctl start $SERVICE_NAME"
echo "3) Logs: journalctl -u $SERVICE_NAME -f"
