#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { exec } = require('child_process');

const configPath = path.join(process.env.HOME, '.create-project-config.json');

// Initialize config file if it doesn't exist
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify({ commands: [] }, null, 2));
}

// Read commands from config
const getCommands = () => {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return config.commands;
};

// Save commands to config
const saveCommands = (commands) => {
  fs.writeFileSync(configPath, JSON.stringify({ commands }, null, 2));
};

program.name('create-project').description('CLI to manage and run custom project commands');

program
  .command('add')
  .description('Add a new command to the list')
  .argument('[command]', 'The command to execute')
  .argument('[description]', 'Description of what the command does')
  .action(async (command, description) => {
    const commands = getCommands();

    if (!command || !description) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'command',
          message: chalk.cyan('Enter the command to execute:'),
          when: !command,
          validate: (input) => {
            if (!input.trim()) {
              return 'Command cannot be empty';
            }
            if (commands.some((cmd) => cmd.command === input)) {
              return 'Command already exists!';
            }
            return true;
          },
        },
        {
          type: 'input',
          name: 'description',
          message: chalk.cyan('Enter the description for this command:'),
          when: !description,
          validate: (input) => {
            if (!input.trim()) {
              return 'Description cannot be empty';
            }
            return true;
          },
        },
      ]);

      command = command || answers.command;
      description = description || answers.description;
    } else if (commands.some((cmd) => cmd.command === command)) {
      console.log(chalk.red(`Command "${command}" already exists!`));
      return;
    }

    commands.push({ command, description });
    saveCommands(commands);
    console.log(chalk.green(`Added command: ${description} (${command})`));
  });

program
  .command('delete')
  .description('Delete a command from the list')
  .action(async () => {
    const commands = getCommands();

    if (commands.length === 0) {
      console.log(chalk.yellow('No commands available to delete.'));
      return;
    }

    const { commandToDelete } = await inquirer.prompt([
      {
        type: 'list',
        name: 'commandToDelete',
        message: chalk.red('Select a command to delete:'),
        choices: commands.map((cmd, index) => ({
          name: chalk[colors[index % colors.length]](
            `${cmd.description} ${chalk.gray(`(${cmd.command})`)} `,
          ),
          value: cmd.command,
        })),
      },
    ]);

    const updatedCommands = commands.filter((cmd) => cmd.command !== commandToDelete);
    saveCommands(updatedCommands);

    console.log(chalk.green(`Successfully deleted command: ${commandToDelete}`));
  });

const colors = [
  'green',
  'blue',
  'magenta',
  'cyan',
  'yellow',
  'redBright',
  'greenBright',
  'blueBright',
  'magentaBright',
  'cyanBright',
];

program.action(async () => {
  const commands = getCommands();

  if (commands.length === 0) {
    console.log(
      chalk.yellow(
        'No commands available. Add commands using: create-project add <command> <description>',
      ),
    );
    return;
  }

  const { selectedCommand } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedCommand',
      message: chalk.cyan('Select a command to run:'),
      choices: commands.map((cmd, index) => ({
        name: chalk[colors[index % colors.length]](
          `${cmd.description} ${chalk.gray(`(${cmd.command})`)} `,
        ),
        value: cmd.command,
      })),
    },
  ]);

  console.log(chalk.blue(`Running command: ${selectedCommand}`));

  // Execute command in interactive mode
  const childProcess = exec(selectedCommand, {
    stdio: 'inherit', // This will pipe the child process I/O to the parent
    shell: true,
  });

  // Handle process events
  childProcess.stdout?.on('data', (data) => {
    process.stdout.write(chalk.green(data));
  });

  childProcess.stderr?.on('data', (data) => {
    process.stderr.write(chalk.yellow(data));
  });

  childProcess.on('error', (error) => {
    console.error(chalk.red(`Error executing command: ${error.message}`));
  });

  // Wait for the command to complete
  childProcess.on('exit', (code) => {
    if (code === 0) {
      console.log(chalk.green('\nCommand completed successfully'));
    } else {
      console.log(chalk.red(`\nCommand failed with exit code ${code}`));
    }
  });
});

program.parse();
