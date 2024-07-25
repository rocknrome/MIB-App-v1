Let's design the daily report based on your requirements. We need to create a function to generate the daily report and store the results in a `daily_reports` table.

### Updated `daily_reports` Table

```sql
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
```

### Function to Generate Daily Report

This function calculates the required daily report details and inserts the results into the `daily_reports` table.

```sql
CREATE OR REPLACE FUNCTION generate_daily_report() RETURNS VOID AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    team_member RECORD;
    job RECORD;
    total_jobs_completed INT;
    hours_worked NUMERIC(5, 2);
    hourly_rate NUMERIC(5, 2);
    total_salary NUMERIC(10, 2);
    total_tips_received NUMERIC(10, 2);
    total_salary_all NUMERIC(10, 2) := 0;
    total_tips_all NUMERIC(10, 2) := 0;
    total_jobs_all INT := 0;
BEGIN
    -- Calculate total jobs completed
    SELECT COUNT(*) INTO total_jobs_completed
    FROM jobs
    WHERE job_date = current_date AND completion_status = TRUE;

    -- Iterate over each team member
    FOR team_member IN
        SELECT tm.id, tm.name, ta.role
        FROM team_members tm
        JOIN team_assignments ta ON tm.id = ta.team_member_id
        WHERE ta.assignment_date = current_date
    LOOP
        -- Calculate hours worked
        SELECT SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600) INTO hours_worked
        FROM jobs
        WHERE team_id IN (
            SELECT team_id FROM team_assignments WHERE team_member_id = team_member.id AND assignment_date = current_date
        ) AND job_date = current_date AND completion_status = TRUE;

        -- Determine hourly rate based on role
        IF team_member.role = 'Supervisor' THEN
            hourly_rate := 21;
        ELSE
            hourly_rate := 19;
        END IF;

        -- Calculate total salary
        total_salary := hours_worked * hourly_rate;

        -- Calculate tips
        total_tips_received := 0;
        FOR job IN
            SELECT j.payment_amount
            FROM jobs j
            WHERE j.team_id IN (
                SELECT team_id FROM team_assignments WHERE team_member_id = team_member.id AND assignment_date = current_date
            ) AND j.job_date = current_date AND j.completion_status = TRUE
        LOOP
            IF job.payment_amount IS NOT NULL THEN
                total_tips_received := total_tips_received + ((job.payment_amount - 120) / 2); -- Assuming a static job cost of $120
            END IF;
        END LOOP;

        -- Insert data into daily_reports table
        INSERT INTO daily_reports (report_date, team_member_name, role, hourly_rate, total_hours_worked, total_tips_received, total_salary)
        VALUES (current_date, team_member.name, team_member.role, hourly_rate, hours_worked, total_tips_received, total_salary);

        -- Accumulate totals for summary
        total_salary_all := total_salary_all + total_salary;
        total_tips_all := total_tips_all + total_tips_received;
    END LOOP;

    -- Insert summary row into daily_reports table
    INSERT INTO daily_reports (report_date, team_member_name, role, hourly_rate, total_hours_worked, total_tips_received, total_salary)
    VALUES (current_date, 'Summary', 'N/A', 0, 0, total_tips_all, total_salary_all);

    -- Insert total jobs completed into daily_reports table (separate row for clarity)
    INSERT INTO daily_reports (report_date, team_member_name, role, hourly_rate, total_hours_worked, total_tips_received, total_salary)
    VALUES (current_date, 'Total Jobs Completed', 'N/A', 0, total_jobs_completed, 0, 0);
END;
$$ LANGUAGE plpgsql;
```

### Scheduled Task to Run at End of Day

You can schedule this function to run at the end of each day using PostgreSQL's `pg_cron` extension or an external cron job.

### Setting Up pg_cron (if available)

```sql
-- Install pg_cron extension (if not already installed)
CREATE EXTENSION pg_cron;

-- Schedule the generate_daily_report function to run daily at 6 PM
SELECT cron.schedule('generate_daily_report', '0 18 * * *', 'CALL generate_daily_report()');
```

### Summary

This setup includes a `daily_reports` table to store the daily summary, a function `generate_daily_report` to calculate and insert the required details into this table, and a scheduled task to run the function at the end of each workday. The function calculates the number of jobs completed, hours worked by each team member, total salary, and total tips, and then inserts these details into the `daily_reports` table.

If you need further adjustments or additional features, please let me know!