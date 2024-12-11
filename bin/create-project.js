#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');

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
  .command('add <command-name>')
  .description('Add a new command to the list')
  .action((commandName) => {
    const commands = getCommands();
    if (commands.includes(commandName)) {
      console.log(chalk.red(`Command "${commandName}" already exists!`));
      return;
    }
    commands.push(commandName);
    saveCommands(commands);
    console.log(chalk.green(`Added command: ${commandName}`));
  });

program.action(async () => {
  const commands = getCommands();

  if (commands.length === 0) {
    console.log(
      chalk.yellow('No commands available. Add commands using: create-project add <command-name>'),
    );
    return;
  }

  const { selectedCommand } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedCommand',
      message: chalk.cyan('Select a command to run:'),
      choices: commands.map((cmd) => ({
        name: chalk.green(cmd),
        value: cmd,
      })),
    },
  ]);

  console.log(chalk.blue(`Selected command: ${selectedCommand}`));
  // Here you can add logic to execute the selected command
});

program.parse();
