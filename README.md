# SLAVIK VPN Bot

Telegram-бот для продажи доступа к VPN через YooKassa / Telegram Payments и выдачи личных WireGuard / AmneziaWG конфигов.

Сайт не используется. Основной продукт — Telegram-бот.

## Что уже есть

- меню бота;
- тарифы: 149 ₽, 199 ₽, 499 ₽;
- оплата через Telegram Payments с YooKassa provider token;
- SQLite-база пользователей и оплат;
- продление подписки после успешной оплаты;
- ручная активация подписки админом;
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
BOT_USERNAME=slavik_vpn_bot
DB_PATH=data/slavik.db
CONFIGS_DIR=configs
CURRENCY=RUB
```

## Команды пользователя

```text
/start   главное меню
/menu    главное меню
/id      узнать свой Telegram ID
```

## Админ-команды

Работают только для ID из `ADMIN_IDS`.

```text
/users
```

Показать последних пользователей.

```text
/activate telegram_id days
```

Активировать или продлить подписку вручную.

Пример:

```text
/activate 123456789 30
```

```text
/deactivate telegram_id
```

Отключить подписку вручную.

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
Получить VPN
```

и бот отправляет ему:

- файл `slavik.conf`;
- QR-код для WireGuard / AmneziaVPN.

## Важно

Не добавляй `.env`, реальные токены и личные конфиги в публичный GitHub.
