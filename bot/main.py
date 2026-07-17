import asyncio
import os
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

import aiosqlite
import qrcode
from aiogram import Bot, Dispatcher, F
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import Command, CommandStart
from aiogram.types import (
    CallbackQuery,
    FSInputFile,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    LabeledPrice,
    Message,
    PreCheckoutQuery,
)
from dotenv import load_dotenv

load_dotenv()

BRAND_NAME = "SLAVIK VPN"
CONFIG_FILENAME = "slavik.conf"

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
PAYMENT_PROVIDER_TOKEN = os.getenv("PAYMENT_PROVIDER_TOKEN", "")
CURRENCY = os.getenv("CURRENCY", "RUB")
DB_PATH = Path(os.getenv("DB_PATH", "data/slavik.db"))
CONFIGS_DIR = Path(os.getenv("CONFIGS_DIR", "configs"))
SUPPORT_USERNAME = os.getenv("SUPPORT_USERNAME", "")
BOT_USERNAME = os.getenv("BOT_USERNAME", "")
ADMIN_IDS = {
    int(x.strip())
    for x in os.getenv("ADMIN_IDS", "").split(",")
    if x.strip().isdigit()
}

PLANS = {
    "early_30": {
        "title": "SLAVIK VPN — ранний доступ",
        "description": "30 дней доступа. Первые 3 месяца по 149 ₽, затем 199 ₽.",
        "price_kop": 14900,
        "days": 30,
    },
    "standard_30": {
        "title": "SLAVIK VPN — 1 месяц",
        "description": "30 дней доступа к VPN.",
        "price_kop": 19900,
        "days": 30,
    },
    "standard_90": {
        "title": "SLAVIK VPN — 3 месяца",
        "description": "90 дней доступа к VPN.",
        "price_kop": 49900,
        "days": 90,
    },
}


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def fmt_date(value: str | None) -> str:
    if not value:
        return "нет активной подписки"
    try:
        dt = datetime.fromisoformat(value)
        return dt.strftime("%d.%m.%Y")
    except ValueError:
        return value


def is_active_until(value: str | None) -> bool:
    if not value:
        return False
    try:
        return datetime.fromisoformat(value) > utc_now()
    except ValueError:
        return False


def is_admin(user_id: int | None) -> bool:
    return bool(user_id and user_id in ADMIN_IDS)


async def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    CONFIGS_DIR.mkdir(parents=True, exist_ok=True)

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                telegram_id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                created_at TEXT NOT NULL,
                subscription_until TEXT,
                plan_code TEXT,
                is_blocked INTEGER NOT NULL DEFAULT 0
            )
            """
        )
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                telegram_id INTEGER NOT NULL,
                plan_code TEXT NOT NULL,
                amount_kop INTEGER NOT NULL,
                currency TEXT NOT NULL,
                payload TEXT NOT NULL,
                telegram_payment_charge_id TEXT,
                provider_payment_charge_id TEXT,
                created_at TEXT NOT NULL
            )
            """
        )
        await db.commit()


async def upsert_user(message: Message) -> None:
    user = message.from_user
    if not user:
        return

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO users (telegram_id, username, first_name, created_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(telegram_id) DO UPDATE SET
                username=excluded.username,
                first_name=excluded.first_name
            """,
            (user.id, user.username, user.first_name, utc_now().isoformat()),
        )
        await db.commit()


async def ensure_user(telegram_id: int) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT OR IGNORE INTO users (telegram_id, username, first_name, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (telegram_id, None, None, utc_now().isoformat()),
        )
        await db.commit()


async def get_user(telegram_id: int) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM users WHERE telegram_id = ?",
            (telegram_id,),
        ) as cursor:
            row = await cursor.fetchone()
        return dict(row) if row else None


async def get_recent_users(limit: int = 20) -> list[dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            """
            SELECT telegram_id, username, first_name, subscription_until, plan_code, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,),
        ) as cursor:
            rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def activate_subscription(telegram_id: int, plan_code: str) -> str:
    plan = PLANS[plan_code]
    await ensure_user(telegram_id)
    user = await get_user(telegram_id)

    current_until = None
    if user and user.get("subscription_until"):
        try:
            current_until = datetime.fromisoformat(user["subscription_until"])
        except ValueError:
            current_until = None

    start = current_until if current_until and current_until > utc_now() else utc_now()
    new_until = start + timedelta(days=plan["days"])

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            UPDATE users
            SET subscription_until = ?, plan_code = ?
            WHERE telegram_id = ?
            """,
            (new_until.isoformat(), plan_code, telegram_id),
        )
        await db.commit()

    return new_until.isoformat()


async def activate_custom_days(telegram_id: int, days: int, plan_code: str = "manual") -> str:
    await ensure_user(telegram_id)
    user = await get_user(telegram_id)

    current_until = None
    if user and user.get("subscription_until"):
        try:
            current_until = datetime.fromisoformat(user["subscription_until"])
        except ValueError:
            current_until = None

    start = current_until if current_until and current_until > utc_now() else utc_now()
    new_until = start + timedelta(days=days)

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            UPDATE users
            SET subscription_until = ?, plan_code = ?
            WHERE telegram_id = ?
            """,
            (new_until.isoformat(), plan_code, telegram_id),
        )
        await db.commit()

    return new_until.isoformat()


async def deactivate_user(telegram_id: int) -> None:
    await ensure_user(telegram_id)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            UPDATE users
            SET subscription_until = NULL, plan_code = NULL
            WHERE telegram_id = ?
            """,
            (telegram_id,),
        )
        await db.commit()


def main_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🔐 Получить VPN", callback_data="get_config")],
            [InlineKeyboardButton(text="💳 Купить доступ", callback_data="plans")],
            [InlineKeyboardButton(text="👤 Моя подписка", callback_data="profile")],
            [InlineKeyboardButton(text="📲 Инструкция", callback_data="instructions")],
            [InlineKeyboardButton(text="🧑‍🔧 Помощь Славика", callback_data="support")],
        ]
    )


def plans_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="149 ₽ / 30 дней — ранний доступ", callback_data="buy:early_30")],
            [InlineKeyboardButton(text="199 ₽ / 30 дней", callback_data="buy:standard_30")],
            [InlineKeyboardButton(text="499 ₽ / 90 дней", callback_data="buy:standard_90")],
            [InlineKeyboardButton(text="← Назад", callback_data="home")],
        ]
    )


def config_actions() -> InlineKeyboardMarkup:
    rows = [
        [InlineKeyboardButton(text="📲 Инструкция iPhone", callback_data="ios_guide")],
        [InlineKeyboardButton(text="🤖 Инструкция Android", callback_data="android_guide")],
    ]
    if SUPPORT_USERNAME:
        rows.append([InlineKeyboardButton(text="🧑‍🔧 Написать Славику", url=f"https://t.me/{SUPPORT_USERNAME}")])
    rows.append([InlineKeyboardButton(text="← Главное меню", callback_data="home")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


async def send_home(message: Message) -> None:
    await upsert_user(message)
    text = (
        "<b>SLAVIK VPN</b> 😎\n\n"
        "Славик подключит VPN через личный конфиг.\n"
        "Оплата, подписка и инструкция — прямо в этом боте."
    )
    await message.answer(text, reply_markup=main_menu())


async def send_profile(chat_id: int, bot: Bot, telegram_id: int) -> None:
    user = await get_user(telegram_id)
    active = is_active_until(user.get("subscription_until") if user else None)
    status = "активна ✅" if active else "не активна ❌"
    until = fmt_date(user.get("subscription_until") if user else None)
    text = (
        "<b>Моя подписка</b>\n\n"
        f"Статус: <b>{status}</b>\n"
        f"Действует до: <b>{until}</b>\n"
        "Устройств: <b>до 3</b>"
    )
    await bot.send_message(chat_id, text, reply_markup=main_menu())


async def send_instructions(chat_id: int, bot: Bot) -> None:
    text = (
        "<b>Как подключиться</b>\n\n"
        "<b>iPhone</b>\n"
        "1. Установи WireGuard или AmneziaVPN.\n"
        "2. Нажми «Получить VPN» в боте.\n"
        "3. Отсканируй QR-код или импортируй файл.\n"
        "4. Разреши добавить VPN и включи тумблер.\n\n"
        "<b>Android</b>\n"
        "1. Установи WireGuard или AmneziaVPN.\n"
        "2. Скачай файл из бота.\n"
        "3. Импортируй конфиг.\n"
        "4. Включи VPN.\n\n"
        "QR и файл нужны один раз. Потом VPN включается обычным тумблером."
    )
    await bot.send_message(chat_id, text, reply_markup=main_menu())


async def send_support(chat_id: int, bot: Bot) -> None:
    if SUPPORT_USERNAME:
        await bot.send_message(
            chat_id,
            "Славик на связи 🧑‍🔧",
            reply_markup=InlineKeyboardMarkup(
                inline_keyboard=[[InlineKeyboardButton(text="Написать в поддержку", url=f"https://t.me/{SUPPORT_USERNAME}")]]
            ),
        )
    else:
        await bot.send_message(chat_id, "Поддержка пока не указана в .env", reply_markup=main_menu())


async def send_user_config(chat_id: int, bot: Bot, telegram_id: int) -> None:
    user = await get_user(telegram_id)
    if not user or not is_active_until(user.get("subscription_until")):
        await bot.send_message(
            chat_id,
            "Сначала нужно купить или активировать подписку.",
            reply_markup=plans_menu(),
        )
        return

    conf_path = CONFIGS_DIR / f"{telegram_id}.conf"
    if not conf_path.exists():
        await bot.send_message(
            chat_id,
            "Подписка активна, но личный конфиг ещё не создан.\n\n"
            "Славику нужно положить файл на сервере сюда:\n"
            f"<code>{conf_path}</code>",
            reply_markup=config_actions(),
        )
        return

    conf_text = conf_path.read_text(encoding="utf-8")
    qr_path = Path("/tmp") / f"slavik_{telegram_id}.png"
    qrcode.make(conf_text).save(qr_path)

    await bot.send_document(
        chat_id,
        FSInputFile(conf_path, filename=CONFIG_FILENAME),
        caption="Файл конфигурации SLAVIK VPN",
    )
    await bot.send_photo(
        chat_id,
        FSInputFile(qr_path),
        caption="QR-код для WireGuard / AmneziaVPN",
        reply_markup=config_actions(),
    )


async def send_invoice(callback: CallbackQuery, plan_code: str) -> None:
    if not callback.message or not callback.from_user:
        return
    if not PAYMENT_PROVIDER_TOKEN:
        await callback.message.answer("PAYMENT_PROVIDER_TOKEN не указан в .env")
        return

    plan = PLANS[plan_code]
    payload = f"slavik:{callback.from_user.id}:{plan_code}:{uuid.uuid4().hex}"
    prices = [LabeledPrice(label=plan["title"], amount=plan["price_kop"])]

    await callback.message.answer_invoice(
        title=plan["title"],
        description=plan["description"],
        payload=payload,
        provider_token=PAYMENT_PROVIDER_TOKEN,
        currency=CURRENCY,
        prices=prices,
        start_parameter=f"slavik-{plan_code}",
    )


async def notify_admins(bot: Bot, text: str) -> None:
    for admin_id in ADMIN_IDS:
        try:
            await bot.send_message(admin_id, text)
        except Exception:
            pass


async def main() -> None:
    if not BOT_TOKEN:
        raise RuntimeError("BOT_TOKEN is missing. Fill .env first.")

    await init_db()

    bot = Bot(
        BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = Dispatcher()

    @dp.message(CommandStart())
    async def on_start(message: Message) -> None:
        await send_home(message)

    @dp.message(Command("menu"))
    async def on_menu(message: Message) -> None:
        await send_home(message)

    @dp.message(Command("id"))
    async def on_id(message: Message) -> None:
        if message.from_user:
            await message.answer(f"Твой Telegram ID: <code>{message.from_user.id}</code>")

    @dp.message(Command("activate"))
    async def on_activate(message: Message) -> None:
        if not is_admin(message.from_user.id if message.from_user else None):
            return

        parts = (message.text or "").split()
        if len(parts) < 3 or not parts[1].isdigit() or not parts[2].isdigit():
            await message.answer("Формат: <code>/activate telegram_id days</code>")
            return

        telegram_id = int(parts[1])
        days = int(parts[2])
        until = await activate_custom_days(telegram_id, days)
        await message.answer(f"Готово ✅\nUser ID: <code>{telegram_id}</code>\nДо: <b>{fmt_date(until)}</b>")

    @dp.message(Command("deactivate"))
    async def on_deactivate(message: Message) -> None:
        if not is_admin(message.from_user.id if message.from_user else None):
            return

        parts = (message.text or "").split()
        if len(parts) < 2 or not parts[1].isdigit():
            await message.answer("Формат: <code>/deactivate telegram_id</code>")
            return

        telegram_id = int(parts[1])
        await deactivate_user(telegram_id)
        await message.answer(f"Подписка отключена ✅\nUser ID: <code>{telegram_id}</code>")

    @dp.message(Command("users"))
    async def on_users(message: Message) -> None:
        if not is_admin(message.from_user.id if message.from_user else None):
            return

        users = await get_recent_users(20)
        if not users:
            await message.answer("Пользователей пока нет.")
            return

        lines = ["<b>Последние пользователи</b>\n"]
        for user in users:
            username = f"@{user['username']}" if user.get("username") else "без username"
            active = "✅" if is_active_until(user.get("subscription_until")) else "❌"
            lines.append(
                f"{active} <code>{user['telegram_id']}</code> — {username} — до {fmt_date(user.get('subscription_until'))}"
            )
        await message.answer("\n".join(lines))

    @dp.callback_query(F.data == "home")
    async def on_home(callback: CallbackQuery) -> None:
        await callback.answer()
        if callback.message:
            await callback.message.answer("Главное меню", reply_markup=main_menu())

    @dp.callback_query(F.data == "plans")
    async def on_plans(callback: CallbackQuery) -> None:
        await callback.answer()
        if callback.message:
            await callback.message.answer("Выбери тариф:", reply_markup=plans_menu())

    @dp.callback_query(F.data.startswith("buy:"))
    async def on_buy(callback: CallbackQuery) -> None:
        await callback.answer()
        plan_code = callback.data.split(":", 1)[1]
        if plan_code not in PLANS:
            if callback.message:
                await callback.message.answer("Такого тарифа нет.")
            return
        await send_invoice(callback, plan_code)

    @dp.callback_query(F.data == "profile")
    async def on_profile(callback: CallbackQuery) -> None:
        await callback.answer()
        if callback.message and callback.from_user:
            await send_profile(callback.message.chat.id, bot, callback.from_user.id)

    @dp.callback_query(F.data == "get_config")
    async def on_get_config(callback: CallbackQuery) -> None:
        await callback.answer()
        if callback.message and callback.from_user:
            await send_user_config(callback.message.chat.id, bot, callback.from_user.id)

    @dp.callback_query(F.data == "instructions")
    async def on_instructions(callback: CallbackQuery) -> None:
        await callback.answer()
        if callback.message:
            await send_instructions(callback.message.chat.id, bot)

    @dp.callback_query(F.data == "ios_guide")
    async def on_ios(callback: CallbackQuery) -> None:
        await callback.answer()
        if callback.message:
            await callback.message.answer(
                "<b>iPhone</b>\n\n"
                "Установи WireGuard или AmneziaVPN → нажми «+» → «Создать из QR-кода» "
                f"или импортируй файл <code>{CONFIG_FILENAME}</code>. После этого конфиг сохранится, "
                "и сканировать QR каждый раз не нужно.",
                reply_markup=main_menu(),
            )

    @dp.callback_query(F.data == "android_guide")
    async def on_android(callback: CallbackQuery) -> None:
        await callback.answer()
        if callback.message:
            await callback.message.answer(
                "<b>Android</b>\n\n"
                f"Установи WireGuard или AmneziaVPN → импортируй файл <code>{CONFIG_FILENAME}</code> "
                "или отсканируй QR. Потом VPN включается обычным тумблером в приложении.",
                reply_markup=main_menu(),
            )

    @dp.callback_query(F.data == "support")
    async def on_support(callback: CallbackQuery) -> None:
        await callback.answer()
        if callback.message:
            await send_support(callback.message.chat.id, bot)

    @dp.pre_checkout_query()
    async def on_pre_checkout(pre_checkout_query: PreCheckoutQuery) -> None:
        payload = pre_checkout_query.invoice_payload
        parts = payload.split(":")
        if len(parts) < 4 or parts[0] != "slavik" or parts[2] not in PLANS:
            await pre_checkout_query.answer(ok=False, error_message="Некорректный платеж.")
            return
        await pre_checkout_query.answer(ok=True)

    @dp.message(F.successful_payment)
    async def on_successful_payment(message: Message) -> None:
        if not message.from_user or not message.successful_payment:
            return

        payment = message.successful_payment
        parts = payment.invoice_payload.split(":")
        plan_code = parts[2]
        plan = PLANS[plan_code]
        until = await activate_subscription(message.from_user.id, plan_code)

        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(
                """
                INSERT INTO payments (
                    telegram_id, plan_code, amount_kop, currency, payload,
                    telegram_payment_charge_id, provider_payment_charge_id, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    message.from_user.id,
                    plan_code,
                    payment.total_amount,
                    payment.currency,
                    payment.invoice_payload,
                    payment.telegram_payment_charge_id,
                    payment.provider_payment_charge_id,
                    utc_now().isoformat(),
                ),
            )
            await db.commit()

        await message.answer(
            "Оплата прошла ✅\n\n"
            f"Тариф: <b>{plan['title']}</b>\n"
            f"Подписка до: <b>{fmt_date(until)}</b>\n\n"
            "Теперь можно получить VPN.",
            reply_markup=main_menu(),
        )

        username = f"@{message.from_user.username}" if message.from_user.username else "без username"
        await notify_admins(
            bot,
            "Новая оплата SLAVIK VPN ✅\n"
            f"User ID: {message.from_user.id}\n"
            f"Username: {username}\n"
            f"Тариф: {plan_code}\n"
            f"Сумма: {payment.total_amount / 100:.2f} {payment.currency}\n"
            f"Создай конфиг: {CONFIGS_DIR}/{message.from_user.id}.conf",
        )

    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
