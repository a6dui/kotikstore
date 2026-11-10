import asyncio
import logging
import os
import sys
from datetime import datetime

# Windows Console UTF-8 compatibility fix
if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
from aiohttp import web
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

from aiogram import Bot, Dispatcher, F, types
from aiogram.enums import ParseMode
from aiogram.filters import Command, CommandStart
from aiogram.types import (
    FSInputFile,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    MenuButtonWebApp,
    ReplyKeyboardMarkup,
    WebAppInfo,
)

import database as db
import payments

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("KotikStoreBot")

# Production WebApp URL
WEBAPP_URL = os.environ.get("WEBAPP_URL", "https://a6dui.github.io/kotikstore/").strip()

# Path to mascot and avatars
MASCOT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "kotik-hero.jpg")
BOT_AVATAR_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "bot-avatar.jpg")
CHANNEL_AVATAR_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "channel-avatar.jpg")

dp = Dispatcher()
bot_instance: Bot = None


# =====================================================================
# ADMIN NOTIFICATIONS SYSTEM (СМС/Оповещения в Telegram боте)
# =====================================================================
async def notify_all_admins(bot: Bot, message_html: str):
    """
    Sends an immediate HTML formatted notification to all registered staff & owner.
    """
    admins = db.get_all_admins()
    admin_ids = {a["telegram_id"] for a in admins}
    admin_ids.add(db.OWNER_TELEGRAM_ID)

    for admin_id in admin_ids:
        try:
            await bot.send_message(
                chat_id=admin_id,
                text=message_html,
                parse_mode=ParseMode.HTML,
            )
        except Exception as e:
            logger.warning(f"Could not send notification to admin {admin_id}: {e}")


async def notify_deposit(
    bot: Bot,
    user_id: int,
    username: str,
    amount: float,
    gateway: str,
    invoice_id: str,
    x2_active: bool = False,
):
    """
    Formats and broadcasts balance top-up alert to admins.
    """
    user_str = f"@{username.lstrip('@')}" if username else f"ID <code>{user_id}</code>"
    x2_badge = "\n🔥 <b>Применена акция X2 (удвоение на баланс!)</b>" if x2_active else ""
    gw_name = str(gateway).upper()

    now_str = datetime.now().strftime("%d.%m.%Y %H:%M:%S")
    msg = (
        f"💳 <b>[НОВОЕ ПОПОЛНЕНИЕ БАЛАНСА]</b>\n\n"
        f"👤 <b>Пользователь:</b> {user_str} (<code>{user_id}</code>)\n"
        f"💵 <b>Сумма платежа:</b> <code>+${amount:.2f}</code>{x2_badge}\n"
        f"⚡ <b>Платежный шлюз:</b> <b>{gw_name}</b>\n"
        f"🆔 <b>Номер инвойса:</b> <code>{invoice_id}</code>\n"
        f"🕒 <b>Время транзакции:</b> {now_str}\n\n"
        f"✅ <i>Баланс пользователя автоматически зачислен в базе.</i>"
    )
    await notify_all_admins(bot, msg)


async def notify_purchase(
    bot: Bot,
    user_id: int,
    username: str,
    product_title: str,
    price: float,
    order_id: str,
    item_content: str = "",
):
    """
    Formats and broadcasts instant order purchase alert to admins.
    """
    user_str = f"@{username.lstrip('@')}" if username else f"ID <code>{user_id}</code>"
    now_str = datetime.now().strftime("%d.%m.%Y %H:%M:%S")

    content_preview = item_content if item_content else "Личное подключение на аккаунт клиента"

    msg = (
        f"🛒 <b>[НОВАЯ ПОКУПКА В МАГАЗИНЕ]</b>\n\n"
        f"👤 <b>Покупатель:</b> {user_str} (<code>{user_id}</code>)\n"
        f"📦 <b>Товар:</b> <b>{product_title}</b>\n"
        f"💵 <b>Сумма заказа:</b> <b>${price:.2f}</b>\n"
        f"🆔 <b>Номер заказа:</b> <code>#{order_id}</code>\n"
        f"🕒 <b>Время покупки:</b> {now_str}\n\n"
        f"🔑 <b>Выданный товар / Логин:Пароль:</b>\n"
        f"<code>{content_preview}</code>\n\n"
        f"⚡ <i>Товар выдан моментально из склада.</i>"
    )
    await notify_all_admins(bot, msg)


# Channel Subscription Configuration
CHANNEL_USERNAME = "@KotikNews_shop"
CHANNEL_URL = "https://t.me/KotikNews_shop"


async def is_subscribed_to_channel(bot: Bot, user_id: int) -> bool:
    """Checks if user is subscribed to @KotikNews_shop (Owners/staff always pass)."""
    if user_id == db.OWNER_TELEGRAM_ID or db.is_staff(user_id):
        return True
    try:
        member = await bot.get_chat_member(chat_id=CHANNEL_USERNAME, user_id=user_id)
        return member.status in ("member", "administrator", "creator", "restricted")
    except Exception as e:
        logger.warning(f"Subscription check warning for {user_id} (bot might not be admin in channel): {e}")
        # If bot is not an admin in the channel yet, allow access to prevent locking users out
        return True


# --- Texts & Keyboards (Multilingual RU / EN) ---
def resolve_display_name(first_name: str | None, username: str | None, lang: str = "ru") -> str:
    """
    Returns user's real Telegram display name (e.g. 'Дима'), falling back to @username if no name is set.
    """
    clean_name = (first_name or "").strip()
    if clean_name and clean_name not in ("Котик-Друг", "None", ""):
        return clean_name
    if username and username.strip():
        return f"@{username.strip()}"
    return "Kotik Friend" if lang == "en" else "Котик-Друг"


def get_welcome_text(user_nick: str, lang: str = "ru") -> str:
    if lang == "en":
        return (
            f"- Hello, {user_nick}! ⭐\n\n"
            "- Welcome to <b>Kotik Store</b>!\n\n"
            "- The ultimate guide to subscriptions for any digital service!\n\n"
            "✨ <b>Available AI subscriptions with instant delivery:</b>\n"
            "• 🤖 <b>ChatGPT Plus</b> (o1, GPT-4o, Canvas, DALL-E)\n"
            "• ✨ <b>Gemini Advanced</b> (2M context, 2TB Google One)\n"
            "• 💻 <b>Claude 3.7 Sonnet Pro</b> (#1 model for code)\n"
            "• 🚀 <b>Grok AI</b> (X Premium+, uncensored, FLUX)\n"
            "• 🎙 <b>ElevenLabs Pro</b> (Realistic voice cloning)\n"
            "• 🎬 <b>CapCut Pro</b> (PRO effects & 4K render)\n\n"
            "💳 <b>Payment Methods:</b>\n"
            "• 🤖 <b>CryptoBot</b> (USDT, TON, BTC — 0% fee)\n"
            "• ⚡ <b>Bot 2328</b> (Telegram Pay / SBP)\n"
            "• 💳 <b>Platega</b> (Cards, SBP, T-Pay)\n"
            "• 🦊 <b>Enot.io</b> (International cards, QIWI)\n\n"
            "⚡ <i>Full duration warranty • Instant 24/7 delivery</i>\n\n"
            "Click <b>«Open Kotik Store»</b> below to enter the shop 👇"
        )
    return (
        f"- Привет, {user_nick}! ⭐\n\n"
        f"- Добро пожаловать в <b>Kotik Store</b>!\n\n"
        f"- Лучший проводник в мир подписок на любые сервисы!\n\n"
        "✨ <b>В наличии нейросети с моментальной автовыдачей:</b>\n"
        "• 🤖 <b>ChatGPT Plus</b> (o1, GPT-4o, Canvas, DALL-E)\n"
        "• ✨ <b>Gemini Advanced</b> (2M контекст, 2ТБ Google One)\n"
        "• 💻 <b>Claude 3.7 Sonnet Pro</b> (Топ для кода)\n"
        "• 🚀 <b>Grok AI</b> (X Premium+, без цензуры, FLUX)\n"
        "• 🎙 <b>ElevenLabs Pro</b> (Клонирование голоса)\n"
        "• 🎬 <b>CapCut Pro</b> (PRO эффекты и 4K рендер)\n\n"
        "💳 <b>Доступные способы оплаты:</b>\n"
        "• 🤖 <b>CryptoBot</b> (USDT, TON, BTC — 0% комиссия)\n"
        "• ⚡ <b>Бот 2328</b> (Telegram Pay / SBP)\n"
        "• 💳 <b>Platega</b> (СБП, Карты РФ, T-Pay, Сбер)\n"
        "• 🦊 <b>Enot.io</b> (Карты СНГ, ЮMoney, QIWI)\n\n"
        "⚡ <i>Гарантия на весь оплаченный период • Автовыдача 24/7</i>\n\n"
        "Нажмите <b>«Открыть Kotik Store»</b> ниже для входа в витрину 👇"
    )


def get_sub_required_text(lang: str = "ru") -> str:
    if lang == "en":
        return (
            "📢 <b>Mandatory Subscription to Kotik News</b>\n\n"
            "To access <b>Kotik Store</b>, please subscribe to our official channel <b>@KotikNews_shop</b>!\n\n"
            "There you will find:\n"
            "• 🎁 Exclusive balance promo codes & discounts\n"
            "• ⚡ Fresh drops of accounts & API keys\n"
            "• 🏆 Monthly $10.00 & «Premium Kotik» contest results\n\n"
            "After subscribing, click <b>«✅ I Subscribed (Check)»</b> below!"
        )
    return (
        "📢 <b>Обязательная подписка на канал Kotik News</b>\n\n"
        "Для использования магазина <b>Kotik Store</b> необходимо подписаться на наш официальный новостной канал <b>@KotikNews_shop</b>!\n\n"
        "Там мы публикуем:\n"
        "• 🎁 Эксклюзивные промокоды на скидки и баланс\n"
        "• ⚡ Новые дропы нейросетей и ключей\n"
        "• 🏆 Итоги ежемесячного конкурса на $10.00 и «Премиум Котик»\n\n"
        "После подписки нажмите <b>«✅ Я подписался (Проверить)»</b> ниже!"
    )


def get_main_reply_keyboard(lang: str = "ru") -> ReplyKeyboardMarkup:
    """Bottom persistent keyboard with one single button to return to main menu."""
    btn_text = "🐱 Back to Main Menu" if lang == "en" else "🐱 Вернуться в главное меню"
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text=btn_text)]
        ],
        resize_keyboard=True,
    )


def get_main_inline_keyboard(lang: str = "ru", is_staff: bool = False) -> InlineKeyboardMarkup:
    """Inline keyboard under the hero welcome message."""
    is_en = lang == "en"
    webapp_url_with_lang = f"{WEBAPP_URL}?lang={lang}"

    buttons = [
        [
            InlineKeyboardButton(
                text="⚡ Open Kotik Store" if is_en else "⚡ Открыть Kotik Store",
                web_app=WebAppInfo(url=webapp_url_with_lang),
            )
        ],
        [
            InlineKeyboardButton(text="📜 Agreement" if is_en else "📜 Соглашение", callback_data="btn_rules"),
            InlineKeyboardButton(text="🛡️ Warranty" if is_en else "🛡️ Гарантия и возврат", callback_data="btn_warranty"),
        ],
        [
            InlineKeyboardButton(text="🔒 Privacy" if is_en else "🔒 Приватность", callback_data="btn_privacy"),
            InlineKeyboardButton(text="💬 Support" if is_en else "💬 Поддержка", callback_data="btn_support"),
        ],
        [
            InlineKeyboardButton(text="📢 Our Channel" if is_en else "📢 Наш Канал", url=CHANNEL_URL),
        ],
        [
            InlineKeyboardButton(
                text="🇷🇺 Русский ✅" if not is_en else "🇷🇺 Русский",
                callback_data="btn_set_lang_ru",
            ),
            InlineKeyboardButton(
                text="🇬🇧 English ✅" if is_en else "🇬🇧 English",
                callback_data="btn_set_lang_en",
            ),
        ],
    ]
    if is_staff:
        buttons.append([
            InlineKeyboardButton(
                text="⚙️ Admin Panel" if is_en else "⚙️ Админ-панель",
                callback_data="btn_admin_menu",
            )
        ])
    return InlineKeyboardMarkup(inline_keyboard=buttons)


def get_sub_inline_keyboard(lang: str = "ru") -> InlineKeyboardMarkup:
    """Keyboard for mandatory channel subscription."""
    is_en = lang == "en"
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📢 Subscribe to Channel" if is_en else "📢 Подписаться на канал",
                    url=CHANNEL_URL,
                )
            ],
            [
                InlineKeyboardButton(
                    text="✅ I Subscribed (Check)" if is_en else "✅ Я подписался (Проверить)",
                    callback_data="btn_check_sub",
                )
            ],
            [
                InlineKeyboardButton(
                    text="🇷🇺 Русский ✅" if not is_en else "🇷🇺 Русский",
                    callback_data="btn_set_lang_ru_sub",
                ),
                InlineKeyboardButton(
                    text="🇬🇧 English ✅" if is_en else "🇬🇧 English",
                    callback_data="btn_set_lang_en_sub",
                ),
            ],
        ]
    )


def get_admin_inline_keyboard(lang: str = "ru") -> InlineKeyboardMarkup:
    """Keyboard inside /admin control panel."""
    admin_webapp_url = f"{WEBAPP_URL}?admin=1&lang={lang}"

    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="👑 Открыть Web-Админку",
                    web_app=WebAppInfo(url=admin_webapp_url),
                )
            ],
            [
                InlineKeyboardButton(text="📊 Склад и остатки", callback_data="admin_stock"),
                InlineKeyboardButton(text="👥 Список персонала", callback_data="admin_staff"),
            ],
            [
                InlineKeyboardButton(text="⚡ Переключить X2 Бонус", callback_data="admin_toggle_x2"),
                InlineKeyboardButton(text="🧪 Тест уведомлений", callback_data="admin_test_notify"),
            ],
            [
                InlineKeyboardButton(
                    text="🔙 Вернуться в главное меню",
                    callback_data="btn_back_to_kotik",
                )
            ],
        ]
    )


# --- Handlers ---
@dp.message(CommandStart())
async def handle_start(message: types.Message, bot: Bot):
    user_id = message.from_user.id
    username = message.from_user.username or ""
    first_name = message.from_user.first_name or ""

    # Save to SQLite DB
    db.get_or_create_user(user_id, username, first_name)
    is_admin = db.is_staff(user_id)
    lang = db.get_user_language(user_id)

    # 1. Check Mandatory Channel Subscription
    subscribed = await is_subscribed_to_channel(bot, user_id)
    if not subscribed:
        sub_text = get_sub_required_text(lang)
        sub_kb = get_sub_inline_keyboard(lang)
        if os.path.exists(CHANNEL_AVATAR_PATH):
            try:
                photo = FSInputFile(CHANNEL_AVATAR_PATH)
                await message.answer_photo(
                    photo=photo,
                    caption=sub_text,
                    parse_mode=ParseMode.HTML,
                    reply_markup=sub_kb,
                )
                return
            except Exception:
                pass
        await message.answer(sub_text, parse_mode=ParseMode.HTML, reply_markup=sub_kb)
        return

    # 2. User is subscribed -> Show Main Menu
    user_nick = resolve_display_name(first_name, username, lang)
    welcome_text = get_welcome_text(user_nick, lang)
    reply_kb = get_main_reply_keyboard(lang)
    inline_kb = get_main_inline_keyboard(lang, is_admin)

    # Set Menu Button
    try:
        await bot.set_chat_menu_button(
            chat_id=message.chat.id,
            menu_button=MenuButtonWebApp(
                text="🐱 Kotik Store",
                web_app=WebAppInfo(url=f"{WEBAPP_URL}?lang={lang}"),
            ),
        )
    except Exception as e:
        logger.warning(f"Could not set menu button: {e}")

    # Send with mascot photo if available, otherwise text
    if os.path.exists(MASCOT_PATH):
        try:
            photo = FSInputFile(MASCOT_PATH)
            await message.answer_photo(
                photo=photo,
                caption=welcome_text,
                parse_mode=ParseMode.HTML,
                reply_markup=inline_kb,
            )
            await message.answer("🐾", reply_markup=reply_kb)
            return
        except Exception as e:
            logger.warning(f"Failed to send photo: {e}")

    await message.answer(
        text=welcome_text,
        parse_mode=ParseMode.HTML,
        reply_markup=inline_kb,
    )
    await message.answer("🐾", reply_markup=reply_kb)


# --- Callback: Check Subscription ---
@dp.callback_query(F.data == "btn_check_sub")
async def handle_check_subscription(callback: types.CallbackQuery, bot: Bot):
    user_id = callback.from_user.id
    username = callback.from_user.username or ""
    first_name = callback.from_user.first_name or ""
    lang = db.get_user_language(user_id)
    is_admin = db.is_staff(user_id)

    subscribed = await is_subscribed_to_channel(bot, user_id)
    if not subscribed:
        alert_msg = (
            "You haven't subscribed to @KotikNews_shop yet! Please subscribe and try again."
            if lang == "en"
            else "Вы ещё не подписались на канал @KotikNews_shop! Пожалуйста, подпишитесь на канал и нажмите кнопку снова."
        )
        await callback.answer(alert_msg, show_alert=True)
        return

    await callback.answer(
        "Подписка подтверждена! Добро пожаловать! 🎉" if lang != "en" else "Subscription verified! Welcome! 🎉"
    )

    try:
        await callback.message.delete()
    except Exception:
        pass

    user_nick = resolve_display_name(first_name, username, lang)
    welcome_text = get_welcome_text(user_nick, lang)
    reply_kb = get_main_reply_keyboard(lang)
    inline_kb = get_main_inline_keyboard(lang, is_admin)

    # Set Menu Button
    try:
        await bot.set_chat_menu_button(
            chat_id=callback.message.chat.id,
            menu_button=MenuButtonWebApp(
                text="🐱 Kotik Store",
                web_app=WebAppInfo(url=f"{WEBAPP_URL}?lang={lang}"),
            ),
        )
    except Exception as e:
        logger.warning(f"Could not set menu button: {e}")

    if os.path.exists(MASCOT_PATH):
        try:
            photo = FSInputFile(MASCOT_PATH)
            await callback.message.answer_photo(
                photo=photo,
                caption=welcome_text,
                parse_mode=ParseMode.HTML,
                reply_markup=inline_kb,
            )
            await callback.message.answer("🐾", reply_markup=reply_kb)
            return
        except Exception:
            pass

    await callback.message.answer(welcome_text, parse_mode=ParseMode.HTML, reply_markup=inline_kb)
    await callback.message.answer("🐾", reply_markup=reply_kb)


# --- Callback: Set Language (RU / EN) ---
@dp.callback_query(F.data.in_(["btn_set_lang_ru", "btn_set_lang_en", "btn_toggle_lang", "btn_set_lang_ru_sub", "btn_set_lang_en_sub", "btn_toggle_lang_sub"]))
async def handle_set_language(callback: types.CallbackQuery, bot: Bot):
    user_id = callback.from_user.id
    current_lang = db.get_user_language(user_id)

    if callback.data in ("btn_set_lang_ru", "btn_set_lang_ru_sub"):
        new_lang = "ru"
    elif callback.data in ("btn_set_lang_en", "btn_set_lang_en_sub"):
        new_lang = "en"
    else:
        new_lang = "en" if current_lang == "ru" else "ru"

    db.set_user_language(user_id, new_lang)
    is_admin = db.is_staff(user_id)

    toast = "Язык переключен на Русский 🇷🇺" if new_lang == "ru" else "Language switched to English 🇬🇧"
    await callback.answer(toast)

    # 1. If on the Subscription screen
    if "sub" in callback.data:
        sub_text = get_sub_required_text(new_lang)
        sub_kb = get_sub_inline_keyboard(new_lang)
        try:
            await callback.message.edit_caption(caption=sub_text, parse_mode=ParseMode.HTML, reply_markup=sub_kb)
        except Exception:
            try:
                await callback.message.edit_text(text=sub_text, parse_mode=ParseMode.HTML, reply_markup=sub_kb)
            except Exception:
                pass
        return

    # 2. Main Menu
    username = callback.from_user.username or ""
    first_name = callback.from_user.first_name or ""
    user_nick = resolve_display_name(first_name, username, new_lang)
    welcome_text = get_welcome_text(user_nick, new_lang)
    inline_kb = get_main_inline_keyboard(new_lang, is_admin)

    try:
        await callback.message.edit_caption(caption=welcome_text, parse_mode=ParseMode.HTML, reply_markup=inline_kb)
    except Exception:
        try:
            await callback.message.edit_text(text=welcome_text, parse_mode=ParseMode.HTML, reply_markup=inline_kb)
        except Exception:
            pass

    # Update Telegram chat menu button URL to match new language
    try:
        await bot.set_chat_menu_button(
            chat_id=callback.message.chat.id,
            menu_button=MenuButtonWebApp(
                text="🐱 Kotik Store",
                web_app=WebAppInfo(url=f"{WEBAPP_URL}?lang={new_lang}"),
            ),
        )
    except Exception as e:
        logger.warning(f"Could not update menu button: {e}")

    # Update persistent reply keyboard button language
    reply_kb = get_main_reply_keyboard(new_lang)
    await callback.message.answer("🐾", reply_markup=reply_kb)


# --- /admin Command ---
@dp.message(Command("admin"))
@dp.message(F.text == "⚙️ Панель управления (/admin)")
async def handle_admin(message: types.Message):
    user_id = message.from_user.id
    role = db.get_staff_role(user_id)

    if not role:
        await message.answer(
            "⛔ <b>Доступ запрещен!</b>\n\n"
            "Команда доступна только администраторам и модераторам Kotik Store.",
            parse_mode=ParseMode.HTML,
        )
        return

    stats = db.get_stats()
    role_label = "👑 Владелец" if role == "super_admin" else ("🛡️ Администратор" if role == "admin" else "👁️ Модератор")

    admin_text = (
        f"⚙️ <b>Панель управления Kotik Store</b>\n"
        f"Ваша роль: <b>{role_label}</b> (ID: <code>{user_id}</code>)\n\n"
        f"📊 <b>Статистика магазина:</b>\n"
        f"• Пользователей в базе: <b>{stats['users_count']}</b>\n"
        f"• Всего заказов: <b>{stats['orders_count']}</b>\n"
        f"• Выручка: <b>${stats['revenue']:.2f}</b>\n"
        f"• Ключей/аккаунтов на складе: <b>{stats['stock_count']} шт.</b>\n"
        f"• Акция X2 на пополнение: <b>{'🔥 ВКЛЮЧЕНА' if stats['x2_active'] else 'ВЫКЛЮЧЕНА'}</b>\n\n"
        f"🔔 <b>СМС-оповещения:</b> активны для всех покупок и пополнений (CryptoBot, 2328, Platega, Enot).\n\n"
        f"💡 <i>Команды персонала:\n"
        f"• <code>/addadmin &lt;ID&gt; [admin/moderator]</code>\n"
        f"• <code>/deladmin &lt;ID&gt;</code>\n"
        f"• <code>/test_deposit</code> — проверить СМС пополнения\n"
        f"• <code>/test_purchase</code> — проверить СМС покупки</i>"
    )

    await message.answer(
        text=admin_text,
        parse_mode=ParseMode.HTML,
        reply_markup=get_admin_inline_keyboard(),
    )


# --- Navigation: Return to Kotik Main Menu ---
@dp.callback_query(F.data == "btn_back_to_kotik")
@dp.message(F.text == "🐱 Вернуться в главное меню")
@dp.message(F.text == "🐱 Back to Main Menu")
@dp.message(F.text.lower().contains("главное меню"))
@dp.message(F.text.lower().contains("main menu"))
@dp.message(F.text.lower().contains("вернуться"))
async def handle_back_to_kotik(event: types.Message | types.CallbackQuery, bot: Bot):
    user = event.from_user
    username = user.username or ""
    first_name = user.first_name or ""
    lang = db.get_user_language(user.id)
    user_nick = resolve_display_name(first_name, username, lang)
    is_admin = db.is_staff(user.id)

    # Check subscription first
    subscribed = await is_subscribed_to_channel(bot, user.id)
    if not subscribed:
        sub_text = get_sub_required_text(lang)
        sub_kb = get_sub_inline_keyboard(lang)
        if isinstance(event, types.CallbackQuery):
            await event.answer()
            await event.message.answer(sub_text, parse_mode=ParseMode.HTML, reply_markup=sub_kb)
        else:
            await event.answer(sub_text, parse_mode=ParseMode.HTML, reply_markup=sub_kb)
        return

    welcome_text = get_welcome_text(user_nick, lang)
    inline_kb = get_main_inline_keyboard(lang, is_admin)

    if isinstance(event, types.CallbackQuery):
        await event.answer("Возвращаемся в главное меню... 🐾" if lang != "en" else "Returning to Main Menu... 🐾")
        if os.path.exists(MASCOT_PATH):
            try:
                photo = FSInputFile(MASCOT_PATH)
                await event.message.answer_photo(
                    photo=photo,
                    caption=welcome_text,
                    parse_mode=ParseMode.HTML,
                    reply_markup=inline_kb,
                )
                return
            except Exception:
                pass
        await event.message.answer(welcome_text, parse_mode=ParseMode.HTML, reply_markup=inline_kb)
    else:
        if os.path.exists(MASCOT_PATH):
            try:
                photo = FSInputFile(MASCOT_PATH)
                await event.answer_photo(
                    photo=photo,
                    caption=welcome_text,
                    parse_mode=ParseMode.HTML,
                    reply_markup=inline_kb,
                )
                return
            except Exception:
                pass
        await event.answer(welcome_text, parse_mode=ParseMode.HTML, reply_markup=inline_kb)


# --- Policy, Warranty, Privacy & Support (ZykoStore Standard) ---
@dp.callback_query(F.data == "btn_rules")
@dp.message(Command("rules"))
@dp.message(F.text == "📜 Соглашение")
async def handle_rules(event: types.Message | types.CallbackQuery):
    rules_text = (
        "📜 <b>Пользовательское соглашение Kotik Store</b>\n\n"
        "<b>1. Общие положения</b>\n"
        "1.1. Настоящее Пользовательское соглашение регулирует порядок использования онлайн-сервиса Kotik Store (далее — «Сервис»).\n"
        "1.2. Используя бота, WebApp или совершая покупки, Пользователь подтверждает, что полностью ознакомился с условиями и принимает их в полном объёме.\n\n"
        "<b>2. Характер услуг и цифровых товаров</b>\n"
        "2.1. Сервис предоставляет цифровые товары и услуги нематериального характера (доступы к нейросетям, премиум-подпискам, ключам).\n"
        "2.2. Пользователь осознаёт, что ценность Сервиса заключается в автоматизированной доставке 24/7, систематизации, сопровождении, технической поддержке и регулярных обновлениях.\n"
        "2.3. Сервис не гарантирует исключительность или уникальность отдельных элементов ПО вне Сервиса.\n\n"
        "<b>3. Отказ от гарантий и ответственности</b>\n"
        "3.1. Услуги и аккаунты предоставляются на условиях «AS IS» («как есть»).\n"
        "3.2. Администрация не гарантирует соответствие сторонних нейросетей субъективным ожиданиям и не несёт ответственности за действия сторонних AI-провайдеров (OpenAI, Anthropic, Google) или интернет-провайдеров.\n\n"
        "<b>4. Законность использования</b>\n"
        "4.1. Пользователь обязуется использовать Сервис исключительно в рамках применимого законодательства и условий обслуживания (ToS) провайдеров.\n"
        "4.2. Ответственность за использование генераций и материалов возлагается на Пользователя.\n\n"
        "<b>5. Ограничение доступа & Интеллектуальная собственность</b>\n"
        "5.1. Все материалы защищены. Запрещается перепродажа или распространение выданных данных третьим лицам.\n"
        "5.2. Администрация вправе ограничить доступ к Сервису при спаме, злоупотреблениях или оскорблениях поддержки без компенсации."
    )
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="🛡️ Гарантия и возврат", callback_data="btn_warranty"),
                InlineKeyboardButton(text="🔒 Приватность", callback_data="btn_privacy"),
            ],
            [
                InlineKeyboardButton(text="💬 Поддержка", callback_data="btn_support"),
            ],
            [InlineKeyboardButton(text="🔙 Вернуться до котика в главное меню", callback_data="btn_back_to_kotik")],
        ]
    )
    if isinstance(event, types.CallbackQuery):
        await event.answer()
        await event.message.answer(rules_text, parse_mode=ParseMode.HTML, reply_markup=kb)
    else:
        await event.answer(rules_text, parse_mode=ParseMode.HTML, reply_markup=kb)


@dp.callback_query(F.data == "btn_warranty")
@dp.message(Command("warranty"))
@dp.message(F.text == "🛡️ Гарантия и возврат")
async def handle_warranty(event: types.Message | types.CallbackQuery):
    warranty_text = (
        "⚖️ <b>Правила возврата и гарантии Kotik Store (ZykoStore Standard)</b>\n\n"
        "1. <b>Гарантийный период на цифровые товары:</b>\n"
        "• Первичная проверка качества — в течение <b>15 минут</b> с момента покупки.\n"
        "• На оплаченные подписки действует гарантия работоспособности на весь оплаченный период (1, 3, 6 или 12 месяцев).\n\n"
        "2. ⚠️ <b>Обязательные условия для возврата или замены:</b>\n"
        "• <b>Предоставление непрерывной видеозаписи (видео с экрана) покупки товара и его проверки!</b>\n"
        "• Видеозапись должна начинаться <i>ДО</i> момента совершения оплаты/покупки и продолжаться до момента первой попытки входа/активации без монтажа, пауз и склеек.\n"
        "• Наличие объективных признаков неработоспособности данных на момент выдачи.\n\n"
        "3. 🚫 <b>Отказ в гарантийном обслуживании:</b>\n"
        "• Отсутствие непрерывного видео проверки.\n"
        "• Истечение 15-минутного периода подачи первичной претензии.\n"
        "• Нарушение правил пользования (попытка смены пароля/почты на общих аккаунтах, бан за нарушение правил нейросети).\n"
        "• Проблемы на стороне клиента (локальные сбои интернет-соединения, отсутствие VPN, неподдерживаемый браузер).\n\n"
        "4. ⏱ <b>Порядок решения:</b>\n"
        "При подтверждении невалидности производится моментальная замена товара на аналогичный либо зачисление баланса в WebApp."
    )
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="💬 Написать в поддержку", url="https://t.me/Zykolandstore")],
            [InlineKeyboardButton(text="🔙 Вернуться до котика в главное меню", callback_data="btn_back_to_kotik")],
        ]
    )
    if isinstance(event, types.CallbackQuery):
        await event.answer()
        await event.message.answer(warranty_text, parse_mode=ParseMode.HTML, reply_markup=kb)
    else:
        await event.answer(warranty_text, parse_mode=ParseMode.HTML, reply_markup=kb)


@dp.callback_query(F.data == "btn_privacy")
@dp.message(Command("privacy"))
@dp.message(F.text == "🔒 Приватность")
async def handle_privacy(event: types.Message | types.CallbackQuery):
    privacy_text = (
        "🔒 <b>Политика конфиденциальности Kotik Store</b>\n\n"
        "<b>1. Сбор информации:</b>\n"
        "Мы собираем только минимально необходимые данные для работы магазина:\n"
        "• Telegram ID, имя пользователя (@username), имя профиля;\n"
        "• Историю заказов и состояние баланса в боте;\n"
        "• Технические логи запросов.\n\n"
        "<b>2. Платежные данные:</b>\n"
        "Магазин не запрашивает и не хранит паспортные данные, номера банковских карт или приватные ключи кошельков. Все транзакции проводятся через защищенные провайдеры (CryptoBot, Bot 2328, Platega, Enot.io, Stars).\n\n"
        "<b>3. Защита информации:</b>\n"
        "Данные никогда не передаются сторонним сервисам или рекламодателям и хранятся на защищенных серверах."
    )
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🔙 Вернуться до котика в главное меню", callback_data="btn_back_to_kotik")]
        ]
    )
    if isinstance(event, types.CallbackQuery):
        await event.answer()
        await event.message.answer(privacy_text, parse_mode=ParseMode.HTML, reply_markup=kb)
    else:
        await event.answer(privacy_text, parse_mode=ParseMode.HTML, reply_markup=kb)


@dp.callback_query(F.data == "btn_support")
@dp.message(Command("support"))
@dp.message(F.text == "💬 Поддержка")
async def handle_support(event: types.Message | types.CallbackQuery):
    support_text = (
        "💬 <b>Служба заботы и поддержки Kotik Store</b>\n\n"
        "Возникли сложности с товаром, активацией подписки или пополнением баланса?\n\n"
        "👤 <b>Администратор / Поддержка:</b> @Zykolandstore (для решения технических вопросов, замен и возвратов)\n"
        "📢 <b>Наш Telegram-канал:</b> @KotikNews_shop (новости, раздачи, промокоды)\n\n"
        "📝 <b>Инструкция для быстрой замены или возврата:</b>\n"
        "1. Отправьте скриншот ошибки или нерабочего аккаунта прямо в чат @Zykolandstore.\n"
        "2. Приложите видео покупки товара (непрерывная запись экрана с момента покупки до проверки).\n"
        "3. Опишите проблему и укажите ID заказа из вкладки «Мои подписки».\n\n"
        "⏱ <i>Среднее время ответа оператора: 2–5 минут (24/7)</i>"
    )
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="👤 Написать @Zykolandstore", url="https://t.me/Zykolandstore"),
                InlineKeyboardButton(text="📢 Наш Канал", url="https://t.me/KotikNews_shop"),
            ],
            [InlineKeyboardButton(text="🔙 Вернуться до котика в главное меню", callback_data="btn_back_to_kotik")],
        ]
    )
    if isinstance(event, types.CallbackQuery):
        await event.answer()
        await event.message.answer(support_text, parse_mode=ParseMode.HTML, reply_markup=kb)
    else:
        await event.answer(support_text, parse_mode=ParseMode.HTML, reply_markup=kb)


@dp.message(F.text == "👤 Мой кабинет")
async def handle_cabinet(message: types.Message):
    user_id = message.from_user.id
    u = db.get_user(user_id) or db.get_or_create_user(user_id, message.from_user.username or "", message.from_user.first_name or "")
    role = db.get_staff_role(user_id)

    role_str = "👑 Владелец" if role == "super_admin" else ("🛡️ Администратор" if role == "admin" else ("👁️ Модератор" if role == "moderator" else "Клиент"))

    text = (
        f"👤 <b>Личный кабинет</b>\n\n"
        f"• Имя: <b>{u['first_name']}</b> (@{u['username'] or '—'})\n"
        f"• Telegram ID: <code>{u['telegram_id']}</code>\n"
        f"• Статус доступа: <b>{role_str}</b>\n"
        f"• Баланс: <b>${u['balance']:.2f}</b>\n"
        f"• Всего заказов: <b>{u['orders_count']}</b>\n"
        f"• Оборот: <b>${u['total_spent']:.2f}</b>\n\n"
        f"Для пополнения баланса и покупок откройте <b>Kotik Store WebApp</b> 👇"
    )

    await message.answer(
        text,
        parse_mode=ParseMode.HTML,
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="⚡ Открыть Kotik Store", web_app=WebAppInfo(url=WEBAPP_URL))],
                [InlineKeyboardButton(text="🔙 Вернуться до котика в главное меню", callback_data="btn_back_to_kotik")],
            ]
        ),
    )


# --- Admin Callbacks ---
@dp.callback_query(F.data == "btn_admin_menu")
async def handle_admin_menu_cb(callback: types.CallbackQuery):
    await callback.answer()
    await handle_admin(callback.message)


@dp.callback_query(F.data == "admin_stock")
async def handle_admin_stock(callback: types.CallbackQuery):
    if not db.is_staff(callback.from_user.id):
        await callback.answer("Доступ запрещен!", show_alert=True)
        return
    await callback.answer()

    summary = db.get_stock_summary()
    lines = ["📦 <b>Наличие товаров на складе:</b>\n"]
    for item in summary:
        icon = "🟢" if item["count"] > 0 else "🔴"
        lines.append(f"{icon} <b>{item['title']}</b>: {item['count']} шт.")

    lines.append("\n<i>Для загрузки новых ключей используйте Web-Админку.</i>")
    await callback.message.answer("\n".join(lines), parse_mode=ParseMode.HTML)


@dp.callback_query(F.data == "admin_staff")
async def handle_admin_staff(callback: types.CallbackQuery):
    if not db.is_staff(callback.from_user.id):
        await callback.answer("Доступ запрещен!", show_alert=True)
        return
    await callback.answer()

    admins = db.get_all_admins()
    lines = ["👥 <b>Список персонала (Администраторы и Модераторы):</b>\n"]
    for a in admins:
        badge = "👑 Владелец" if a["role"] == "super_admin" else ("🛡️ Админ" if a["role"] == "admin" else "👁️ Модератор")
        lines.append(f"• <b>{a['name'] or a['username']}</b> (@{a['username']}) — <b>{badge}</b> [ID: <code>{a['telegram_id']}</code>]")

    lines.append("\n💡 <i>Чтобы добавить: <code>/addadmin &lt;ID&gt; [admin/moderator]</code></i>")
    lines.append("💡 <i>Чтобы удалить: <code>/deladmin &lt;ID&gt;</code></i>")
    await callback.message.answer("\n".join(lines), parse_mode=ParseMode.HTML)


@dp.callback_query(F.data == "admin_toggle_x2")
async def handle_admin_toggle_x2(callback: types.CallbackQuery):
    if not db.is_staff(callback.from_user.id):
        await callback.answer("Доступ запрещен!", show_alert=True)
        return

    is_on = db.toggle_x2()
    status_str = "🔥 ВКЛЮЧЕНА (баланс удваивается)" if is_on else "ВЫКЛЮЧЕНА"
    await callback.answer(f"Акция X2: {status_str}", show_alert=True)
    await callback.message.answer(
        f"⚡ <b>Акция X2 на пополнение: {status_str}</b>\n"
        f"Изменение вступило в силу на витрине магазина.",
        parse_mode=ParseMode.HTML,
    )


# --- Test Notification Commands for Owner/Admins ---
@dp.callback_query(F.data == "admin_test_notify")
@dp.message(Command("test_deposit"))
async def handle_test_deposit(event: types.Message | types.CallbackQuery, bot: Bot):
    user = event.from_user
    if not db.is_staff(user.id):
        return

    if isinstance(event, types.CallbackQuery):
        await event.answer("Отправка тестового СМС...")

    await notify_deposit(
        bot=bot,
        user_id=user.id,
        username=user.username or "kirabakuta",
        amount=25.0,
        gateway="CryptoBot",
        invoice_id="INV-TEST-7824",
        x2_active=True,
    )


@dp.message(Command("test_purchase"))
async def handle_test_purchase(message: types.Message, bot: Bot):
    user = message.from_user
    if not db.is_staff(user.id):
        return

    await notify_purchase(
        bot=bot,
        user_id=user.id,
        username=user.username or "kirabakuta",
        product_title="ChatGPT Plus (1 месяц)",
        price=22.0,
        order_id="ORD-TEST-9921",
        item_content="kotik_gpt_pro@gmail.com:KotikPass2026!",
    )


# --- Admin Staff Management Commands ---
@dp.message(Command("addadmin"))
async def handle_addadmin(message: types.Message):
    user_id = message.from_user.id
    role = db.get_staff_role(user_id)
    if role not in ["super_admin", "admin"]:
        await message.answer("⛔ Доступ запрещен. Только Владелец и Администраторы могут назначать персонал.")
        return

    parts = message.text.split()
    if len(parts) < 2:
        await message.answer("❌ <b>Формат:</b> <code>/addadmin &lt;TELEGRAM_ID&gt; [admin/moderator] [@username]</code>", parse_mode=ParseMode.HTML)
        return

    try:
        target_id = int(parts[1])
    except ValueError:
        await message.answer("❌ Неверный Telegram ID! Должны быть только цифры.")
        return

    target_role = parts[2].lower() if len(parts) > 2 and parts[2].lower() in ["admin", "moderator"] else "admin"
    target_username = parts[3].replace("@", "") if len(parts) > 3 else f"user_{target_id}"

    db.add_admin(target_id, target_username, target_username, target_role, added_by=f"ID {user_id}")
    role_name = "🛡️ Администратор" if target_role == "admin" else "👁️ Модератор"
    await message.answer(
        f"✅ <b>Успешно!</b>\nПользователь <code>{target_id}</code> (@{target_username}) назначен на роль: <b>{role_name}</b>.\n"
        f"Теперь ему доступна админка в WebApp и команда <code>/admin</code> в боте.",
        parse_mode=ParseMode.HTML,
    )


@dp.message(Command("deladmin"))
async def handle_deladmin(message: types.Message):
    user_id = message.from_user.id
    role = db.get_staff_role(user_id)
    if role != "super_admin":
        await message.answer("⛔ Только Главный Владелец может отзывать права у персонала.")
        return

    parts = message.text.split()
    if len(parts) < 2:
        await message.answer("❌ <b>Формат:</b> <code>/deladmin &lt;TELEGRAM_ID&gt;</code>", parse_mode=ParseMode.HTML)
        return

    try:
        target_id = int(parts[1])
    except ValueError:
        await message.answer("❌ Неверный Telegram ID.")
        return

    if db.remove_admin(target_id):
        await message.answer(f"✅ Права у пользователя <code>{target_id}</code> успешно отозваны.", parse_mode=ParseMode.HTML)
    else:
        await message.answer("❌ Не удалось удалить этого пользователя (возможно, это главный владелец).")


# =====================================================================
# AIOHTTP BACKGROUND SERVER FOR WEBHOOKS & REST API
# =====================================================================
@web.middleware
async def cors_middleware(request: web.Request, handler):
    if request.method == "OPTIONS":
        response = web.Response(status=204)
    else:
        response = await handler(request)
    
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PUT, DELETE"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept"
    return response


async def handle_api_products(request: web.Request):
    """GET /api/v1/products - Returns list of active products with warehouse stock."""
    products = db.get_products_list()
    return web.json_response({"ok": True, "count": len(products), "products": products})


async def handle_api_user_balance(request: web.Request):
    """GET /api/v1/user/balance - Returns current balance and status."""
    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "").strip()
    
    # Live user or owner fallback
    user = db.get_user(db.OWNER_TELEGRAM_ID)
    balance = user["balance"] if user else 0.0
    
    return web.json_response({
        "ok": True,
        "token_prefix": token[:8] + "..." if len(token) > 8 else token,
        "user_id": db.OWNER_TELEGRAM_ID,
        "balance": balance,
        "currency": "USD",
        "rank": "Silver",
        "is_active": True
    })


async def handle_api_create_order(request: web.Request):
    """POST /api/v1/order/create - Purchases an account via API."""
    try:
        data = await request.json()
        product_id = data.get("product_id")
        contact = data.get("contact", "@kotik_client")
        user_id = data.get("user_id", db.OWNER_TELEGRAM_ID)

        if not product_id:
            return web.json_response({"ok": False, "error": "Поле product_id обязательно"}, status=400)

        order_res, err = db.create_api_order(user_id=user_id, product_id=product_id, contact=contact)
        if err:
            return web.json_response({"ok": False, "error": err}, status=400)

        # Notify admins
        if bot_instance:
            await notify_purchase(
                bot=bot_instance,
                user_id=user_id,
                username=contact,
                product_title=order_res["product_title"],
                price=order_res["price"],
                order_id=order_res["order_id"],
                item_content=order_res["login_data"],
            )

        return web.json_response({"ok": True, "order": order_res})
    except Exception as e:
        logger.error(f"API create order error: {e}")
        return web.json_response({"ok": False, "error": str(e)}, status=500)


async def handle_api_get_order(request: web.Request):
    """GET /api/v1/order/{id} - Returns order status and login data."""
    order_id = request.match_info.get("id", "")
    order = db.get_order_by_id(order_id)
    if not order:
        return web.json_response({"ok": False, "error": "Заказ не найден"}, status=404)
    return web.json_response({"ok": True, "order": order})


async def handle_notify_purchase_api(request: web.Request):
    """API endpoint called when a purchase is completed."""
    try:
        data = await request.json()
        user_id = data.get("user_id", 0)
        username = data.get("username", "")
        product_title = data.get("product_title", "Нейросеть")
        price = float(data.get("price", 0.0))
        order_id = data.get("order_id", f"ORD-{int(datetime.now().timestamp())}")
        item_content = data.get("item_content", "")

        if bot_instance:
            await notify_purchase(
                bot=bot_instance,
                user_id=user_id,
                username=username,
                product_title=product_title,
                price=price,
                order_id=order_id,
                item_content=item_content,
            )
        return web.json_response({"ok": True})
    except Exception as e:
        logger.error(f"API purchase notify error: {e}")
        return web.json_response({"ok": False, "error": str(e)}, status=400)


async def handle_notify_deposit_api(request: web.Request):
    """API endpoint called when balance is topped up."""
    try:
        data = await request.json()
        user_id = data.get("user_id", 0)
        username = data.get("username", "")
        amount = float(data.get("amount", 0.0))
        gateway = data.get("gateway", "CryptoBot")
        invoice_id = data.get("invoice_id", f"INV-{int(datetime.now().timestamp())}")
        x2_active = bool(data.get("x2_active", False))

        if bot_instance:
            await notify_deposit(
                bot=bot_instance,
                user_id=user_id,
                username=username,
                amount=amount,
                gateway=gateway,
                invoice_id=invoice_id,
                x2_active=x2_active,
            )
        return web.json_response({"ok": True})
    except Exception as e:
        logger.error(f"API deposit notify error: {e}")
        return web.json_response({"ok": False, "error": str(e)}, status=400)


async def start_web_server():
    """Starts the internal webhook and REST API server."""
    app = web.Application(middlewares=[cors_middleware])
    
    # Internal notification endpoints
    app.router.add_post("/api/notify/purchase", handle_notify_purchase_api)
    app.router.add_post("/api/notify/deposit", handle_notify_deposit_api)

    # Public REST API v1
    app.router.add_get("/api/v1/products", handle_api_products)
    app.router.add_get("/api/v1/user/balance", handle_api_user_balance)
    app.router.add_post("/api/v1/order/create", handle_api_create_order)
    app.router.add_get("/api/v1/order/{id}", handle_api_get_order)

    runner = web.AppRunner(app)
    await runner.setup()
    port = int(os.environ.get("PORT", 8080))
    site = web.TCPSite(runner, "0.0.0.0", port)
    await site.start()
    logger.info(f"REST API & Notification server started on port {port}")


# --- Main Entry Point ---
async def main():
    global bot_instance
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    if not bot_token:
        try:
            bot_token = input("Введите токен вашего Telegram бота (из @BotFather): ").strip()
        except EOFError:
            bot_token = ""

    if not bot_token:
        print("Ошибка: Токен бота не указан!")
        sys.exit(1)

    bot_instance = Bot(token=bot_token)
    print("==================================================")
    print("[OK] Kotik Store Telegram Bot успешно запущен!")
    print(f"[*] WebApp URL: {WEBAPP_URL}")
    print(f"[*] Владелец ID: {db.OWNER_TELEGRAM_ID}")
    print(f"[*] Аватар бота: {BOT_AVATAR_PATH}")
    print(f"[*] Аватар канала: {CHANNEL_AVATAR_PATH}")
    print("[*] Платежные шлюзы: CryptoBot, 2328, Platega, Enot.io")
    print("==================================================")

    # Configure Telegram bot name & descriptions for RU and EN
    try:
        await bot_instance.set_my_name("Kotik Store", language_code=None)
        await bot_instance.set_my_name("Kotik Store", language_code="ru")
        await bot_instance.set_my_name("Kotik Store", language_code="en")
        await bot_instance.set_my_description(
            "🐱 Kotik Store — Магазин подписок на лучшие мировые нейросети и цифровые сервисы:\n"
            "• ChatGPT Plus (o1, GPT-4o, Canvas, DALL-E 3)\n"
            "• Gemini Advanced (2M токенов + 2TB Google Drive)\n"
            "• Claude 3.7 Sonnet Pro (Extended Thinking)\n"
            "• Grok AI (X Premium+, FLUX)\n"
            "• ElevenLabs Pro & CapCut Pro\n\n"
            "⚡ Моментальная автовыдача 24/7 • 100% гарантия • Оплата картами РФ, СБП, CryptoBot и Enot.",
            language_code="ru",
        )
        await bot_instance.set_my_description(
            "🐱 Kotik Store — The ultimate marketplace for flagship AI & digital subscriptions:\n"
            "• ChatGPT Plus (o1, GPT-4o, Canvas, DALL-E 3)\n"
            "• Gemini Advanced (2M tokens + 2TB Google One)\n"
            "• Claude 3.7 Sonnet Pro (Extended Thinking)\n"
            "• Grok AI (X Premium+, FLUX)\n"
            "• ElevenLabs Pro & CapCut Pro\n\n"
            "⚡ Instant 24/7 auto-delivery • 100% warranty • International cards, Crypto & Telegram Pay.",
            language_code="en",
        )
        await bot_instance.set_my_short_description("🐱 Kotik Store — Магазин нейросетей и подписок 24/7", language_code="ru")
        await bot_instance.set_my_short_description("🐱 Kotik Store — AI Subscriptions & Digital Keys 24/7", language_code="en")
    except Exception as e:
        logger.warning(f"Could not set bot metadata: {e}")

    # Start background webhook server
    try:
        await start_web_server()
    except Exception as e:
        logger.warning(f"Could not start background web server: {e}")

    await dp.start_polling(bot_instance)


if __name__ == "__main__":
    asyncio.run(main())
