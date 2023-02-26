const promptUser = require('./utils/prompts');

const {
  viewDepartments,
  viewRoles,
  viewEmployees,
  addDepartment,
  addRole,
  addEmployee,
} = require('./utils/database');

function run() {
  promptUser()
    .then(answer => {
      switch (answer.action) {
        case 'View all departments':
          viewDepartments();
          run(); 
          break;
        case 'View all roles':
          viewRoles();
          run();
          break;
        case 'View all employees':
          viewEmployees();
          run();
          break;
        case 'Add a department':
          addDepartment();
          run();
          break;
        case 'Add a role':
          addRole();
          run();
          break;
        case 'Add an employee':
          addEmployee();
          run();
          break;
        case 'Update an employee role':
          updateEmployeeRole();
          run();
          break;
        case 'Exit':
          console.log('Goodbye!');
          return;
      } // switch()
    }) // then()
    .catch(err => console.log(err));
} // run()

process.stdin.setMaxListeners(20);
run(); // start the prompts

