-- Insert departments
INSERT INTO department (name)
VALUES
  ('Sales'),
  ('Engineering'),
  ('Marketing'),
  ('HR');

-- Insert roles
INSERT INTO role (title, salary, department_id)
VALUES
  ('Sales Manager', 100000, 1),
  ('Sales Representative', 50000, 1),
  ('Software Engineer', 90000, 2),
  ('QA Engineer', 80000, 2),
  ('Marketing Manager', 110000, 3),
  ('Marketing Coordinator', 60000, 3),
  ('HR Manager', 95000, 4),
  ('HR Representative', 55000, 4);

-- Insert employees
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
  ('John', 'Doe', 1, NULL),
  ('Jane', 'Smith', 2, 1),
  ('Bob', 'Johnson', 3, NULL),
  ('Mary', 'Jones', 4, 3),
  ('Alex', 'Brown', 5, NULL),
  ('Sara', 'Wilson', 6, 5),
  ('Tom', 'Davis', 7, NULL),
  ('Karen', 'Taylor', 8, 7);