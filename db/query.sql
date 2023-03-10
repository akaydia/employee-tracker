-- View All employees with their first name, last name, role title, department name, and manager's first and last name (if applicable)
SELECT 
  e.id,
  e.first_name,
  e.last_name,
  r.title,
  d.name AS department_name,
  r.salary,
  CONCAT(m.first_name, ' ', m.last_name) AS manager_name
FROM employee e
JOIN role r ON e.role_id = r.id
JOIN department d ON r.department_id = d.id
LEFT JOIN employee m ON e.manager_id = m.id;