-- Database schema and sample data for the pizza delivery app (PostgreSQL / Neon).
-- Run once: psql "$DATABASE_URL" -f db/schema.sql

-- ---------- auth (tables used by the Auth.js adapter in apps/web/src/auth.js) ----------
CREATE TABLE IF NOT EXISTS auth_users (
  id              SERIAL PRIMARY KEY,
  name            TEXT,
  email           TEXT UNIQUE,
  "emailVerified" TIMESTAMPTZ,
  image           TEXT,
  role            TEXT NOT NULL DEFAULT 'customer'
);

CREATE TABLE IF NOT EXISTS auth_accounts (
  id                  SERIAL PRIMARY KEY,
  "userId"            INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  type                TEXT NOT NULL,
  provider            TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          BIGINT,
  id_token            TEXT,
  scope               TEXT,
  session_state       TEXT,
  token_type          TEXT,
  password            TEXT
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id             SERIAL PRIMARY KEY,
  "userId"       INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  expires        TIMESTAMPTZ NOT NULL,
  "sessionToken" TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS auth_verification_token (
  identifier TEXT NOT NULL,
  expires    TIMESTAMPTZ NOT NULL,
  token      TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ---------- ingredients ----------
CREATE TABLE IF NOT EXISTS pizza_bases (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL, price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0), image_url TEXT
);
CREATE TABLE IF NOT EXISTS sauces (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL, price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0), image_url TEXT
);
CREATE TABLE IF NOT EXISTS cheeses (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL, price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0), image_url TEXT
);
CREATE TABLE IF NOT EXISTS veggies (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL, price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0), image_url TEXT
);
CREATE TABLE IF NOT EXISTS meats (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL, price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0), image_url TEXT
);

-- ---------- orders ----------
CREATE TABLE IF NOT EXISTS orders (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
  total_price    NUMERIC(10,2) NOT NULL,
  payment_id     TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  status         TEXT NOT NULL DEFAULT 'Order Received'
    CHECK (status IN ('Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id            SERIAL PRIMARY KEY,
  order_id      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  pizza_base_id INTEGER REFERENCES pizza_bases(id),
  sauce_id      INTEGER REFERENCES sauces(id),
  cheese_id     INTEGER REFERENCES cheeses(id),
  price         NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS order_item_veggies (
  order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  veggie_id     INTEGER NOT NULL REFERENCES veggies(id)
);
CREATE TABLE IF NOT EXISTS order_item_meats (
  order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  meat_id       INTEGER NOT NULL REFERENCES meats(id)
);

-- low-stock alert thresholds (checked after every order)
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id              SERIAL PRIMARY KEY,
  item_type       TEXT NOT NULL CHECK (item_type IN ('pizza_base', 'sauce', 'cheese', 'veggie', 'meat')),
  item_id         INTEGER NOT NULL,
  threshold_value INTEGER NOT NULL DEFAULT 20,
  last_alert_sent TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);

-- ---------- sample data (only inserted into empty tables) ----------
INSERT INTO pizza_bases (name, price, stock_quantity)
SELECT * FROM (VALUES
  ('Thin Crust', 120, 100), ('Classic Hand Tossed', 140, 100), ('Cheese Burst', 190, 100),
  ('Whole Wheat', 150, 100), ('Gluten Free', 200, 100)) v
WHERE NOT EXISTS (SELECT 1 FROM pizza_bases);

INSERT INTO sauces (name, price, stock_quantity)
SELECT * FROM (VALUES
  ('Classic Tomato', 30, 100), ('Pesto', 50, 100), ('Barbecue', 40, 100),
  ('White Garlic', 45, 100), ('Spicy Arrabbiata', 40, 100)) v
WHERE NOT EXISTS (SELECT 1 FROM sauces);

INSERT INTO cheeses (name, price, stock_quantity)
SELECT * FROM (VALUES
  ('Mozzarella', 60, 100), ('Cheddar', 55, 100), ('Parmesan', 70, 100),
  ('Provolone', 65, 100), ('Vegan Cheese', 80, 100)) v
WHERE NOT EXISTS (SELECT 1 FROM cheeses);

INSERT INTO veggies (name, price, stock_quantity)
SELECT * FROM (VALUES
  ('Onion', 15, 100), ('Capsicum', 20, 100), ('Mushroom', 25, 100), ('Black Olives', 25, 100),
  ('Sweet Corn', 20, 100), ('Jalapeno', 20, 100), ('Tomato', 15, 100), ('Paneer', 40, 100)) v
WHERE NOT EXISTS (SELECT 1 FROM veggies);

INSERT INTO meats (name, price, stock_quantity)
SELECT * FROM (VALUES
  ('Chicken Tikka', 60, 100), ('Pepperoni', 70, 100), ('Grilled Chicken', 55, 100),
  ('Sausage', 65, 100), ('Bacon', 75, 100)) v
WHERE NOT EXISTS (SELECT 1 FROM meats);

INSERT INTO inventory_alerts (item_type, item_id, threshold_value)
SELECT t, id, 20 FROM (
  SELECT 'pizza_base' AS t, id FROM pizza_bases UNION ALL SELECT 'sauce', id FROM sauces
  UNION ALL SELECT 'cheese', id FROM cheeses UNION ALL SELECT 'veggie', id FROM veggies
  UNION ALL SELECT 'meat', id FROM meats) all_items
WHERE NOT EXISTS (SELECT 1 FROM inventory_alerts);
