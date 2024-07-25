To add audit logs, we can create an `audit_logs` table that records changes to the key tables (`clients`, `jobs`, `team_members`, `teams`, `team_assignments`, `job_types`). This table will store information about what was changed, when it was changed, and who made the change (if user identification is available).

### Audit Logs Table

The `audit_logs` table will include the following fields:

1. **id**: Auto-incrementing primary key.
2. **table_name**: Name of the table that was changed.
3. **record_id**: ID of the record that was changed.
4. **operation**: Type of operation (INSERT, UPDATE, DELETE).
5. **changed_data**: JSON representation of the changed data.
6. **changed_at**: Timestamp of when the change occurred.
7. **changed_by**: User who made the change (if applicable).

### PostgreSQL Schema for Audit Logs Table

```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    operation VARCHAR(10) CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
    changed_data JSONB,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(100) -- Optional: Username or user ID of the person who made the change
);
```

### Example Trigger Functions

We'll create trigger functions to automatically insert records into the `audit_logs` table whenever an INSERT, UPDATE, or DELETE operation occurs on the key tables.

#### Trigger Function for INSERT

```sql
CREATE OR REPLACE FUNCTION log_insert() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (table_name, record_id, operation, changed_data, changed_at, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW)::jsonb, CURRENT_TIMESTAMP, SESSION_USER);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Trigger Function for UPDATE

```sql
CREATE OR REPLACE FUNCTION log_update() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (table_name, record_id, operation, changed_data, changed_at, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', jsonb_set(row_to_json(OLD)::jsonb, '{new}', row_to_json(NEW)::jsonb), CURRENT_TIMESTAMP, SESSION_USER);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Trigger Function for DELETE

```sql
CREATE OR REPLACE FUNCTION log_delete() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (table_name, record_id, operation, changed_data, changed_at, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD)::jsonb, CURRENT_TIMESTAMP, SESSION_USER);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
```

### Create Triggers on Key Tables

We'll create triggers on the `clients`, `jobs`, `team_members`, `teams`, `team_assignments`, and `job_types` tables to call these functions.

#### Clients Table Triggers

```sql
CREATE TRIGGER clients_insert AFTER INSERT ON clients
FOR EACH ROW EXECUTE FUNCTION log_insert();

CREATE TRIGGER clients_update AFTER UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION log_update();

CREATE TRIGGER clients_delete AFTER DELETE ON clients
FOR EACH ROW EXECUTE FUNCTION log_delete();
```

#### Jobs Table Triggers

```sql
CREATE TRIGGER jobs_insert AFTER INSERT ON jobs
FOR EACH ROW EXECUTE FUNCTION log_insert();

CREATE TRIGGER jobs_update AFTER UPDATE ON jobs
FOR EACH ROW EXECUTE FUNCTION log_update();

CREATE TRIGGER jobs_delete AFTER DELETE ON jobs
FOR EACH ROW EXECUTE FUNCTION log_delete();
```

#### Team Members Table Triggers

```sql
CREATE TRIGGER team_members_insert AFTER INSERT ON team_members
FOR EACH ROW EXECUTE FUNCTION log_insert();

CREATE TRIGGER team_members_update AFTER UPDATE ON team_members
FOR EACH ROW EXECUTE FUNCTION log_update();

CREATE TRIGGER team_members_delete AFTER DELETE ON team_members
FOR EACH ROW EXECUTE FUNCTION log_delete();
```

#### Teams Table Triggers

```sql
CREATE TRIGGER teams_insert AFTER INSERT ON teams
FOR EACH ROW EXECUTE FUNCTION log_insert();

CREATE TRIGGER teams_update AFTER UPDATE ON teams
FOR EACH ROW EXECUTE FUNCTION log_update();

CREATE TRIGGER teams_delete AFTER DELETE ON teams
FOR EACH ROW EXECUTE FUNCTION log_delete();
```

#### Team Assignments Table Triggers

```sql
CREATE TRIGGER team_assignments_insert AFTER INSERT ON team_assignments
FOR EACH ROW EXECUTE FUNCTION log_insert();

CREATE TRIGGER team_assignments_update AFTER UPDATE ON team_assignments
FOR EACH ROW EXECUTE FUNCTION log_update();

CREATE TRIGGER team_assignments_delete AFTER DELETE ON team_assignments
FOR EACH ROW EXECUTE FUNCTION log_delete();
```

#### Job Types Table Triggers

```sql
CREATE TRIGGER job_types_insert AFTER INSERT ON job_types
FOR EACH ROW EXECUTE FUNCTION log_insert();

CREATE TRIGGER job_types_update AFTER UPDATE ON job_types
FOR EACH ROW EXECUTE FUNCTION log_update();

CREATE TRIGGER job_types_delete AFTER DELETE ON job_types
FOR EACH ROW EXECUTE FUNCTION log_delete();
```

### Summary

The `audit_logs` table, along with the associated trigger functions and triggers on key tables, will automatically log all INSERT, UPDATE, and DELETE operations, providing a comprehensive audit trail for your application.

If you need any further customization or assistance with implementing these audit logs, feel free to ask!