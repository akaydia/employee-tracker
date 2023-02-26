const mysql = require('mysql2');
require('dotenv').config();
const inquirer = require('inquirer');
const promptUser = require('./prompts');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

function viewDepartments() {
  db.query('SELECT * FROM department', function (err, results) {
    console.table(results);
    run();
  });
  
}

function viewRoles() {
  db.query(
    `
    SELECT role.id, role.title, department.name AS department, role.salary 
    FROM role 
    INNER JOIN department ON role.department_id = department.id
  `,
    function (err, results) {
      if (err) throw err;
      console.table(results);
      run();
    }
  );
}

function viewEmployees() {
  db.query(
    `
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
  `,
    function (err, results) {
      if (err) throw err;
      console.table(results);
      run();
    }
  );
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
      db.query(query, [answer.name], function (err, result) {
        if (err) throw err;
        console.log(`${answer.name} department added successfully!`);
        run();
      });
    });
}

function addRole() {
  db.query('SELECT * FROM department', function (err, department) {
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
          message: 'What is the salary for this role?',
        },
        {
          type: 'list',
          name: 'department',
          message: 'Which department does this role belong to?',
          choices: department.map((department) => {
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
          function (err, result) {
            if (err) throw err;
            console.log(`${answer.title} role added successfully!`);
            run();
          }
        );
      });
  });
}

function addEmployee() {
  db.query('SELECT * FROM role', function (err, roles) {
    if (err) throw err;
    db.query('SELECT * FROM employee', function (err, employees) {
      if (err) throw err;

      inquirer
        .prompt([
          {
            type: 'input',
            name: 'first_name',
            message: "What is the employee's first name?",
            validate: function (input) {
              if (input.trim() === '') {
                return 'Please enter a valid first name';
              }
              return true;
            },
          },
          {
            type: 'input',
            name: 'last_name',
            message: "What is the employee's last name?",
            validate: function (input) {
              if (input.trim() === '') {
                return 'Please enter a valid last name';
              }
              return true;
            },
          },
          {
            type: 'list',
            name: 'role_id',
            message: "What is the employee's role?",
            choices: roles.map((role) => ({
              name: role.title,
              value: role.id,
            })),
          },
          {
            type: 'list',
            name: 'manager_id',
            message: "Who is the employee's manager?",
            choices: employees
              .map((employee) => ({
                name: employee.first_name + ' ' + employee.last_name,
                value: employee.id,
              }))
              .concat({ name: 'None', value: null }),
          },
        ]) // prompts
        .then((answer) => {
          db.query(
            'INSERT INTO employee SET ?',
            {
              first_name: answer.first_name,
              last_name: answer.last_name,
              role_id: answer.role_id,
              manager_id: answer.manager_id,
            },
            (error, result) => {
              if (error) {
                console.error(error);
                return;
              }
              console.log('Employee added to the database.');
              run();
            }
          ); // db.query INSERT INTO employee
        }); // .then
    }); // db.query('SELECT * FROM employee', function(err, employees)
  }); // db.query('SELECT * FROM role', function(err, roles)
} // addEmployee

function run() {
  promptUser()
    .then(answer => {
      switch (answer.action) {
        case 'View all departments':
          console.log('View all departments');
          viewDepartments();
          break;
        case 'View all roles':
          viewRoles();
          break;
        case 'View all employees':
          viewEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployeeRole();
          break;
        case 'Exit':
          console.log('Goodbye!');
          return;
        default: console.log('Invalid action: ' + answer.action);
      } // switch()
    }) // then()
    .catch(err => console.log(err));
  } // run()

module.exports = run;