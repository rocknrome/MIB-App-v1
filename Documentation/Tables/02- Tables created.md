-- Create Job Types Table
CREATE TABLE job_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL
);

-- Create Teams Table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL
);

-- Create Clients Table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    street_address VARCHAR(255),
    city VARCHAR(100),
    state CHAR(2),
    zip INTEGER CHECK (zip >= 10000 AND zip <= 99999),
    tags TEXT[],
    phone VARCHAR(20) CHECK (phone ~ '^\+?[\d\s\-]{7,20}$'),
    email VARCHAR(255) UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    tax_exempt BOOLEAN DEFAULT FALSE,
    admin_notes TEXT,
    team_notes TEXT,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    plantation_id INT REFERENCES plantations(id),
    weekly BOOLEAN DEFAULT FALSE,
    client_type VARCHAR(50) CHECK (client_type IN ('Residential', 'Office', 'Vacation Place')),
    payment_method VARCHAR(50) CHECK (payment_method IN ('Credit Card', 'Zelle', 'Venmo', 'Check', 'Cash')),
    credit_card_number VARCHAR(20) CHECK (credit_card_number ~ '^\d{16}$'),
    credit_card_expiry VARCHAR(7) CHECK (credit_card_expiry ~ '^\d{2}/\d{2}$'),
    credit_card_cvv VARCHAR(4) CHECK (credit_card_cvv ~ '^\d{3,4}$'),
    billing_address_same BOOLEAN DEFAULT TRUE,
    billing_street_address VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state CHAR(2),
    billing_zip INTEGER CHECK (billing_zip >= 10000 AND billing_zip <= 99999),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Jobs Table
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    client_id INT REFERENCES clients(id) ON DELETE CASCADE,
    address VARCHAR(255),
    job_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    job_type_id INT REFERENCES job_types(id) ON DELETE SET NULL,
    job_frequency VARCHAR(20) CHECK (job_frequency IN ('One-time', 'Weekly', 'Bi-weekly', 'Monthly')),
    days_of_week VARCHAR(10)[],
    schedule_duration INT,
    team_instructions TEXT,
    admin_notes TEXT,
    billing_info TEXT,
    team_id INT REFERENCES teams(id) ON DELETE SET NULL,
    completion_status BOOLEAN DEFAULT FALSE,
    payment_amount NUMERIC(10, 2),
    is_paid BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(50) CHECK (payment_method IN ('Credit Card', 'Zelle', 'Venmo', 'Check', 'Cash')),
    is_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_times CHECK (start_time < end_time)
);

-- Create Team Members Table
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('Supervisor', 'Helper')) NOT NULL
);

-- Create Team Assignments Table
CREATE TABLE team_assignments (
    id SERIAL PRIMARY KEY,
    team_id INT REFERENCES teams(id) ON DELETE CASCADE,
    team_member_id INT REFERENCES team_members(id) ON DELETE CASCADE,
    assignment_date DATE NOT NULL
);

-- Create Audit Logs Table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    operation VARCHAR(10) CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
    changed_data JSONB,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(100)
);

-- Create Daily Reports Table
CREATE TABLE daily_reports (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    team_member_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('Supervisor', 'Helper')) NOT NULL,
    hourly_rate NUMERIC(5, 2) NOT NULL,
    total_hours_worked NUMERIC(5, 2) NOT NULL,
    total_tips_received NUMERIC(10, 2) NOT NULL,
    total_salary NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Payments Reports Table
CREATE TABLE payments_reports (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
    client_id INT REFERENCES clients(id) ON DELETE CASCADE,
    job_date DATE NOT NULL,
    job_description TEXT,
    is_paid BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(50),
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);