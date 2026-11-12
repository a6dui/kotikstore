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

# Active session states (in-memory)
user_support_state: dict[int, bool] = {}
admin_session_state: dict[int, dict] = {}


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
            "- The ultimate guide to subscriptions for any digital service!"
        )
    return (
        f"- Привет, {user_nick}! ⭐\n\n"
        f"- Добро пожаловать в <b>Kotik Store</b>!\n\n"
        f"- Лучший проводник в мир подписок на любые сервисы!"
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
                InlineKeyboardButton(text="👥 Пользователи и Выдача", callback_data="admin_users_menu"),
                InlineKeyboardButton(text="⚡ Быстрая загрузка товара", callback_data="admin_fast_stock"),
            ],
            [
                InlineKeyboardButton(text="📊 Склад и остатки", callback_data="admin_stock"),
                InlineKeyboardButton(text="👥 Список персонала", callback_data="admin_staff"),
            ],
            [
                InlineKeyboardButton(text="⚡ Переключить X2 Бонус", callback_data="admin_toggle_x2"),
                InlineKeyboardButton(text="🗑 Очистить заказы", callback_data="admin_confirm_clear_orders"),
            ],
            [
                InlineKeyboardButton(text="🧪 Тест уведомлений", callback_data="admin_test_notify"),
                InlineKeyboardButton(
                    text="🔙 Вернуться в главное меню",
                    callback_data="btn_back_to_kotik",
                ),
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
    user_id = event.from_user.id
    user_support_state[user_id] = True

    support_text = (
        "💬 <b>Служба заботы Kotik Store (Тикет-система)</b>\n\n"
        "Возникли сложности с товаром, активацией подписки или пополнением баланса?\n\n"
        "✍️ <b>Напишите ваш вопрос или опишите проблему прямо сюда следующим сообщением!</b>\n\n"
        "Оператор получит ваше обращение и ответит вам прямо в этот диалог (24/7). Вам не нужно писать в сторонние личные сообщения! 🐾\n\n"
        "<i>Или воспользуйтесь прямым контактом: @Zykolandstore</i>"
    )
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="📢 Наш Канал", url="https://t.me/KotikNews_shop"),
                InlineKeyboardButton(text="❌ Отмена", callback_data="cancel_support_action"),
            ],
            [InlineKeyboardButton(text="🔙 Вернуться в главное меню", callback_data="btn_back_to_kotik")],
        ]
    )
    if isinstance(event, types.CallbackQuery):
        await event.answer()
        await event.message.answer(support_text, parse_mode=ParseMode.HTML, reply_markup=kb)
    else:
        await event.answer(support_text, parse_mode=ParseMode.HTML, reply_markup=kb)


@dp.callback_query(F.data == "cancel_support_action")
async def handle_cancel_support(callback: types.CallbackQuery):
    user_id = callback.from_user.id
    user_support_state.pop(user_id, None)
    await callback.answer("Обращение отменено")
    try:
        await callback.message.edit_text("🐾 Обращение в поддержку отменено. Вы в главном меню.")
    except Exception:
        pass


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
                [InlineKeyboardButton(text="🔙 Вернуться в главное меню", callback_data="btn_back_to_kotik")],
            ]
        ),
    )


# --- Admin Callbacks ---
@dp.callback_query(F.data == "btn_admin_menu")
async def handle_admin_menu_cb(callback: types.CallbackQuery):
    await callback.answer()
    await handle_admin(callback.message)


# --- Admin: Users Management & Manual Grants ---
@dp.callback_query(F.data == "admin_users_menu")
async def handle_admin_users_menu(callback: types.CallbackQuery):
    if not db.is_staff(callback.from_user.id):
        await callback.answer("Доступ запрещен!", show_alert=True)
        return
    await callback.answer()

    users = db.get_all_users_detailed()
    lines = [
        "👥 <b>База пользователей Kotik Store</b>\n",
        f"Всего пользователей: <b>{len(users)}</b>\n",
        "Выберите пользователя ниже для просмотра и ручной выдачи баланса или товара:\n"
    ]

    buttons = []
    for u in users[:10]:
        nick = f"@{u['username']}" if u.get('username') else (u.get('first_name') or f"ID:{u['telegram_id']}")
        buttons.append([
            InlineKeyboardButton(
                text=f"👤 {nick} (${u['balance']:.2f})",
                callback_data=f"usr_card_{u['telegram_id']}"
            )
        ])

    buttons.append([
        InlineKeyboardButton(text="🔍 Найти по ID / Nick", callback_data="usr_search_prompt"),
        InlineKeyboardButton(text="🔙 Назад в админку", callback_data="btn_admin_menu")
    ])

    kb = InlineKeyboardMarkup(inline_keyboard=buttons)
    await callback.message.answer("\n".join(lines), parse_mode=ParseMode.HTML, reply_markup=kb)


@dp.callback_query(F.data == "usr_search_prompt")
async def handle_usr_search_prompt(callback: types.CallbackQuery):
    admin_id = callback.from_user.id
    if not db.is_staff(admin_id):
        return
    admin_session_state[admin_id] = {"action": "enter_user_search"}
    await callback.answer()
    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="❌ Отмена", callback_data="cancel_admin_state")
    ]])
    await callback.message.answer(
        "🔍 <b>Поиск пользователя</b>\n\n"
        "Отправьте <b>@username</b> или <b>Telegram ID</b> пользователя для поиска:",
        parse_mode=ParseMode.HTML,
        reply_markup=kb,
    )


@dp.callback_query(F.data.startswith("usr_card_"))
async def handle_admin_user_card(callback: types.CallbackQuery):
    admin_id = callback.from_user.id
    if not db.is_staff(admin_id):
        return
    await callback.answer()
    uid = int(callback.data.replace("usr_card_", ""))
    u = db.get_user(uid)
    if not u:
        await callback.message.answer("⚠️ Пользователь не найден в базе данных.")
        return

    nick = f"@{u['username']}" if u.get('username') else (u.get('first_name') or "—")
    card_text = (
        f"👤 <b>Пользователь: {nick}</b>\n\n"
        f"• Telegram ID: <code>{u['telegram_id']}</code>\n"
        f"• Имя: <b>{u.get('first_name') or '—'}</b>\n"
        f"• Баланс: <b>${u['balance']:.2f}</b>\n"
        f"• Всего заказов: <b>{u['orders_count']}</b>\n"
        f"• Язык: <b>{u.get('language', 'ru').upper()}</b>\n"
        f"• Дата регистрации: <b>{u.get('created_at', '—')}</b>\n\n"
        f"<i>Выберите действие для пользователя:</i>"
    )

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="💰 Выдать баланс ($)", callback_data=f"usr_add_bal_{uid}"),
            InlineKeyboardButton(text="🎁 Выдать товар/подписку", callback_data=f"usr_grant_prod_{uid}"),
        ],
        [
            InlineKeyboardButton(text="👥 К списку пользователей", callback_data="admin_users_menu"),
            InlineKeyboardButton(text="🔙 В админку", callback_data="btn_admin_menu"),
        ]
    ])
    await callback.message.answer(card_text, parse_mode=ParseMode.HTML, reply_markup=kb)


@dp.callback_query(F.data.startswith("usr_add_bal_"))
async def handle_usr_add_bal_cb(callback: types.CallbackQuery):
    admin_id = callback.from_user.id
    if not db.is_staff(admin_id):
        return
    uid = int(callback.data.replace("usr_add_bal_", ""))
    admin_session_state[admin_id] = {
        "action": "enter_balance_amount",
        "target_uid": uid,
    }
    await callback.answer()
    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="❌ Отмена", callback_data=f"usr_card_{uid}")
    ]])
    await callback.message.answer(
        f"💰 <b>Выдача баланса пользователю ID <code>{uid}</code></b>\n\n"
        f"Введите сумму пополнения (например: <code>5</code>, <code>10.5</code> или со знаком минус для списания):",
        parse_mode=ParseMode.HTML,
        reply_markup=kb,
    )


@dp.callback_query(F.data.startswith("usr_grant_prod_"))
async def handle_usr_grant_prod_menu(callback: types.CallbackQuery):
    admin_id = callback.from_user.id
    if not db.is_staff(admin_id):
        return
    await callback.answer()
    uid = int(callback.data.replace("usr_grant_prod_", ""))
    prods = db.get_products_list()

    buttons = []
    for p in prods:
        buttons.append([
            InlineKeyboardButton(
                text=f"🎁 {p['title']}",
                callback_data=f"do_grant_{p['id']}_{uid}"
            )
        ])
    buttons.append([
        InlineKeyboardButton(text="❌ Отмена", callback_data=f"usr_card_{uid}")
    ])
    kb = InlineKeyboardMarkup(inline_keyboard=buttons)
    await callback.message.answer(
        f"🎁 <b>Выберите товар для выдачи пользователю ID <code>{uid}</code>:</b>\n"
        f"<i>(Товар будет списан со склада или выдан с отметкой администратора)</i>",
        parse_mode=ParseMode.HTML,
        reply_markup=kb,
    )


@dp.callback_query(F.data.startswith("do_grant_"))
async def handle_do_grant_product(callback: types.CallbackQuery, bot: Bot):
    admin_id = callback.from_user.id
    if not db.is_staff(admin_id):
        return
    parts = callback.data.split("_")
    pid = parts[2]
    uid = int(parts[3])

    res, err = db.admin_grant_product(uid, pid)
    if err:
        await callback.answer(f"Ошибка: {err}", show_alert=True)
        return

    await callback.answer("Товар успешно выдан!")
    await callback.message.answer(
        f"✅ <b>Товар успешно выдан пользователю ID <code>{uid}</code>!</b>\n\n"
        f"• Товар: <b>{res['product_title']}</b>\n"
        f"• Номер заказа: <code>{res['order_id']}</code>\n"
        f"• Данные: <code>{res['credentials']}</code>\n"
        f"• Срок: до <b>{res['expires_at']}</b>\n\n"
        f"<i>Покупателю отправлено мгновенное уведомление в Telegram.</i>",
        parse_mode=ParseMode.HTML,
    )

    try:
        await bot.send_message(
            chat_id=uid,
            text=(
                f"🎁 <b>Вам выдан товар от администрации Kotik Store!</b>\n\n"
                f"Подписка: <b>{res['product_title']}</b>\n"
                f"Номер заказа: <code>{res['order_id']}</code>\n"
                f"Данные для входа:\n<code>{res['credentials']}</code>\n\n"
                f"⚡ <i>Гарантия активна до: {res['expires_at']}</i> 🐾"
            ),
            parse_mode=ParseMode.HTML,
        )
    except Exception as e:
        logger.warning(f"Could not send grant message to user {uid}: {e}")


# --- Fast Stock Upload & Order Clearing ---
@dp.callback_query(F.data == "admin_fast_stock")
async def handle_admin_fast_stock(callback: types.CallbackQuery):
    if not db.is_staff(callback.from_user.id):
        await callback.answer("Доступ запрещен!", show_alert=True)
        return
    await callback.answer()

    prods = db.get_products_list()
    lines = [
        "⚡ <b>Быстрая загрузка товара на склад</b>\n",
        "Выберите товар ниже, чтобы загрузить для него строки или .txt файл в 1 клик:\n"
    ]
    buttons = []
    for p in prods:
        buttons.append([
            InlineKeyboardButton(
                text=f"⚡ Загрузить: {p['title']}",
                callback_data=f"restock_prod_{p['id']}"
            )
        ])
    buttons.append([
        InlineKeyboardButton(text="🔙 Назад в админку", callback_data="btn_admin_menu")
    ])
    kb = InlineKeyboardMarkup(inline_keyboard=buttons)
    await callback.message.answer("\n".join(lines), parse_mode=ParseMode.HTML, reply_markup=kb)


@dp.callback_query(F.data == "admin_confirm_clear_orders")
async def handle_admin_confirm_clear_orders(callback: types.CallbackQuery):
    if not db.is_staff(callback.from_user.id):
        return
    await callback.answer()
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="⚠️ ДА, ОЧИСТИТЬ ВСЕ ЗАКАЗЫ", callback_data="admin_do_clear_orders"),
        ],
        [
            InlineKeyboardButton(text="❌ Отмена", callback_data="btn_admin_menu")
        ]
    ])
    await callback.message.answer(
        "🗑 <b>Очистка истории заказов</b>\n\n"
        "Вы уверены, что хотите удалить все заказы из базы данных?\n"
        "<i>Это действие удалит старые заказы и сбросит счетчики.</i>",
        parse_mode=ParseMode.HTML,
        reply_markup=kb,
    )


@dp.callback_query(F.data == "admin_do_clear_orders")
async def handle_admin_do_clear_orders(callback: types.CallbackQuery):
    if not db.is_staff(callback.from_user.id):
        return
    db.clear_all_orders()
    await callback.answer("Все заказы очищены!", show_alert=True)
    await callback.message.answer(
        "✅ <b>История заказов успешно очищена!</b>\nВсе заказы удалены из базы, счетчики покупок сброшены на 0.",
        parse_mode=ParseMode.HTML,
    )
    await handle_admin(callback.message)


@dp.callback_query(F.data == "admin_stock")
async def handle_admin_stock(callback: types.CallbackQuery):
    if not db.is_staff(callback.from_user.id):
        await callback.answer("Доступ запрещен!", show_alert=True)
        return
    await callback.answer()

    summary = db.get_stock_summary()
    lines = [
        "📦 <b>Склад и управление остатками</b>\n",
        "Выберите товар ниже, чтобы пополнить его склад (текстом или .txt файлом):\n"
    ]
    buttons = []
    for item in summary:
        icon = "🟢" if item["count"] > 0 else "🔴"
        lines.append(f"{icon} <b>{item['title']}</b>: {item['count']} шт.")
        buttons.append([
            InlineKeyboardButton(
                text=f"📥 Пополнить: {item['title']} ({item['count']} шт)",
                callback_data=f"restock_prod_{item['id']}"
            )
        ])

    buttons.append([InlineKeyboardButton(text="🔙 Назад в админку", callback_data="btn_admin_menu")])
    kb = InlineKeyboardMarkup(inline_keyboard=buttons)
    await callback.message.answer("\n".join(lines), parse_mode=ParseMode.HTML, reply_markup=kb)


@dp.callback_query(F.data.startswith("restock_prod_"))
async def handle_select_restock_product(callback: types.CallbackQuery):
    admin_id = callback.from_user.id
    if not db.is_staff(admin_id):
        return

    prod_id = callback.data.replace("restock_prod_", "")
    prods = db.get_products_list()
    prod_title = prod_id
    for p in prods:
        if p["id"] == prod_id:
            prod_title = p["title"]
            break

    admin_session_state[admin_id] = {
        "action": "restock",
        "product_id": prod_id,
        "title": prod_title,
    }

    await callback.answer()
    msg = (
        f"📥 <b>Пополнение склада: {prod_title}</b>\n\n"
        f"Отправьте данные (ключи или <code>логин:пароль</code>):\n"
        f"• <b>Текстовым сообщением</b> (каждый аккаунт с новой строки)\n"
        f"• 📄 <b>Или пришлите .txt файл с базой</b>!\n\n"
        f"<i>Бот автоматически разберет строки и добавит на склад.</i>"
    )
    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="❌ Отмена", callback_data="cancel_admin_state")
    ]])
    await callback.message.answer(msg, parse_mode=ParseMode.HTML, reply_markup=kb)


@dp.callback_query(F.data == "cancel_admin_state")
async def handle_cancel_admin_state(callback: types.CallbackQuery):
    admin_id = callback.from_user.id
    admin_session_state.pop(admin_id, None)
    await callback.answer("Действие отменено")
    try:
        await callback.message.edit_text("❌ Действие отменено. Возврат в админ-панель.")
    except Exception:
        pass
    await handle_admin(callback.message)


@dp.callback_query(F.data.startswith("alert_restock_"))
async def handle_alert_restock_cb(callback: types.CallbackQuery, bot: Bot):
    parts = callback.data.split("_")
    # alert_restock_{prod_id}_{count}
    prod_id = parts[2]
    count = parts[3] if len(parts) > 3 else "10"

    prods = db.get_products_list()
    prod_title = prod_id
    for p in prods:
        if p["id"] == prod_id:
            prod_title = p["title"]
            break

    await callback.answer("Рассылка запущена...")
    try:
        await callback.message.edit_reply_markup(reply_markup=None)
    except Exception:
        pass

    users = db.get_all_user_ids()
    sent = 0
    msg = (
        f"🔥 <b>Новое поступление на склад Kotik Store!</b>\n\n"
        f"📦 <b>{prod_title}</b> снова в наличии (<b>+{count} шт.</b>)!\n\n"
        f"⚡ <i>Успейте забрать подписку с моментальной автовыдачей 24/7!</i>"
    )
    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="⚡ Открыть Kotik Store", web_app=WebAppInfo(url=WEBAPP_URL))
    ]])

    for uid in users:
        try:
            await bot.send_message(chat_id=uid, text=msg, parse_mode=ParseMode.HTML, reply_markup=kb)
            sent += 1
            await asyncio.sleep(0.04)
        except Exception:
            pass

    await callback.message.answer(f"📢 Оповещение о товаре <b>{prod_title}</b> успешно отправлено {sent} пользователям!", parse_mode=ParseMode.HTML)


# --- Ticket System Callbacks ---
@dp.callback_query(F.data.startswith("ticket_reply_"))
async def handle_ticket_reply_cb(callback: types.CallbackQuery):
    admin_id = callback.from_user.id
    if not db.is_staff(admin_id):
        await callback.answer("Доступ запрещен!", show_alert=True)
        return

    parts = callback.data.split("_")
    ticket_id = int(parts[2])
    target_user_id = int(parts[3])

    admin_session_state[admin_id] = {
        "action": "reply_ticket",
        "ticket_id": ticket_id,
        "user_id": target_user_id,
    }

    await callback.answer()
    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="❌ Отмена", callback_data="cancel_admin_state")
    ]])
    await callback.message.answer(
        f"✍️ <b>Ответ на тикет #T-{ticket_id} (ID: <code>{target_user_id}</code>)</b>\n\n"
        f"Отправьте текст ответа следующим сообщением:",
        parse_mode=ParseMode.HTML,
        reply_markup=kb,
    )


@dp.callback_query(F.data.startswith("ticket_close_"))
async def handle_ticket_close_cb(callback: types.CallbackQuery):
    if not db.is_staff(callback.from_user.id):
        return
    parts = callback.data.split("_")
    ticket_id = int(parts[2])
    db.close_ticket(ticket_id)
    await callback.answer(f"Тикет #T-{ticket_id} закрыт!")
    try:
        await callback.message.edit_text(callback.message.text + "\n\n<i>[✅ Тикет закрыт]</i>", parse_mode=ParseMode.HTML)
    except Exception:
        pass


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


# =====================================================================
# INCOMING MESSAGES (TICKETS & ADMIN RESTOCK TEXT / DOCUMENT)
# =====================================================================
@dp.message(F.document)
async def handle_incoming_document(message: types.Message, bot: Bot):
    user_id = message.from_user.id
    if user_id in admin_session_state and admin_session_state[user_id].get("action") == "restock":
        state = admin_session_state[user_id]
        prod_id = state["product_id"]
        prod_title = state["title"]
        admin_session_state.pop(user_id, None)

        try:
            file_info = await bot.get_file(message.document.file_id)
            import io
            file_bytes = io.BytesIO()
            await bot.download_file(file_info.file_path, destination=file_bytes)
            file_bytes.seek(0)
            text_content = file_bytes.read().decode("utf-8", errors="replace")
            clean_lines = [l.strip() for l in text_content.splitlines() if l.strip()]

            if not clean_lines:
                await message.answer("⚠️ Файл пуст или не содержит строк с данными.")
                return

            added_count = db.bulk_add_stock(prod_id, clean_lines)
            kb = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="📢 Да, оповестить пользователей", callback_data=f"alert_restock_{prod_id}_{added_count}")],
                [InlineKeyboardButton(text="❌ Нет, без оповещения", callback_data="admin_stock")],
            ])
            await message.answer(
                f"✅ <b>Файл успешно обработан!</b>\n\n"
                f"📦 <b>Товар:</b> <b>{prod_title}</b>\n"
                f"🔢 <b>Добавлено позиций:</b> <code>+{added_count} шт.</code>\n\n"
                f"📢 <b>Желаете отправить оповещение пользователям о новом дропе?</b>",
                parse_mode=ParseMode.HTML,
                reply_markup=kb,
            )
        except Exception as e:
            await message.answer(f"❌ Ошибка при чтении файла: {e}")


@dp.message(F.text & ~F.text.startswith("/"))
async def handle_incoming_text(message: types.Message, bot: Bot):
    user_id = message.from_user.id

    # 1. Check if admin is in active state (Restock or Reply Ticket)
    if user_id in admin_session_state:
        state = admin_session_state[user_id]
        action = state.get("action")

        if action == "reply_ticket":
            ticket_id = state["ticket_id"]
            target_user_id = state["user_id"]
            admin_session_state.pop(user_id, None)

            # Save to DB
            db.add_ticket_message(ticket_id, "admin", user_id, message.text)

            # Send to customer
            user_msg = (
                f"💬 <b>Ответ службы заботы Kotik Store (Тикет #T-{ticket_id}):</b>\n\n"
                f"<i>{message.text}</i>\n\n"
                f"🐾 <i>Если у вас остались вопросы, вы можете нажать «Поддержка» и написать снова.</i>"
            )
            try:
                await bot.send_message(chat_id=target_user_id, text=user_msg, parse_mode=ParseMode.HTML)
                await message.answer(f"✅ Ответ успешно доставлен клиенту (ID: <code>{target_user_id}</code>)!")
            except Exception as e:
                await message.answer(f"⚠️ Не удалось доставить сообщение клиенту: {e}")
            return

        elif action == "restock":
            prod_id = state["product_id"]
            prod_title = state["title"]
            admin_session_state.pop(user_id, None)

            raw_lines = message.text.splitlines()
            clean_lines = [l.strip() for l in raw_lines if l.strip()]
            if not clean_lines:
                await message.answer("⚠️ Не обнаружено строк для добавления. Попробуйте снова.")
                return

            added_count = db.bulk_add_stock(prod_id, clean_lines)
            kb = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="📢 Да, оповестить пользователей", callback_data=f"alert_restock_{prod_id}_{added_count}")],
                [InlineKeyboardButton(text="❌ Нет, без оповещения", callback_data="admin_stock")],
            ])
            await message.answer(
                f"✅ <b>Склад успешно пополнен!</b>\n\n"
                f"📦 <b>Товар:</b> <b>{prod_title}</b>\n"
                f"🔢 <b>Добавлено:</b> <code>+{added_count} шт.</code>\n\n"
                f"📢 <b>Желаете отправить оповещение пользователям о новом дропе?</b>",
                parse_mode=ParseMode.HTML,
                reply_markup=kb,
            )
            return

        elif action == "enter_balance_amount":
            target_uid = state["target_uid"]
            admin_session_state.pop(user_id, None)
            try:
                delta = float(message.text.strip().replace("$", "").replace(",", "."))
                new_bal, err = db.admin_adjust_user_balance(target_uid, delta)
                if err:
                    await message.answer(f"❌ Ошибка: {err}")
                    return
                sign = "+" if delta >= 0 else ""
                await message.answer(
                    f"✅ <b>Баланс пользователя ID <code>{target_uid}</code> изменен!</b>\n\n"
                    f"Сумма: <b>{sign}${delta:.2f}</b>\n"
                    f"Новый баланс: <b>${new_bal:.2f}</b>",
                    parse_mode=ParseMode.HTML,
                )
                try:
                    await bot.send_message(
                        chat_id=target_uid,
                        text=(
                            f"💰 <b>Изменение баланса в Kotik Store!</b>\n\n"
                            f"Администратор скорректировал ваш баланс: <b>{sign}${delta:.2f}</b>!\n"
                            f"Текущий баланс: <b>${new_bal:.2f}</b> 🐾\n\n"
                            f"⚡ <i>Вы можете использовать баланс для покупки любых подписок!</i>"
                        ),
                        parse_mode=ParseMode.HTML,
                    )
                except Exception as e:
                    logger.warning(f"Could not notify user {target_uid}: {e}")
            except ValueError:
                await message.answer("⚠️ Неверный формат. Введите число (например: 5 или 10.5).")
            return

        elif action == "enter_user_search":
            query = message.text.strip().lstrip("@").lower()
            admin_session_state.pop(user_id, None)
            users = db.get_all_users_detailed()
            matched = []
            for u in users:
                uid_str = str(u["telegram_id"])
                uname = (u.get("username") or "").lower()
                fname = (u.get("first_name") or "").lower()
                if query in uid_str or query in uname or query in fname:
                    matched.append(u)

            if not matched:
                await message.answer(f"⚠️ По запросу «{message.text}» ничего не найдено.")
                return

            lines = [f"🔍 <b>Результаты поиска ({len(matched)}):</b>\n"]
            buttons = []
            for u in matched[:8]:
                nick = f"@{u['username']}" if u.get('username') else (u.get('first_name') or f"ID:{u['telegram_id']}")
                buttons.append([
                    InlineKeyboardButton(
                        text=f"👤 {nick} (${u['balance']:.2f})",
                        callback_data=f"usr_card_{u['telegram_id']}"
                    )
                ])
            buttons.append([InlineKeyboardButton(text="👥 К списку всех", callback_data="admin_users_menu")])
            kb = InlineKeyboardMarkup(inline_keyboard=buttons)
            await message.answer("\n".join(lines), parse_mode=ParseMode.HTML, reply_markup=kb)
            return

    # 2. Check if user is sending a support ticket
    if user_support_state.get(user_id):
        user_support_state.pop(user_id, None)
        username = message.from_user.username or ""
        ticket_id = db.create_ticket(user_id, username, message.text)

        await message.answer(
            f"✅ <b>Ваше обращение принято! (Тикет #T-{ticket_id})</b>\n\n"
            f"Оператор службы заботы уже уведомлен и ответит вам прямо в этот диалог в течение нескольких минут. 🐾",
            parse_mode=ParseMode.HTML,
        )

        # Notify admins
        user_str = f"@{username.lstrip('@')}" if username else f"ID <code>{user_id}</code>"
        now_str = datetime.now().strftime("%d.%m.%Y %H:%M:%S")
        admin_alert = (
            f"🎫 <b>[НОВОЕ ОБРАЩЕНИЕ В ПОДДЕРЖКУ #T-{ticket_id}]</b>\n\n"
            f"👤 <b>От:</b> {user_str} (<code>{user_id}</code>)\n"
            f"🕒 <b>Время:</b> {now_str}\n\n"
            f"💬 <b>Вопрос / Проблема:</b>\n"
            f"<i>{message.text}</i>"
        )
        admin_kb = InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(text="✍️ Ответить пользователю", callback_data=f"ticket_reply_{ticket_id}_{user_id}"),
                InlineKeyboardButton(text="✅ Закрыть тикет", callback_data=f"ticket_close_{ticket_id}"),
            ]
        ])
        await notify_all_admins(bot, admin_alert)
        return


# =====================================================================
# EXTENDED REST API (BROADCAST, COUPONS, QUESTS, EXPORT)
# =====================================================================
async def handle_api_broadcast(request: web.Request):
    """POST /api/v1/broadcast"""
    try:
        data = await request.json()
        text = data.get("text", "").strip()
        photo_url = data.get("photo_url", "").strip()
        btn_text = data.get("btn_text", "").strip()
        btn_url = data.get("btn_url", "").strip()
        lang_filter = data.get("lang", "all")

        if not text:
            return web.json_response({"ok": False, "error": "Текст рассылки пуст"}, status=400)

        users = db.get_users_for_broadcast(lang_filter)
        sent = 0

        kb = None
        if btn_text and btn_url:
            if btn_url.startswith("webapp:"):
                kb = InlineKeyboardMarkup(inline_keyboard=[[
                    InlineKeyboardButton(text=btn_text, web_app=WebAppInfo(url=btn_url.replace("webapp:", "")))
                ]])
            else:
                kb = InlineKeyboardMarkup(inline_keyboard=[[
                    InlineKeyboardButton(text=btn_text, url=btn_url)
                ]])

        if bot_instance:
            for u in users:
                try:
                    uid = u["telegram_id"]
                    if photo_url:
                        await bot_instance.send_photo(chat_id=uid, photo=photo_url, caption=text, parse_mode=ParseMode.HTML, reply_markup=kb)
                    else:
                        await bot_instance.send_message(chat_id=uid, text=text, parse_mode=ParseMode.HTML, reply_markup=kb)
                    sent += 1
                    await asyncio.sleep(0.04)
                except Exception:
                    pass

        return web.json_response({"ok": True, "sent": sent, "total": len(users)})
    except Exception as e:
        logger.error(f"Broadcast API error: {e}")
        return web.json_response({"ok": False, "error": str(e)}, status=400)


async def handle_api_coupon_validate(request: web.Request):
    """POST /api/v1/coupon/validate"""
    try:
        data = await request.json()
        code = data.get("code", "")
        coupon, err = db.validate_coupon(code)
        if err:
            return web.json_response({"ok": False, "error": err}, status=400)
        return web.json_response({
            "ok": True,
            "code": coupon["code"],
            "discount_percent": coupon["discount_percent"],
        })
    except Exception as e:
        return web.json_response({"ok": False, "error": str(e)}, status=400)


async def handle_api_coupons_list(request: web.Request):
    """GET /api/v1/coupons"""
    coupons = db.get_all_coupons()
    return web.json_response({"ok": True, "coupons": coupons})


async def handle_api_coupon_create(request: web.Request):
    """POST /api/v1/coupon/create"""
    try:
        data = await request.json()
        code = data.get("code", "")
        disc = float(data.get("discount_percent", 10))
        max_uses = int(data.get("max_uses", 500))
        db.create_coupon(code, disc, max_uses)
        return web.json_response({"ok": True})
    except Exception as e:
        return web.json_response({"ok": False, "error": str(e)}, status=400)


async def handle_api_quests_list(request: web.Request):
    """GET /api/v1/quests?user_id=..."""
    try:
        uid = int(request.query.get("user_id", 0))
        quests = db.get_user_quests(uid)
        return web.json_response({"ok": True, "quests": quests})
    except Exception as e:
        return web.json_response({"ok": False, "error": str(e)}, status=400)


async def handle_api_quests_claim(request: web.Request):
    """POST /api/v1/quests/claim"""
    try:
        data = await request.json()
        uid = int(data.get("user_id", 0))
        qid = data.get("quest_id", "")
        ok, res = db.claim_quest_reward(uid, qid)
        if not ok:
            return web.json_response({"ok": False, "error": res}, status=400)
        return web.json_response({"ok": True, "reward": res})
    except Exception as e:
        return web.json_response({"ok": False, "error": str(e)}, status=400)


async def handle_api_export_orders_csv(request: web.Request):
    """GET /api/v1/export/orders.csv"""
    orders = db.export_all_orders()
    import csv, io
    output = io.StringIO()
    output.write('\ufeff')  # UTF-8 BOM for Excel
    writer = csv.writer(output, delimiter=';')
    writer.writerow(["ID Заказа", "Дата", "ID Пользователя", "Username", "Товар", "Цена ($)", "Статус", "Выданный контент/ключ"])
    for o in orders:
        writer.writerow([
            o["id"],
            o["created_at"],
            o["user_id"],
            o["username"] or "",
            o["product_title"],
            f"{o['price']:.2f}",
            o["status"],
            o["item_content"] or "",
        ])
    csv_data = output.getvalue()
    return web.Response(
        text=csv_data,
        content_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=kotikstore_orders_{datetime.now().strftime('%Y-%m-%d')}.csv"
        }
    )


async def handle_api_admin_users(request: web.Request):
    """GET /api/v1/admin/users - Returns list of registered SQLite users."""
    try:
        users = db.get_all_users_detailed()
        return web.json_response({"ok": True, "users": users})
    except Exception as e:
        return web.json_response({"ok": False, "error": str(e)}, status=400)


async def handle_api_admin_user_balance(request: web.Request):
    """POST /api/v1/admin/user/balance - Adjust balance and notify user."""
    try:
        data = await request.json()
        telegram_id = int(data.get("telegram_id"))
        delta = float(data.get("delta", 0.0))
        reason = data.get("reason", "Пополнение администратором")
        new_balance, err = db.admin_adjust_user_balance(telegram_id, delta, reason)
        if err:
            return web.json_response({"ok": False, "error": err}, status=400)

        # Notify user in Telegram
        if bot_instance:
            try:
                sign = "+" if delta >= 0 else ""
                await bot_instance.send_message(
                    chat_id=telegram_id,
                    text=(
                        f"💰 <b>Изменение баланса в Kotik Store!</b>\n\n"
                        f"Администратор скорректировал ваш баланс: <b>{sign}${delta:.2f}</b>\n"
                        f"Текущий баланс: <b>${new_balance:.2f}</b> 🐾\n\n"
                        f"<i>Причина: {reason}</i>"
                    ),
                    parse_mode=ParseMode.HTML,
                )
            except Exception as notify_err:
                logger.warning(f"Failed to notify user {telegram_id}: {notify_err}")

        return web.json_response({"ok": True, "new_balance": new_balance})
    except Exception as e:
        return web.json_response({"ok": False, "error": str(e)}, status=400)


async def handle_api_admin_user_grant(request: web.Request):
    """POST /api/v1/admin/user/grant - Grant product to user."""
    try:
        data = await request.json()
        telegram_id = int(data.get("telegram_id"))
        product_id = data.get("product_id")
        credentials = data.get("credentials", "")
        res, err = db.admin_grant_product(telegram_id, product_id, credentials)
        if err:
            return web.json_response({"ok": False, "error": err}, status=400)

        # Notify user in Telegram
        if bot_instance:
            try:
                await bot_instance.send_message(
                    chat_id=telegram_id,
                    text=(
                        f"🎁 <b>Вам выдан товар в Kotik Store!</b>\n\n"
                        f"Товар: <b>{res['product_title']}</b>\n"
                        f"Номер заказа: <code>{res['order_id']}</code>\n"
                        f"Данные для доступа:\n<code>{res['credentials']}</code>\n\n"
                        f"⚡ <i>Подписка активна до: {res['expires_at']}</i>"
                    ),
                    parse_mode=ParseMode.HTML,
                )
            except Exception as notify_err:
                logger.warning(f"Failed to notify user {telegram_id}: {notify_err}")

        return web.json_response({"ok": True, "order": res})
    except Exception as e:
        return web.json_response({"ok": False, "error": str(e)}, status=400)


async def handle_api_admin_orders_clear(request: web.Request):
    """POST /api/v1/admin/orders/clear - Wipes all orders in database."""
    try:
        db.clear_all_orders()
        return web.json_response({"ok": True, "message": "All orders cleared"})
    except Exception as e:
        return web.json_response({"ok": False, "error": str(e)}, status=400)


# --- Background Subscription Expiration Reminder Worker ---
async def subscription_reminder_worker(bot: Bot):
    """Periodically checks expiring subscriptions and notifies customers."""
    while True:
        try:
            await asyncio.sleep(3600)  # Check every 1 hour
            orders = db.get_expiring_orders()
            now = datetime.now()
            for o in orders:
                exp_str = o.get("expires_at")
                if not exp_str:
                    continue
                try:
                    exp_dt = datetime.strptime(exp_str, "%Y-%m-%d %H:%M:%S")
                    diff_days = (exp_dt - now).total_seconds() / 86400.0
                    if 0 < diff_days <= 3.5:
                        user_id = o["user_id"]
                        title = o["product_title"]
                        days_label = "3 дня" if diff_days > 1.5 else "24 часа"
                        reminder_msg = (
                            f"⏰ <b>Котик напоминает!</b>\n\n"
                            f"Ваша подписка на <b>{title}</b> заканчивается через <b>{days_label}</b>.\n\n"
                            f"⚡ Чтобы не прерывать доступ к вашим проектам, продлите подписку со скидкой 10% прямо сейчас по промокоду <code>KOTIK10</code> 👇"
                        )
                        kb = InlineKeyboardMarkup(inline_keyboard=[[
                            InlineKeyboardButton(text="⚡ Продлить со скидкой", web_app=WebAppInfo(url=WEBAPP_URL))
                        ]])
                        await bot.send_message(chat_id=user_id, text=reminder_msg, parse_mode=ParseMode.HTML, reply_markup=kb)
                        db.mark_order_reminder_sent(o["id"])
                except Exception as e:
                    logger.warning(f"Error checking reminder for order {o.get('id')}: {e}")
        except Exception as e:
            logger.error(f"Subscription reminder worker error: {e}")


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

    # New Extended REST Endpoints
    app.router.add_post("/api/v1/broadcast", handle_api_broadcast)
    app.router.add_post("/api/v1/coupon/validate", handle_api_coupon_validate)
    app.router.add_get("/api/v1/coupons", handle_api_coupons_list)
    app.router.add_post("/api/v1/coupon/create", handle_api_coupon_create)
    app.router.add_get("/api/v1/quests", handle_api_quests_list)
    app.router.add_post("/api/v1/quests/claim", handle_api_quests_claim)
    app.router.add_get("/api/v1/export/orders.csv", handle_api_export_orders_csv)

    # Admin Users & Management API
    app.router.add_get("/api/v1/admin/users", handle_api_admin_users)
    app.router.add_post("/api/v1/admin/user/balance", handle_api_admin_user_balance)
    app.router.add_post("/api/v1/admin/user/grant", handle_api_admin_user_grant)
    app.router.add_post("/api/v1/admin/orders/clear", handle_api_admin_orders_clear)

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

    # Start background subscription reminder worker
    asyncio.create_task(subscription_reminder_worker(bot_instance))

    await dp.start_polling(bot_instance)


if __name__ == "__main__":
    asyncio.run(main())
