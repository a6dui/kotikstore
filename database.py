import sqlite3
import os
import logging
from datetime import datetime

logger = logging.getLogger("KotikStoreDB")
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "kotikstore.db")

OWNER_TELEGRAM_ID = 755843448


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cur = conn.cursor()

    # 1. Users Table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            telegram_id INTEGER PRIMARY KEY,
            username TEXT,
            first_name TEXT,
            balance REAL DEFAULT 0.0,
            orders_count INTEGER DEFAULT 0,
            total_spent REAL DEFAULT 0.0,
            daily_streak INTEGER DEFAULT 0,
            last_daily_claim TEXT,
            role TEXT DEFAULT 'user',
            created_at TEXT
        );
    """)

    # 2. Admins & Staff Table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS admins (
            telegram_id INTEGER PRIMARY KEY,
            username TEXT,
            name TEXT,
            role TEXT DEFAULT 'admin', -- 'super_admin', 'admin', 'moderator'
            added_at TEXT,
            added_by TEXT
        );
    """)

    # 3. Categories Table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT,
            emoji TEXT
        );
    """)

    # 4. Products Table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            title TEXT,
            category_id TEXT,
            price REAL,
            cost_price REAL DEFAULT 0.0,
            description TEXT,
            instruction TEXT,
            is_active INTEGER DEFAULT 1
        );
    """)

    # 5. Stock Items Warehouse
    cur.execute("""
        CREATE TABLE IF NOT EXISTS stock_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id TEXT,
            content TEXT,
            is_sold INTEGER DEFAULT 0,
            sold_to INTEGER,
            sold_at TEXT,
            added_at TEXT
        );
    """)

    # 6. Orders Table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            product_id TEXT,
            product_title TEXT,
            item_content TEXT,
            price REAL,
            status TEXT DEFAULT 'active', -- 'active', 'refunded'
            created_at TEXT
        );
    """)

    # 7. Settings Table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );
    """)

    conn.commit()

    # Seed Default Staff (Primary Owner)
    cur.execute("SELECT telegram_id FROM admins WHERE telegram_id = ?", (OWNER_TELEGRAM_ID,))
    if not cur.fetchone():
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cur.execute("""
            INSERT INTO admins (telegram_id, username, name, role, added_at, added_by)
            VALUES (?, ?, ?, 'super_admin', ?, 'Система')
        """, (OWNER_TELEGRAM_ID, "kirabakuta", "Владелец (Owner)", now_str))

    # Seed Default Categories
    categories = [
        ('all', 'Все', '✨'),
        ('text_code', 'Текст и Код', '💻'),
        ('voice_video', 'Голос и Видео', '🎬'),
        ('vpn_security', 'VPN и Защита', '🛡️'),
    ]
    for cid, cname, cemoji in categories:
        cur.execute("INSERT OR IGNORE INTO categories (id, name, emoji) VALUES (?, ?, ?)", (cid, cname, cemoji))

    # Seed Default Products
    products = [
        (
            'chatgpt-plus', 'ChatGPT Plus', 'text_code', 22.0, 16.0,
            'Доступ к o1, GPT-4o, Canvas, Sora и DALL-E 3 без ограничений.',
            'Вход на chatgpt.com с полученным логином и паролем.'
        ),
        (
            'gemini-advanced', 'Gemini Advanced', 'text_code', 10.0, 7.0,
            'Gemini 2.5 Flash с контекстным окном в 2 000 000 токенов и 2ТБ Google Drive.',
            'Примите инвайт в Google Family по отправленной ссылке.'
        ),
        (
            'claude-3-7-pro', 'Claude 3.7 Sonnet Pro', 'text_code', 24.0, 18.0,
            'Модель №1 в мире для кодинга, рефакторинга и сложных логических рассуждений.',
            'Вход на claude.ai через выданные учетные данные.'
        ),
        (
            'grok-ai', 'Grok AI (X Premium+)', 'text_code', 16.0, 12.0,
            'Нейросеть без цензуры от Илона Маска. Генерация картинок FLUX.',
            'Вход в аккаунт X с привязанной подпиской Premium+.'
        ),
        (
            'elevenlabs', 'ElevenLabs Pro', 'voice_video', 6.0, 4.0,
            'Идеальное клонирование голоса и аудио-генерация речи.',
            'Используйте API ключ в настройках ElevenLabs.'
        ),
        (
            'capcut-pro', 'CapCut Pro', 'voice_video', 4.0, 2.5,
            'Все PRO функции монтажа, умное удаление фона и эффекты.',
            'Вход по выданным данным в мобильном или ПК клиенте.'
        ),
    ]
    for pid, ptitle, pcat, pprice, pcost, pdesc, pinstr in products:
        cur.execute("""
            INSERT OR IGNORE INTO products (id, title, category_id, price, cost_price, description, instruction)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (pid, ptitle, pcat, pprice, pcost, pdesc, pinstr))

    # Seed Default Stock Items
    stock_seeds = [
        ('chatgpt-plus', 'kotik_gpt_pro_01@gmail.com:KotikPass2026!'),
        ('chatgpt-plus', 'kotik_gpt_pro_02@gmail.com:KotikPlusFast99!'),
        ('claude-3-7-pro', 'claude_coder_99@outlook.com:ClaudeSonnet#2026'),
        ('claude-3-7-pro', 'claude_team_code@outlook.com:SonnetDevSafe26'),
        ('elevenlabs', 'sk_eleven_9941a87b22f1c8d00923e_live'),
        ('elevenlabs', 'sk_eleven_b528f110c71a3994bb01a_live'),
        ('capcut-pro', 'capcut_cloud_vip1@mail.ru:CapCut4kEdit'),
        ('capcut-pro', 'capcut_cloud_vip2@mail.ru:FastCutRender2026'),
    ]
    for pid, content in stock_seeds:
        cur.execute("SELECT id FROM stock_items WHERE product_id = ? AND content = ?", (pid, content))
        if not cur.fetchone():
            cur.execute("""
                INSERT INTO stock_items (product_id, content, added_at)
                VALUES (?, ?, ?)
            """, (pid, content, datetime.now().strftime("%Y-%m-%d %H:%M:%S")))

    # Seed settings
    cur.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('x2_bonus', 'off')")
    cur.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('support_contact', '@KotikSupport')")
    cur.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('channel_link', 'https://t.me/KotikChannel')")

    conn.commit()
    conn.close()
    logger.info("Database initialized and seeded successfully.")


# --- User Helpers ---
def get_or_create_user(telegram_id: int, username: str = "", first_name: str = ""):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE telegram_id = ?", (telegram_id,))
    row = cur.fetchone()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if row:
        cur.execute("""
            UPDATE users SET username = ?, first_name = ? WHERE telegram_id = ?
        """, (username or row['username'], first_name or row['first_name'], telegram_id))
        conn.commit()
        cur.execute("SELECT * FROM users WHERE telegram_id = ?", (telegram_id,))
        user = dict(cur.fetchone())
    else:
        cur.execute("""
            INSERT INTO users (telegram_id, username, first_name, created_at)
            VALUES (?, ?, ?, ?)
        """, (telegram_id, username, first_name, now_str))
        conn.commit()
        cur.execute("SELECT * FROM users WHERE telegram_id = ?", (telegram_id,))
        user = dict(cur.fetchone())

    conn.close()
    return user


def get_user(telegram_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE telegram_id = ?", (telegram_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


# --- Staff & Permissions Helpers ---
def get_staff_role(telegram_id: int) -> str | None:
    if telegram_id == OWNER_TELEGRAM_ID:
        return "super_admin"

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT role FROM admins WHERE telegram_id = ?", (telegram_id,))
    row = cur.fetchone()
    conn.close()
    return row["role"] if row else None


def is_staff(telegram_id: int) -> bool:
    return get_staff_role(telegram_id) is not None


def get_all_admins():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT telegram_id, username, name, role, added_at, added_by FROM admins ORDER BY added_at ASC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


def add_admin(telegram_id: int, username: str, name: str, role: str = "admin", added_by: str = "Владелец"):
    conn = get_connection()
    cur = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cur.execute("""
        INSERT INTO admins (telegram_id, username, name, role, added_at, added_by)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(telegram_id) DO UPDATE SET role = excluded.role, username = excluded.username, name = excluded.name
    """, (telegram_id, username, name, role, now_str, added_by))
    conn.commit()
    conn.close()


def remove_admin(telegram_id: int):
    if telegram_id == OWNER_TELEGRAM_ID:
        return False  # Cannot delete owner
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM admins WHERE telegram_id = ?", (telegram_id,))
    conn.commit()
    conn.close()
    return True


# --- Stats & Stock Helpers ---
def get_stats():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM users")
    users_count = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM orders")
    orders_count = cur.fetchone()[0]

    cur.execute("SELECT COALESCE(SUM(price), 0.0) FROM orders WHERE status = 'active'")
    revenue = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM stock_items WHERE is_sold = 0")
    stock_count = cur.fetchone()[0]

    cur.execute("SELECT value FROM settings WHERE key = 'x2_bonus'")
    x2_val = cur.fetchone()
    x2_active = x2_val[0] == "on" if x2_val else False

    conn.close()
    return {
        "users_count": users_count,
        "orders_count": orders_count,
        "revenue": revenue,
        "stock_count": stock_count,
        "x2_active": x2_active,
    }


def get_stock_summary():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT p.id, p.title, COUNT(s.id) as count
        FROM products p
        LEFT JOIN stock_items s ON p.id = s.product_id AND s.is_sold = 0
        GROUP BY p.id, p.title
    """)
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


def toggle_x2():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT value FROM settings WHERE key = 'x2_bonus'")
    row = cur.fetchone()
    new_val = "off" if (row and row[0] == "on") else "on"
    cur.execute("UPDATE settings SET value = ? WHERE key = 'x2_bonus'", (new_val,))
    conn.commit()
    conn.close()
    return new_val == "on"


def get_all_user_ids():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT telegram_id FROM users")
    ids = [r[0] for r in cur.fetchall()]
    conn.close()
    return ids


# Initialize DB on module import
init_db()
