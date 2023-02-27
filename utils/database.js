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


function viewEmployeesByManager() {
  // Query the database to retrieve a list of managers
  const managerQuery = `
    SELECT DISTINCT e.manager_id, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee AS e
    JOIN employee AS m ON e.manager_id = m.id
    ORDER BY manager
  `;
  db.query(managerQuery, (error, managers) => {
    if (error) {
      console.error(error);
      return;
    }
    // Display the list of managers to the user and prompt them to select one
    console.table(managers);
    const managerChoices = managers.map((row) => ({
      name: row.manager,
      value: row.manager_id,
    }));
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'managerId',
          message: 'Select a manager to view their employees:',
          choices: managerChoices,
        },
      ])
      .then((answers) => {
        const { managerId } = answers;
        // Query the database to retrieve employees by manager ID
        const query = `
          SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department
          FROM employee AS e
          JOIN role AS r ON e.role_id = r.id
          JOIN department AS d ON r.department_id = d.id
          WHERE e.manager_id = ?
        `;
        const values = [managerId];
        db.query(query, values, (error, results) => {
          if (error) {
            console.error(error);
            return;
          }
          console.table(results);
        }); // db.query(results)
        run();
      }); // .then()
  }); // db.query(find managers)
}; // viewEmployeesByManager()

function viewEmployeesByDepartment() {
  db.query(`SELECT id, name FROM department`, function (err, departments) {
    if (err) throw err;

    // Prompt the user to select a department from the list
    const choices = departments.map((department) => ({
      name: department.name,
      value: department.id,
    }));
    inquirer
      .prompt([
        {
          type: "list",
          message: "Which department would you like to view?",
          name: "department_id",
          choices: choices,
        },
      ])
      .then(function (answers) {
        const departmentId = answers.department_id;

        // Query the database to get employees in the selected department
        db.query(
          `
          SELECT d.name AS department, e.first_name, e.last_name, r.title AS role
          FROM department d
          JOIN role r ON r.department_id = d.id
          JOIN employee e ON e.role_id = r.id
          WHERE d.id = ?
          ORDER BY d.name, e.last_name, e.first_name;
          `,
          [departmentId],
          function (err, results) {
            if (err) throw err;
            console.table(results);
            run();
          } 
        ); // db.query(result)
      }); // .then()
  }); // db.query(departments)
} // viewEmployeesByDepartment()

function viewDepartmentBudget() {
  const departmentQuery = `
    SELECT id, name
    FROM department
  `;
  db.query(departmentQuery, (error, departments) => {
    if (error) {
      console.error(error);
      return;
    }
    // Display the list of departments to the user and prompt them to select one
    console.table(departments);
    const departmentChoices = departments.map((row) => ({
      name: row.name,
      value: row.id,
    }));
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'departmentId',
          message: 'Select a department to view its budget:',
          choices: departmentChoices,
        },
      ])
      .then((answers) => {
        const { departmentId } = answers;
        // Query the database to retrieve the total utilized budget of the selected department
        const query = `
          SELECT d.name AS department, SUM(r.salary) AS utilized_budget
          FROM department AS d
          JOIN role AS r ON d.id = r.department_id
          JOIN employee AS e ON r.id = e.role_id
          WHERE d.id = ?
          GROUP BY d.name
        `;
        const values = [departmentId];
        db.query(query, values, (error, results) => {
          if (error) {
            console.error(error);
            return;
          }
          console.table(results);
          run();
        }); // db.query(results)
      }); // .then()
  }); // db.query(find departments)
}; // viewDepartmentBudget()

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
    .then((answer) => {
      switch (answer.action) {
        case 'View all departments':
          viewDepartments();
          break;
        case 'View all roles':
          viewRoles();
          break;
        case 'View all employees':
          viewEmployees();
          break;
        case 'View employees by manager':
          viewEmployeesByManager();
          break;
        case 'View employees by department':
          viewEmployeesByDepartment();
          break;
        case 'View total utilized budget of a department':
          viewDepartmentBudget();
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
        case 'Exit':
          console.log('Goodbye!');
          return;
        default:
          console.log('Invalid action: ' + answer.action);
      } // switch()
    }) // then()
    .catch((err) => console.log(err));
} // run()

module.exports = run;
