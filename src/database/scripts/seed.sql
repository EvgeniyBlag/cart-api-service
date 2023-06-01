CREATE TYPE STATUS AS ENUM ('OPEN', 'ORDERED');

CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS carts (
    id uuid PRIMARY KEY NOT NULL,
    user_id uuid NOT NULL REFERENCES users(id),
    status STATUS NOT NULL,
    created_at DATE DEFAULT CURRENT_DATE NOT NULL,
    updated_at DATE DEFAULT CURRENT_DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
    cart_id uuid REFERENCES carts(id) NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    count integer NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY NOT NULL,
    user_id uuid REFERENCES users(id),
    cart_id uuid REFERENCES carts(id),
    payment JSON NOT NULL,
    delivery JSON NOT NULL,
    comments VARCHAR(255),
    status VARCHAR(255) NOT NULL,
    total INTEGER NOT NULL
);

INSERT INTO users (id, name, email, password) VALUES 
    ('9dff97f9-d658-4126-a6f0-a1e72c7dd99e', 'Eugene', 'eugene@test.mail', 'eugene_password'),
    ('5f9caf4f-5d52-48d0-b5c7-80f7df6ed78c', 'Michael', 'michael@test.mail', 'michael_password'),
    ('209a9f45-92c9-46b5-ad3f-05904fba182d', 'Test User', 'test_user@test.mail', 'test_user_password'),
    ('689d94fd-64ad-477b-9d0a-e915a05fc34d', 'Test Data', 'test_data@test.mail' , 'test_data_password')
ON CONFLICT (id) DO NOTHING;

INSERT INTO carts (id, user_id, created_at, updated_at, status) VALUES 
    ('49ce0906-9e9f-4259-83a4-700168f1089e', '9dff97f9-d658-4126-a6f0-a1e72c7dd99e', CURRENT_DATE, CURRENT_DATE, 'ORDERED'),
    ('51b9a758-6327-4349-944e-adb3eae314fe', '5f9caf4f-5d52-48d0-b5c7-80f7df6ed78c', CURRENT_DATE, CURRENT_DATE, 'ORDERED'),
    ('404faacc-2373-40da-adc6-52467414026b', '209a9f45-92c9-46b5-ad3f-05904fba182d', CURRENT_DATE, CURRENT_DATE, 'OPEN'),
    ('4a6dc0a3-1163-4aa4-afdd-bb2789584f83', '689d94fd-64ad-477b-9d0a-e915a05fc34d', CURRENT_DATE, CURRENT_DATE, 'OPEN');

INSERT INTO cart_items (cart_id, product_id, count) VALUES 
    ('49ce0906-9e9f-4259-83a4-700168f1089e', 'YP45', 10),
    ('51b9a758-6327-4349-944e-adb3eae314fe', 'YP515', 5),
    ('404faacc-2373-40da-adc6-52467414026b', 'YNP12', 8);

INSERT INTO orders (id, user_id, cart_id, payment, delivery, comments, status, total) VALUES 
    ('fe633edb-9f61-4718-ac13-573746ba034f', '9dff97f9-d658-4126-a6f0-a1e72c7dd99e', '49ce0906-9e9f-4259-83a4-700168f1089e', '{ "type": "CARD" }', '{ "type": "POST" }', 'Test comment', 'inProgress', 10),
    ('c741180a-c9ad-408b-bccc-fd679722c5c9', '5f9caf4f-5d52-48d0-b5c7-80f7df6ed78c', '51b9a758-6327-4349-944e-adb3eae314fe', '{ "type": "CASH" }', '{ "type": "POST" }', 'Test comment for Order 2', 'completed', 5);