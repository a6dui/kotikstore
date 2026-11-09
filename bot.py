import asyncio
import logging
import os
import sys

from aiogram import Bot, Dispatcher, types
from aiogram.enums import ParseMode
from aiogram.filters import CommandStart
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    MenuButtonWebApp,
    WebAppInfo,
)

# WebApp URL deployed to GitHub Pages
WEBAPP_URL = "https://a6dui.github.io/kotikstore/"

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Load BOT_TOKEN from environment or use direct input
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()

dp = Dispatcher()


@dp.message(CommandStart())
async def command_start_handler(message: types.Message, bot: Bot) -> None:
    # Set Menu Button to open WebApp
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

    # Inline Keyboard with WebApp button
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="⚡ Открыть Kotik Store",
                    web_app=WebAppInfo(url=WEBAPP_URL),
                )
            ],
            [
                InlineKeyboardButton(
                    text="💬 Поддержка",
                    url="https://t.me/KotikSupport",
                ),
                InlineKeyboardButton(
                    text="📢 Наш Канал",
                    url="https://t.me/KotikChannel",
                ),
            ],
        ]
    )

    caption = (
        f"👋 <b>Привет, {message.from_user.first_name or 'друг'}!</b>\n\n"
        "Добро пожаловать в <b>Kotik Store</b> — магазин лучших ИИ-подписок и цифровых сервисов!\n\n"
        "✨ <b>В наличии:</b>\n"
        "• 🤖 ChatGPT Plus (o1, GPT-4o)\n"
        "• ✨ Gemini Advanced (2M tokens)\n"
        "• 💻 Claude 3.7 Sonnet Pro\n"
        "• 🚀 Grok AI (X Premium+)\n"
        "• 🎙 ElevenLabs Voice AI\n"
        "• 🎬 CapCut Pro\n\n"
        "⚡ <i>Моментальная автовыдача 24/7 и гарантия на весь срок!</i>\n\n"
        "Нажмите кнопку ниже, чтобы открыть витрину магазина 👇"
    )

    await message.answer(
        text=caption,
        parse_mode=ParseMode.HTML,
        reply_markup=keyboard,
    )


async def main():
    token = BOT_TOKEN
    if not token:
        token = input("Введите токен вашего Telegram бота (из @BotFather): ").strip()

    if not token:
        print("Ошибка: Токен бота не указан!")
        sys.exit(1)

    bot = Bot(token=token)
    print("==================================================")
    print("🚀 Kotik Store Telegram Bot запущен!")
    print(f"🔗 WebApp URL: {WEBAPP_URL}")
    print("==================================================")

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
