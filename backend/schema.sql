CREATE TABLE IF NOT EXISTS markets (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    question TEXT NOT NULL,
    current_probability REAL,
    outcomes TEXT, -- JSON array of outcome labels
    clob_token_ids TEXT, -- JSON array of token IDs for CLOB
    slug TEXT, -- For external linking
    price_change_24h REAL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market_tags (
    market_id TEXT,
    country_code TEXT,
    PRIMARY KEY (market_id, country_code),
    FOREIGN KEY (market_id) REFERENCES markets(id)
);

CREATE TABLE IF NOT EXISTS market_history (
    market_id TEXT,
    outcome_label TEXT,
    price REAL,
    timestamp TIMESTAMP,
    PRIMARY KEY (market_id, outcome_label, timestamp),
    FOREIGN KEY (market_id) REFERENCES markets(id)
);
