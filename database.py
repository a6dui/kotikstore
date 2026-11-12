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
            language TEXT DEFAULT 'ru',
            created_at TEXT
        );
    """)

    # Try migrate column if not exists
    try:
        cur.execute("ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'ru'")
    except Exception:
        pass

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
            created_at TEXT,
            expires_at TEXT,
            reminder_sent INTEGER DEFAULT 0
        );
    """)

    # Try migrate columns if table already existed
    try:
        cur.execute("ALTER TABLE orders ADD COLUMN expires_at TEXT")
    except Exception:
        pass
    try:
        cur.execute("ALTER TABLE orders ADD COLUMN reminder_sent INTEGER DEFAULT 0")
    except Exception:
        pass

    # 7. Coupons / Promo Codes Table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS coupons (
            code TEXT PRIMARY KEY,
            discount_percent REAL,
            max_uses INTEGER DEFAULT 1000,
            used_count INTEGER DEFAULT 0,
            expires_at TEXT,
            is_active INTEGER DEFAULT 1
        );
    """)

    # 8. Quests & Bounties Tables
    cur.execute("""
        CREATE TABLE IF NOT EXISTS quests (
            id TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            reward REAL,
            icon TEXT,
            action_url TEXT,
            action_type TEXT,
            target INTEGER DEFAULT 1
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS user_quests (
            user_id INTEGER,
            quest_id TEXT,
            progress INTEGER DEFAULT 0,
            status TEXT DEFAULT 'available', -- 'available', 'completed', 'claimed'
            completed_at TEXT,
            claimed_at TEXT,
            PRIMARY KEY (user_id, quest_id)
        );
    """)

    # 9. Support Tickets System
    cur.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT,
            subject TEXT,
            status TEXT DEFAULT 'open', -- 'open', 'answered', 'closed'
            created_at TEXT,
            closed_at TEXT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS ticket_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id INTEGER,
            sender_type TEXT, -- 'user' or 'admin'
            sender_id INTEGER,
            text TEXT,
            sent_at TEXT
        );
    """)

    # 10. Settings Table
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

    # Seed Default Coupons
    default_coupons = [
        ('KOTIK10', 10.0, 500),
        ('KOTIKNEWS', 15.0, 1000),
        ('WELCOME', 5.0, 2000),
    ]
    for ccode, cdisc, cmax in default_coupons:
        cur.execute("""
            INSERT OR IGNORE INTO coupons (code, discount_percent, max_uses, used_count, is_active)
            VALUES (?, ?, ?, 0, 1)
        """, (ccode, cdisc, cmax))

    # Seed Default Quests
    default_quests = [
        ('quest_channel', 'Подпишись на резервный канал @KotikNews_shop', 'Эксклюзивные промокоды и свежие раздачи подписок', 0.50, '📢', 'https://t.me/KotikNews_shop', 'channel_sub', 1),
        ('quest_invite_3', 'Пригласи 3 друзей в бота', 'Поделитесь своей реферальной ссылкой с 3 контактами', 1.00, '👥', '', 'invite_friends', 3),
        ('quest_review', 'Оставь отзыв о сервисе с фото', 'Честное мнение о купленной подписке в разделе Отзывы', 0.50, '⭐', '', 'leave_review', 1),
        ('quest_first_order', 'Соверши первую покупку', 'Оформите любой тариф на витрине Kotik Store', 1.00, '🛒', '', 'make_order', 1),
    ]
    for qid, qtitle, qdesc, qrew, qicon, qurl, qtype, qtarget in default_quests:
        cur.execute("""
            INSERT OR IGNORE INTO quests (id, title, description, reward, icon, action_url, action_type, target)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (qid, qtitle, qdesc, qrew, qicon, qurl, qtype, qtarget))

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
            'Доступ к o1, GPT-4o, Canvas, Sora и DALL-E 3 без ограничений. Цена: $22 (1 870 ₽). Формат выдачи: login:pass (или login:pass:2FA).',
            'Вход на chatgpt.com с полученным логином и паролем. Если в аккаунте указан 2FA-ключ, вставьте его на 2fa.live для генерации 6-значного кода.'
        ),
        (
            'gemini-advanced', 'Gemini Advanced', 'text_code', 10.0, 7.0,
            'Gemini 2.5 Flash с контекстом 2 000 000 токенов и 2ТБ Google Drive. Цена: $10 (850 ₽).',
            'Примите инвайт в Google Family по отправленной ссылке или войдите по данным login:pass.'
        ),
        (
            'claude-cdk', 'Claude CDK', 'text_code', 26.0, 18.0,
            'Claude CDK — подписка с доступом к Claude 3.7 Sonnet для разработчиков, API и кода. Цена: $26 (2 210 ₽). Формат выдачи: login:pass (или login:pass:2FA).',
            'Вход на claude.ai по выданным данным: login:pass (или login:pass:2FA). При наличии 2FA сгенерируйте 6-значный код на сайте 2fa.live.'
        ),
        (
            'claude-verify', 'Claude (Верификация под ключ)', 'text_code', 28.0, 20.0,
            'Готовая зарубежная верификация аккаунта Claude под ключ с чистым IP. Цена: $28 (2 380 ₽). Формат выдачи: login:pass (или login:pass:2FA).',
            'Выдается готовый верифицированный аккаунт формата login:pass (или login:pass:2FA). Аккаунт полностью готов к работе.'
        ),
        (
            'grok-ai', 'Grok AI (X Premium+)', 'text_code', 16.0, 12.0,
            'Нейросеть без цензуры от Илона Маска. Генерация картинок FLUX. Цена: $16 (1 360 ₽). Формат: login:pass (или login:pass:2FA).',
            'Вход в аккаунт X с привязанной подпиской Premium+. Формат: login:pass (или login:pass:2FA).'
        ),
        (
            'elevenlabs', 'ElevenLabs Pro', 'voice_video', 6.0, 4.0,
            'Идеальное клонирование голоса и аудио-генерация речи. Цена: $6 (510 ₽). Формат: login:pass или API ключ.',
            'Используйте данные login:pass или API ключ в настройках ElevenLabs.'
        ),
        (
            'capcut-pro', 'CapCut Pro', 'voice_video', 4.0, 2.5,
            'Все PRO функции монтажа, умное удаление фона и эффекты. Цена: $4 (340 ₽). Формат: login:pass.',
            'Вход по выданным данным login:pass в мобильном или ПК клиенте CapCut.'
        ),
    ]
    cur.execute("DELETE FROM products WHERE id = 'claude-3-7-pro'")
    cur.execute("DELETE FROM stock_items WHERE product_id = 'claude-3-7-pro'")

    for pid, ptitle, pcat, pprice, pcost, pdesc, pinstr in products:
        cur.execute("""
            INSERT OR REPLACE INTO products (id, title, category_id, price, cost_price, description, instruction)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (pid, ptitle, pcat, pprice, pcost, pdesc, pinstr))

    # Stock is initially clean (0 items). Items are added via Admin Dashboard or API.

    # Seed settings
    cur.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('x2_bonus', 'off')")
    cur.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('support_contact', '@Zykolandstore')")
    cur.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('channel_link', 'https://t.me/KotikNews_shop')")

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


def set_user_language(telegram_id: int, lang: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE users SET language = ? WHERE telegram_id = ?", (lang, telegram_id))
    conn.commit()
    conn.close()


def get_user_language(telegram_id: int) -> str:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT language FROM users WHERE telegram_id = ?", (telegram_id,))
    row = cur.fetchone()
    conn.close()
    if row and row["language"]:
        return row["language"]
    return "ru"


# --- Staff & Permissions Helpers ---
def get_staff_role(telegram_id: int | str) -> str | None:
    try:
        tid = int(telegram_id)
    except Exception:
        return None

    if tid in (OWNER_TELEGRAM_ID, 755843448):
        return "super_admin"
    if tid == 7643717312:
        return "admin"

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT role FROM admins WHERE telegram_id = ?", (tid,))
    row = cur.fetchone()
    conn.close()
    return row["role"] if row else None


def is_staff(telegram_id: int | str) -> bool:
    try:
        tid = int(telegram_id)
    except Exception:
        return False
    if tid in (OWNER_TELEGRAM_ID, 755843448, 7643717312):
        return True
    return get_staff_role(tid) is not None


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


# --- Products & Categories Helpers ---
def get_products_list():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT p.*, COUNT(s.id) as stock_count
        FROM products p
        LEFT JOIN stock_items s ON p.id = s.product_id AND s.is_sold = 0
        WHERE p.is_active = 1
        GROUP BY p.id
    """)
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


def get_categories_list():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM categories")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


def update_product_db(product_id: str, title: str, category_id: str, price: float, description: str = "", instruction: str = ""):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE products
        SET title = ?, category_id = ?, price = ?, description = ?, instruction = ?
        WHERE id = ?
    """, (title, category_id, price, description, instruction, product_id))
    conn.commit()
    conn.close()


def update_product_description(product_id: str, description: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE products SET description = ? WHERE id = ?", (description.strip(), product_id))
    conn.commit()
    conn.close()


def update_product_instruction(product_id: str, instruction: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE products SET instruction = ? WHERE id = ?", (instruction.strip(), product_id))
    conn.commit()
    conn.close()


def create_api_order(user_id: int, product_id: str, contact: str = ""):
    conn = get_connection()
    cur = conn.cursor()
    
    # 1. Check product
    cur.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    prod = cur.fetchone()
    if not prod:
        conn.close()
        return None, "Товар не найден"
    
    price = prod["price"]
    title = prod["title"]

    # 2. Find available stock item
    cur.execute("SELECT id, content FROM stock_items WHERE product_id = ? AND is_sold = 0 LIMIT 1", (product_id,))
    stock_row = cur.fetchone()

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    order_id = f"KTK-{int(datetime.now().timestamp())}"

    item_content = ""
    if stock_row:
        stock_id = stock_row["id"]
        item_content = stock_row["content"]
        cur.execute("""
            UPDATE stock_items
            SET is_sold = 1, sold_to = ?, sold_at = ?
            WHERE id = ?
        """, (user_id, now_str, stock_id))
    else:
        # Pre-order delivery (0 stock on warehouse)
        item_content = f"Подключение по контакту: {contact} (Менеджер выдаст в течение 10 минут)"

    # 3. Insert order
    cur.execute("""
        INSERT INTO orders (id, user_id, product_id, product_title, item_content, price, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
    """, (order_id, user_id, product_id, title, item_content, price, now_str))

    # 4. Update user orders_count & total_spent
    cur.execute("""
        UPDATE users
        SET orders_count = orders_count + 1,
            total_spent = total_spent + ?
        WHERE telegram_id = ?
    """, (price, user_id))

    conn.commit()
    conn.close()

    return {
        "order_id": order_id,
        "product_id": product_id,
        "product_title": title,
        "price": price,
        "login_data": item_content,
        "status": "completed" if stock_row else "processing",
        "created_at": now_str,
    }, None


def get_order_by_id(order_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


# --- Bulk Stock Import ---
def bulk_add_stock(product_id: str, items_list: list[str]) -> int:
    """Adds multiple accounts/keys to warehouse for a given product."""
    conn = get_connection()
    cur = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    count = 0
    for item in items_list:
        content = item.strip()
        if content:
            cur.execute("""
                INSERT INTO stock_items (product_id, content, added_at, is_sold)
                VALUES (?, ?, ?, 0)
            """, (product_id, content, now_str))
            count += 1
    conn.commit()
    conn.close()
    return count


# --- Coupons / Promo Codes ---
def validate_coupon(code: str):
    """Validates coupon code, returns discount percent if valid."""
    conn = get_connection()
    cur = conn.cursor()
    clean_code = code.strip().upper()
    cur.execute("SELECT * FROM coupons WHERE code = ? AND is_active = 1", (clean_code,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None, "Промокод не найден или недействителен"
    coupon = dict(row)
    if coupon["used_count"] >= coupon["max_uses"]:
        return None, "Лимит использований промокода исчерпан"
    return coupon, None


def use_coupon(code: str):
    conn = get_connection()
    cur = conn.cursor()
    clean_code = code.strip().upper()
    cur.execute("UPDATE coupons SET used_count = used_count + 1 WHERE code = ?", (clean_code,))
    conn.commit()
    conn.close()


def get_all_coupons():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM coupons ORDER BY discount_percent DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


def create_coupon(code: str, discount_percent: float, max_uses: int = 500):
    conn = get_connection()
    cur = conn.cursor()
    clean_code = code.strip().upper()
    cur.execute("""
        INSERT INTO coupons (code, discount_percent, max_uses, used_count, is_active)
        VALUES (?, ?, ?, 0, 1)
        ON CONFLICT(code) DO UPDATE SET discount_percent = excluded.discount_percent, max_uses = excluded.max_uses, is_active = 1
    """, (clean_code, discount_percent, max_uses))
    conn.commit()
    conn.close()


def delete_coupon(code: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM coupons WHERE code = ?", (code.strip().upper(),))
    conn.commit()
    conn.close()


# --- Support Tickets ---
def create_ticket(user_id: int, username: str, message_text: str):
    conn = get_connection()
    cur = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cur.execute("""
        INSERT INTO tickets (user_id, username, subject, status, created_at)
        VALUES (?, ?, ?, 'open', ?)
    """, (user_id, username or "", message_text[:60], now_str))
    ticket_id = cur.lastrowid
    cur.execute("""
        INSERT INTO ticket_messages (ticket_id, sender_type, sender_id, text, sent_at)
        VALUES (?, 'user', ?, ?, ?)
    """, (ticket_id, user_id, message_text, now_str))
    conn.commit()
    conn.close()
    return ticket_id


def get_open_ticket(user_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tickets WHERE user_id = ? AND status != 'closed' ORDER BY id DESC LIMIT 1", (user_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def get_ticket(ticket_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tickets WHERE id = ?", (ticket_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def add_ticket_message(ticket_id: int, sender_type: str, sender_id: int, text: str):
    conn = get_connection()
    cur = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cur.execute("""
        INSERT INTO ticket_messages (ticket_id, sender_type, sender_id, text, sent_at)
        VALUES (?, ?, ?, ?, ?)
    """, (ticket_id, sender_type, sender_id, text, now_str))
    new_status = 'answered' if sender_type == 'admin' else 'open'
    cur.execute("UPDATE tickets SET status = ? WHERE id = ?", (new_status, ticket_id))
    conn.commit()
    conn.close()


def close_ticket(ticket_id: int):
    conn = get_connection()
    cur = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cur.execute("UPDATE tickets SET status = 'closed', closed_at = ? WHERE id = ?", (now_str, ticket_id))
    conn.commit()
    conn.close()


def get_all_tickets():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tickets ORDER BY id DESC LIMIT 50")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


# --- Subscription Expiration Reminders ---
def get_expiring_orders():
    """Finds active orders where expiry reminder should be checked."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT * FROM orders
        WHERE status = 'active'
          AND reminder_sent = 0
          AND expires_at IS NOT NULL
    """)
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


def mark_order_reminder_sent(order_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE orders SET reminder_sent = 1 WHERE id = ?", (order_id,))
    conn.commit()
    conn.close()


# --- Broadcast Users ---
def get_users_for_broadcast(lang_filter: str = "all"):
    conn = get_connection()
    cur = conn.cursor()
    if lang_filter in ("ru", "en"):
        cur.execute("SELECT telegram_id, language FROM users WHERE language = ?", (lang_filter,))
    else:
        cur.execute("SELECT telegram_id, language FROM users")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


# --- Quests & Bounties ---
def get_user_quests(user_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT q.*,
               COALESCE(uq.progress, 0) as progress,
               COALESCE(uq.status, 'available') as status
        FROM quests q
        LEFT JOIN user_quests uq ON q.id = uq.quest_id AND uq.user_id = ?
    """, (user_id,))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


def claim_quest_reward(user_id: int, quest_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM quests WHERE id = ?", (quest_id,))
    quest = cur.fetchone()
    if not quest:
        conn.close()
        return False, "Задание не найдено"

    reward = quest["reward"]
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cur.execute("""
        INSERT INTO user_quests (user_id, quest_id, progress, status, completed_at, claimed_at)
        VALUES (?, ?, ?, 'claimed', ?, ?)
        ON CONFLICT(user_id, quest_id) DO UPDATE SET status = 'claimed', claimed_at = excluded.claimed_at
    """, (user_id, quest_id, quest["target"], now_str, now_str))

    # Add reward to user balance
    cur.execute("UPDATE users SET balance = balance + ? WHERE telegram_id = ?", (reward, user_id))
    conn.commit()
    conn.close()
    return True, f"+${reward:.2f}"


# --- Export All Orders ---
def export_all_orders():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT o.id, o.created_at, o.user_id, u.username, o.product_title, o.price, o.status, o.item_content
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.telegram_id
        ORDER BY o.created_at DESC
    """)
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


# --- Detailed Users Management & Manual Grants ---
def get_all_users_detailed():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT u.telegram_id, u.username, u.first_name, u.balance, u.orders_count, u.total_spent, u.language, u.created_at,
               a.role as admin_role
        FROM users u
        LEFT JOIN admins a ON u.telegram_id = a.telegram_id
        ORDER BY u.created_at DESC
    """)
    rows = []
    for r in cur.fetchall():
        d = dict(r)
        d["is_staff"] = bool(d.get("admin_role") or d["telegram_id"] == OWNER_TELEGRAM_ID or d["telegram_id"] == 7643717312)
        if d["telegram_id"] == OWNER_TELEGRAM_ID:
            d["admin_role"] = "super_admin"
        elif d["telegram_id"] == 7643717312 and not d.get("admin_role"):
            d["admin_role"] = "admin"
        rows.append(d)
    conn.close()
    return rows


def get_user_full_profile(telegram_id: int):
    """Returns complete user profile including stats, roles, and order history."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE telegram_id = ?", (telegram_id,))
    user = cur.fetchone()
    if not user:
        conn.close()
        return None
    d = dict(user)

    # Admin role check
    cur.execute("SELECT role FROM admins WHERE telegram_id = ?", (telegram_id,))
    admin_row = cur.fetchone()
    if telegram_id == OWNER_TELEGRAM_ID:
        d["role"] = "super_admin"
        d["is_staff"] = True
    elif admin_row:
        d["role"] = admin_row["role"]
        d["is_staff"] = True
    elif telegram_id == 7643717312:
        d["role"] = "admin"
        d["is_staff"] = True
    else:
        d["role"] = "user"
        d["is_staff"] = False

    # Fetch user orders
    cur.execute("""
        SELECT id, product_id, product_title, price, item_content, status, created_at, expires_at
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
    """, (telegram_id,))
    d["orders"] = [dict(r) for r in cur.fetchall()]

    conn.close()
    return d


def toggle_user_staff_role(telegram_id: int, requester_id: int = 0):
    """Toggles admin role for a user."""
    if telegram_id == OWNER_TELEGRAM_ID:
        return False, "Нельзя изменить права главного владельца магазина"

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM admins WHERE telegram_id = ?", (telegram_id,))
    existing = cur.fetchone()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if existing:
        cur.execute("DELETE FROM admins WHERE telegram_id = ?", (telegram_id,))
        cur.execute("UPDATE users SET role = 'user' WHERE telegram_id = ?", (telegram_id,))
        conn.commit()
        conn.close()
        return True, "removed"
    else:
        cur.execute("SELECT username, first_name FROM users WHERE telegram_id = ?", (telegram_id,))
        u = cur.fetchone()
        uname = u["username"] if u and u["username"] else ""
        fname = u["first_name"] if u and u["first_name"] else "Staff"
        cur.execute("""
            INSERT INTO admins (telegram_id, username, name, role, added_at, added_by)
            VALUES (?, ?, ?, 'admin', ?, ?)
        """, (telegram_id, uname, fname, now_str, str(requester_id)))
        cur.execute("UPDATE users SET role = 'admin' WHERE telegram_id = ?", (telegram_id,))
        conn.commit()
        conn.close()
        return True, "granted"


def admin_adjust_user_balance(telegram_id: int, delta: float, reason: str = "Admin adjustment"):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT balance FROM users WHERE telegram_id = ?", (telegram_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return None, "Пользователь не найден"
    new_balance = max(0.0, round(row["balance"] + delta, 2))
    cur.execute("UPDATE users SET balance = ? WHERE telegram_id = ?", (new_balance, telegram_id))
    conn.commit()
    conn.close()
    return new_balance, None


def admin_grant_product(telegram_id: int, product_id: str, custom_credentials: str = ""):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    prod = cur.fetchone()
    if not prod:
        conn.close()
        return None, "Товар не найден"

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    expires_str = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
    order_id = f"KOTIK-{uuid.uuid4().hex[:8].upper()}"

    item_content = custom_credentials.strip()
    if not item_content:
        # Pull from stock if available
        cur.execute("SELECT * FROM stock_items WHERE product_id = ? AND is_sold = 0 LIMIT 1", (product_id,))
        stock_row = cur.fetchone()
        if stock_row:
            item_content = stock_row["content"]
            cur.execute("UPDATE stock_items SET is_sold = 1, sold_at = ? WHERE id = ?", (now_str, stock_row["id"]))
        else:
            item_content = f"Подписка {prod['title']}: Активирована администратором вручную"

    cur.execute("""
        INSERT INTO orders (id, user_id, product_id, product_title, price, item_content, status, created_at, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, ?)
    """, (order_id, telegram_id, product_id, prod["title"], 0.0, item_content, now_str, expires_str))

    cur.execute("UPDATE users SET orders_count = orders_count + 1 WHERE telegram_id = ?", (telegram_id,))
    conn.commit()
    conn.close()
    return {
        "order_id": order_id,
        "product_title": prod["title"],
        "credentials": item_content,
        "expires_at": expires_str,
    }, None


def clear_all_orders():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM orders")
    cur.execute("UPDATE users SET orders_count = 0, total_spent = 0.0")
    conn.commit()
    conn.close()
    return True


# Initialize DB on module import
init_db()
