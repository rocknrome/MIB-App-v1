Here's the complete updated `jobs` table with the additional fields for payment status and method of payment:

### Updated `jobs` Table

```sql
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
    completion_status BOOLEAN DEFAULT FALSE, -- Track if the job is completed
    payment_amount NUMERIC(10, 2), -- Amount paid for the job
    is_paid BOOLEAN DEFAULT FALSE, -- Track if the job is paid
    payment_method VARCHAR(50) CHECK (payment_method IN ('Credit Card', 'Zelle', 'Venmo', 'Check', 'Cash')), -- Method of payment
    is_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_times CHECK (start_time < end_time)
);
```

### Explanation of Added Fields

1. **is_paid**: Boolean to track if the job is paid.
2. **payment_method**: Method of payment, restricted to specific values.

### Full SQL Script for Updated `jobs` Table

To create the updated `jobs` table, execute the following SQL script:

```sql
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
    completion_status BOOLEAN DEFAULT FALSE, -- Track if the job is completed
    payment_amount NUMERIC(10, 2), -- Amount paid for the job
    is_paid BOOLEAN DEFAULT FALSE, -- Track if the job is paid
    payment_method VARCHAR(50) CHECK (payment_method IN ('Credit Card', 'Zelle', 'Venmo', 'Check', 'Cash')), -- Method of payment
    is_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_times CHECK (start_time < end_time)
);
```

This updated schema ensures that the `jobs` table includes fields to track the payment status and method of payment, which are necessary for generating the "Payments Report" and handling unpaid job notifications. If you need any further adjustments or additional features, please let me know!