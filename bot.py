import asyncio
import logging
import os
import sys

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

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("KotikStoreBot")

# Production WebApp URL
WEBAPP_URL = os.environ.get("WEBAPP_URL", "https://a6dui.github.io/kotikstore/").strip()

# Path to mascot image
MASCOT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "kotik-hero.jpg")

dp = Dispatcher()


# --- Keyboards ---
def get_main_reply_keyboard(is_staff: bool = False) -> ReplyKeyboardMarkup:
    """Standard bottom persistent keyboard with Kotik main menu buttons."""
    keyboard = [
        [KeyboardButton(text="🐱 Открыть Kotik Store", web_app=WebAppInfo(url=WEBAPP_URL))],
        [KeyboardButton(text="👤 Мой кабинет"), KeyboardButton(text="💬 Поддержка")],
        [KeyboardButton(text="📜 Соглашение"), KeyboardButton(text="🛡️ Гарантия и возврат")],
    ]
    if is_staff:
        keyboard.append([KeyboardButton(text="⚙️ Панель управления (/admin)")])
    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)


def get_main_inline_keyboard(is_staff: bool = False) -> InlineKeyboardMarkup:
    """Inline keyboard under the hero welcome message."""
    buttons = [
        [
            InlineKeyboardButton(
                text="⚡ Открыть Kotik Store",
                web_app=WebAppInfo(url=WEBAPP_URL),
            )
        ],
        [
            InlineKeyboardButton(text="📜 Соглашение", callback_data="btn_rules"),
            InlineKeyboardButton(text="🛡️ Гарантии", callback_data="btn_warranty"),
        ],
        [
            InlineKeyboardButton(text="💬 Поддержка (@KotikSupport)", url="https://t.me/KotikSupport"),
            InlineKeyboardButton(text="📢 Наш Канал", url="https://t.me/KotikChannel"),
        ],
    ]
    if is_staff:
        buttons.append([
            InlineKeyboardButton(text="⚙️ Админ-панель", callback_data="btn_admin_menu")
        ])
    return InlineKeyboardMarkup(inline_keyboard=buttons)


def get_admin_inline_keyboard() -> InlineKeyboardMarkup:
    """Keyboard inside /admin control panel."""
    # WebApp URL with admin flag for authorized users
    admin_webapp_url = f"{WEBAPP_URL}?admin=1"

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
                InlineKeyboardButton(text="📢 Рассылка", callback_data="admin_broadcast_info"),
            ],
            [
                InlineKeyboardButton(
                    text="🔙 Вернуться до котика в главное меню",
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
    first_name = message.from_user.first_name or "Котик-Друг"

    # Save to SQLite DB
    db.get_or_create_user(user_id, username, first_name)
    is_admin = db.is_staff(user_id)

    # Set Menu Button
    try:
        await bot.set_chat_menu_button(
            chat_id=message.chat.id,
            menu_button=MenuButtonWebApp(
                text="🐱 Kotik Store",
                web_app=WebAppInfo(url=WEBAPP_URL),
            ),
        )
    except Exception as e:
        logger.warning(f"Could not set menu button: {e}")

    welcome_text = (
        f"👋 <b>Привет, {first_name}!</b>\n\n"
        "Добро пожаловать в официальный бот <b>Kotik Store</b> — магазин лучших ИИ-сервисов и цифровых подписок!\n\n"
        "✨ <b>В наличии нейросети с моментальной автовыдачей:</b>\n"
        "• 🤖 <b>ChatGPT Plus</b> (o1, GPT-4o, Canvas, DALL-E)\n"
        "• ✨ <b>Gemini Advanced</b> (2M контекст, 2ТБ Google One)\n"
        "• 💻 <b>Claude 3.7 Sonnet Pro</b> (Топ для кода)\n"
        "• 🚀 <b>Grok AI</b> (X Premium+, без цензуры, FLUX)\n"
        "• 🎙 <b>ElevenLabs Pro</b> (Клонирование голоса)\n"
        "• 🎬 <b>CapCut Pro</b> (PRO эффекты и 4K рендер)\n\n"
        "⚡ <i>Гарантия на весь оплаченный период • Автовыдача 24/7</i>\n\n"
        "Нажмите <b>«Открыть Kotik Store»</b> ниже для входа в витрину 👇"
    )

    reply_kb = get_main_reply_keyboard(is_admin)
    inline_kb = get_main_inline_keyboard(is_admin)

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
            # Also send reply keyboard
            await message.answer("Меню управления закреплено внизу 🐾", reply_markup=reply_kb)
            return
        except Exception as e:
            logger.warning(f"Failed to send photo: {e}")

    await message.answer(
        text=welcome_text,
        parse_mode=ParseMode.HTML,
        reply_markup=inline_kb,
    )
    await message.answer("Меню управления закреплено внизу 🐾", reply_markup=reply_kb)


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
        f"💡 <i>Для управления персоналом используйте кнопки ниже или команды:\n"
        f"• <code>/addadmin &lt;ID&gt; [admin/moderator]</code>\n"
        f"• <code>/deladmin &lt;ID&gt;</code>\n"
        f"• <code>/broadcast &lt;текст&gt;</code></i>"
    )

    await message.answer(
        text=admin_text,
        parse_mode=ParseMode.HTML,
        reply_markup=get_admin_inline_keyboard(),
    )


# --- Navigation: Return to Kotik Main Menu ---
@dp.callback_query(F.data == "btn_back_to_kotik")
@dp.message(F.text.lower().contains("вернуться до котика"))
@dp.message(F.text.lower().contains("главное меню"))
async def handle_back_to_kotik(event: types.Message | types.CallbackQuery, bot: Bot):
    user = event.from_user
    is_admin = db.is_staff(user.id)

    text = (
        f"🐱 <b>Вы вернулись к Котику в главное меню!</b>\n\n"
        "Здесь вы можете зайти в магазин, прочитать соглашение и правила гарантии, или написать в поддержку:\n\n"
        "• <b>Витрина:</b> нажмите кнопку «Открыть Kotik Store»\n"
        "• <b>Поддержка:</b> @KotikSupport (работает 24/7)\n"
        "• <b>Гарантия:</b> 100% замена или возврат средств"
    )

    reply_kb = get_main_reply_keyboard(is_admin)
    inline_kb = get_main_inline_keyboard(is_admin)

    if isinstance(event, types.CallbackQuery):
        await event.answer("Возвращаемся к Котику... 🐾")
        await event.message.answer(text, parse_mode=ParseMode.HTML, reply_markup=inline_kb)
        await event.message.answer("Меню магазина активно внизу 👇", reply_markup=reply_kb)
    else:
        await event.answer(text, parse_mode=ParseMode.HTML, reply_markup=inline_kb)


# --- Policy & Rules Callbacks ---
@dp.callback_query(F.data == "btn_rules")
@dp.message(F.text == "📜 Соглашение")
async def handle_rules(event: types.Message | types.CallbackQuery):
    rules_text = (
        "📜 <b>Пользовательское соглашение Kotik Store</b>\n\n"
        "<b>1. Предмет соглашения:</b>\n"
        "Kotik Store предоставляет официальные доступы к цифровым подпискам и API-ключам ведущих нейросетей.\n\n"
        "<b>2. Порядок выдачи:</b>\n"
        "• Готовые аккаунты выдаются моментально ботом сразу после оплаты.\n"
        "• Личные подключения (upgrade вашего аккаунта) производятся в течение 5-15 минут.\n\n"
        "<b>3. Обязанности сторон:</b>\n"
        "Покупатель обязуется соблюдать правила сервисов (OpenAI, Anthropic, Google). Запрещены рассылки спама и противоправный контент.\n\n"
        "<i>Нажмите кнопку ниже, чтобы вернуться в главное меню</i>"
    )
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🔙 Вернуться до котика в главное меню", callback_data="btn_back_to_kotik")]
        ]
    )
    if isinstance(event, types.CallbackQuery):
        await event.answer()
        await event.message.answer(rules_text, parse_mode=ParseMode.HTML, reply_markup=kb)
    else:
        await event.answer(rules_text, parse_mode=ParseMode.HTML, reply_markup=kb)


@dp.callback_query(F.data == "btn_warranty")
@dp.message(F.text == "🛡️ Гарантия и возврат")
async def handle_warranty(event: types.Message | types.CallbackQuery):
    warranty_text = (
        "🛡️ <b>Гарантийные обязательства и возврат</b>\n\n"
        "• <b>100% Гарантия:</b> Действует на весь оплаченный срок действия подписки (1, 3, 6 или 12 месяцев).\n"
        "• <b>Бесплатная замена:</b> Если аккаунт перестал работать по техническим причинам, поддержка производит бесплатную замену в течение 30 минут.\n"
        "• <b>Возврат средств:</b> Если замена невозможна, баланс возвращается в полном объеме.\n\n"
        "💬 <b>Служба поддержки:</b> @KotikSupport"
    )
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="💬 Написать в поддержку", url="https://t.me/KotikSupport")],
            [InlineKeyboardButton(text="🔙 Вернуться до котика в главное меню", callback_data="btn_back_to_kotik")],
        ]
    )
    if isinstance(event, types.CallbackQuery):
        await event.answer()
        await event.message.answer(warranty_text, parse_mode=ParseMode.HTML, reply_markup=kb)
    else:
        await event.answer(warranty_text, parse_mode=ParseMode.HTML, reply_markup=kb)


@dp.message(F.text == "💬 Поддержка")
async def handle_support(message: types.Message):
    await message.answer(
        "💬 <b>Служба поддержки Kotik Store</b>\n\n"
        "Возник вопрос по заказу, оплате или требуется помощь с активацией?\n\n"
        "• Прямой контакт: @KotikSupport\n"
        "• Время ответа: от 2 до 15 минут\n"
        "• График: 24/7 без выходных",
        parse_mode=ParseMode.HTML,
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="💬 Написать @KotikSupport", url="https://t.me/KotikSupport")],
                [InlineKeyboardButton(text="🔙 Вернуться до котика в главное меню", callback_data="btn_back_to_kotik")],
            ]
        ),
    )


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


# --- Admin Commands: /addadmin and /deladmin ---
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


# --- Main Entry Point ---
async def main():
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    if not bot_token:
        # Prompt if run interactively
        try:
            bot_token = input("Введите токен вашего Telegram бота (из @BotFather): ").strip()
        except EOFError:
            bot_token = ""

    if not bot_token:
        print("Ошибка: Токен бота не указан!")
        sys.exit(1)

    bot = Bot(token=bot_token)
    print("==================================================")
    print("🚀 Kotik Store Telegram Bot успешно запущен!")
    print(f"🔗 WebApp URL: {WEBAPP_URL}")
    print(f"👑 Владелец ID: {db.OWNER_TELEGRAM_ID}")
    print("==================================================")

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
