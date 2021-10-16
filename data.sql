\c messagely

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS messages;

CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    join_at timestamp without time zone NOT NULL,
    last_login_at timestamp with time zone
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    from_username text NOT NULL REFERENCES users,
    to_username text NOT NULL REFERENCES users,
    body text NOT NULL,
    sent_at timestamp with time zone NOT NULL,
    read_at timestamp with time zone
);

INSERT INTO users (username, password, first_name, last_name, phone, join_at)
    VALUES ('Paulie', 'passy1', 'Paulie', 'Walnuts', '8673509', NOW()),
            ('Dolly', 'passy1', 'Dolly', 'Perdon', '8679909', NOW()),
            ('Madyis', 'passy1', 'Madison', 'Igd', '5551817', NOW());

INSERT INTO messages (from_username, to_username, body, sent_at, read_at)            
    VALUES ('Paulie', 'Dolly', 'Hi loser', NOW(), NOW()),
            ('Paulie', 'Dolly', 'Hi loser2', NOW(), NULL),
            ('Paulie', 'Dolly', 'Hi loser3', NOW(), NULL),
            ('Paulie', 'Madyis', 'Hi loser4', NOW(), NOW()),
            ('Dolly', 'Paulie', 'Hi loser5', NOW(), NOW()),
            ('Dolly', 'Paulie',  'Hi loser6', NOW(), NULL),
            ('Dolly', 'Paulie', 'Hi loser7', NOW(), NULL),
            ('Madyis', 'Paulie', 'Hi lose8', NOW(), NOW());