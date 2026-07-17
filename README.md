# Korda VPN Bot

Telegram-бот для продажи доступа к VPN через YooKassa/Telegram Payments и выдачи личных WireGuard/AmneziaWG конфигов.

## Что уже есть

- меню бота;
- тарифы: 149 ₽, 199 ₽, 499 ₽;
- оплата через Telegram Payments с YooKassa provider token;
- SQLite-база пользователей и оплат;
- продление подписки после успешной оплаты;
- выдача `.conf` файла;
- генерация QR-кода из конфига;
- инструкции для iPhone и Android;
- уведомление админу после оплаты.

## Структура

```text
bot/main.py          основной код бота
requirements.txt     зависимости
.env.example         пример переменных окружения
configs/             сюда кладутся личные VPN-конфиги
data/                SQLite-база
```

## Как запустить на сервере

```bash
git clone https://github.com/TopSteam53/Mir-vpn.git
cd Mir-vpn
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
nano .env
python bot/main.py
```

## Что заполнить в `.env`

```text
BOT_TOKEN=токен от BotFather
PAYMENT_PROVIDER_TOKEN=платежный токен YooKassa из BotFather -> Payments
ADMIN_IDS=твой Telegram ID
SUPPORT_USERNAME=юзернейм поддержки без @
BOT_USERNAME=юзернейм бота без @
```

## Как работает выдача конфига

После оплаты бот активирует подписку, но сам VPN-конфиг пока не создаёт автоматически.

Админ должен создать личный конфиг на VPN-сервере и положить файл в папку:

```text
configs/<telegram_id>.conf
```

Например:

```text
configs/123456789.conf
```

После этого пользователь нажимает в боте:

```text
Получить конфиг
```

и бот отправляет ему:

- файл `korda.conf`;
- QR-код для WireGuard / AmneziaVPN.

## Важно

Не добавляй `.env`, реальные токены и личные конфиги в публичный GitHub.

