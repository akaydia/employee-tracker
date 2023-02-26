const mysql = require('mysql2');
require('dotenv').config();
const promptUser = require('./prompts');
const inquirer = require('inquirer');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('error connecting to database: ' + err.stack);
    return;
  }
  console.log('connected to database as id ' + db.threadId);
});

function end() {
  db.end();
}

function viewDepartments() {
  db.query('SELECT * FROM department', function(err, results) {
    if (err) throw err;
    console.table(results);
    promptUser();
  });
}

function viewRoles() {
  db.query(`
    SELECT role.id, role.title, department.name AS department, role.salary 
    FROM role 
    INNER JOIN department ON role.department_id = department.id
  `, function(err, results) {
    if (err) throw err;
    console.table(results);
    promptUser();
  });
}

function viewEmployees() {
  db.query(`
    SELECT 
      e.id, 
      e.first_name, 
      e.last_name, 
      role.title AS job_title, 
      department.name AS department, 
      role.salary, 
      CONCAT(m.first_name, ' ', m.last_name) AS manager_name 
    FROM employee e 
    LEFT JOIN role ON e.role_id = role.id 
    LEFT JOIN department ON role.department_id = department.id 
    LEFT JOIN employee m ON e.manager_id = m.id
  `, function(err, results) {
    if (err) throw err;
    console.table(results);
    promptUser();
  });
}

function addDepartment() {
  inquirer
    .prompt({
      type: 'input',
      name: 'name',
      message: "What is the name of the department you'd like to add?",
    })
    .then((answer) => {
      const query = `INSERT INTO department (name) VALUES (?)`;
      db.query(query, [answer.name], function(err, result) {
        if (err) throw err;
        console.log(`${answer.name} department added successfully!`);
        promptUser();
      });
    });
}

function addRole() {
  db.query('SELECT * FROM department', function(err, departments) {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: 'input',
          name: 'title',
          message: "What is the name of the role you'd like to add?",
        },
        {
          type: 'input',
          name: 'salary',
          message: "What is the salary for this role?",
        },
        {
          type: 'list',
          name: 'department',
          message: "Which department does this role belong to?",
          choices: departments.map((department) => {
            return {
              name: department.name,
              value: department.id,
            };
          }),
        },
      ])
      .then((answer) => {
        const query = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
        db.query(
          query,
          [answer.title, answer.salary, answer.department],
          function(err, result) {
            if (err) throw err;
            console.log(`${answer.title} role added successfully!`);
            promptUser();
          }
        );
      });
  });
}

function addEmployee() {
  db.query('SELECT * FROM role', function(err, roles) {
    if (err) throw err;
    db.query('SELECT * FROM employee', function(err, employees) {
      if (err) throw err;

      inquirer.prompt([
        {
          type: 'input',
          name: 'first_name',
          message: "What is the employee's first name?",
          validate: function(input) {
            if (input.trim() === '') {
              return 'Please enter a valid first name';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'last_name',
          message: "What is the employee's last name?",
          validate: function(input) {
            if (input.trim() === '') {
              return 'Please enter a valid last name';
            }
            return true;
          }
        },
        {
          type: 'list',
          name: 'role_id',
          message: "What is the employee's role?",
          choices: roles.map(role => ({name: role.title, value: role.id}))
        },
        {
          type: 'list',
          name: 'manager_id',
          message: "Who is the employee's manager?",
          choices: employees.map(employee => ({name: employee.first_name + ' ' + employee.last_name, value: employee.id})).concat({name: 'None', value: null})
        }
      ]).then(answer => {
        db.query('INSERT INTO employee SET ?', answer, function(err, result) {
          if (err) throw err;
          console.log(`Added employee ${answer.first_name} ${answer.last_name} to the database`);
          start();
        });
      });
    });
  });
}

module.exports = {
  db,
  end,
  viewDepartments,
  viewRoles,
  viewEmployees,
  addDepartment,
  addRole,
  addEmployee,
};