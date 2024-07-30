-- Create Plantations Table
CREATE TABLE plantations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    requires_pass BOOLEAN DEFAULT FALSE
);