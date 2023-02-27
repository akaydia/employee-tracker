const inquirer = require('inquirer');

function promptUser() {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'View employees by manager',
        'View employees by department',
        'View total utilized budget of a department',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Exit'
      ]
    }
  ]);
}

module.exports = promptUser;