-- Insert departments
INSERT INTO departments (name)
VALUES
  ('Sales'),
  ('Engineering'),
  ('Finance'),
  ('Legal');
  
-- Insert roles
INSERT INTO roles (title, salary, department_id)
VALUES
  ('Sales Lead', 100000, 1),
  ('Salesperson', 80000, 1),
  ('Lead Engineer', 150000, 2),
  ('Software Engineer', 120000, 2),
  ('Account Manager', 160000, 3),
  ('Accountant', 125000, 3),
  ('Legal Team Lead', 250000, 4),
  ('Lawyer', 190000, 4);

-- Insert employees
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
  ('John', 'Doe', 1, NULL),
  ('Jane', 'Smith', 2, 1),
  ('Bob', 'Johnson', 3, NULL),
  ('Mary', 'Jones', 4, 3),
  ('Alex', 'Brown', 5, NULL),
  ('Sara', 'Wilson', 6, 5),
  ('Tom', 'Davis', 7, NULL),
  ('Karen', 'Taylor', 8, 7);