# Create Project CLI

A command-line interface tool that helps you manage and run custom project commands.

## Installation

1. Clone this repository:   ```bash
   git clone <repository-url>
   cd create-project-cli   ```

2. Install dependencies:   ```bash
   npm install   ```

3. Link the package globally:   ```bash
   npm link   ```

## Usage

### View Available Commands

Simply run:   ```bash
   create-project   ```

This will display an interactive list of all your saved commands.

### Add a New Command

To add a new command to your list:   ```bash
   create-project add <command-name>   ```

For example:   ```bash
   create-project add react-app   ```

## Features

- 🎯 Interactive command selection
- 🎨 Colorful CLI interface
- 💾 Persistent storage of commands
- ⚡ Easy to use
- 🚫 Duplicate command prevention

## Configuration

Commands are stored in a JSON file located at `~/.create-project-config.json`

## Technical Details

### Dependencies

- `commander` - CLI argument parsing
- `inquirer` - Interactive command prompts
- `chalk` - Colorful terminal output


e
