CREATE TABLE products(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT NOT NULL CHECK(LENGTH(TRIM(product_name)) != 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX product_name_unique ON products (LOWER(product_name COLLATE "tr-TR-x-icu"));