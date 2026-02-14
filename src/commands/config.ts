
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import inquirer from 'inquirer';

// Config path: ~/.codecraft/config.json
const CONFIG_DIR = path.join(os.homedir(), '.codecraft');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

interface CodeCraftConfig {
    model?: string;
    apiKey?: string;
    systemPrompt?: string;
    verbose?: boolean;
}

export function loadGlobalConfig(): CodeCraftConfig {
    if (fs.existsSync(CONFIG_PATH)) {
        try {
            return fs.readJsonSync(CONFIG_PATH);
        } catch (e) {
            return {};
        }
    }
    return {};
}

export function saveGlobalConfig(config: CodeCraftConfig) {
    fs.ensureDirSync(CONFIG_DIR);
    fs.writeJsonSync(CONFIG_PATH, config, { spaces: 2 });
}

export async function configCommand(args: string[]) {
    // Usage: config --set key=value or config --get key or config --list
    const config = loadGlobalConfig();

    if (args.length === 0) {
        // Interactive mode
        console.log(chalk.bold('Current Configuration:'));
        console.log(JSON.stringify(config, null, 2));

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: ['Edit Configuration', 'Exit']
            }
        ]);

        if (answers.action === 'Edit Configuration') {
            const editAnswers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'apiKey',
                    message: 'API Key (leave blank to keep current):',
                    default: config.apiKey
                },
                {
                    type: 'list',
                    name: 'model',
                    message: 'Default Model:',
                    choices: ['gpt-4-turbo', 'gpt-4o', 'claude-3-opus', 'claude-3-sonnet'],
                    default: config.model || 'gpt-4-turbo'
                },
                {
                    type: 'confirm',
                    name: 'verbose',
                    message: 'Enable Verbose Logging?',
                    default: config.verbose || false
                }
            ]);

            if (editAnswers.apiKey) config.apiKey = editAnswers.apiKey;
            config.model = editAnswers.model;
            config.verbose = editAnswers.verbose;

            saveGlobalConfig(config);
            console.log(chalk.green('Configuration saved!'));
        }
        return;
    }

    // CLI Argument mode (basic implementation)
    const action = args[0];
    if (action === '--list') {
        console.log(JSON.stringify(config, null, 2));
    } else if (action === '--get' && args[1]) {
        console.log((config as any)[args[1]] || '(not set)');
    } else if (action === '--set' && args[1]) {
        const [key, value] = args[1].split('=');
        if (key && value) {
            (config as any)[key] = value;
            saveGlobalConfig(config);
            console.log(chalk.green(`${key} set to ${value}`));
        } else {
            console.log(chalk.red('Usage: config --set key=value'));
        }
    } else {
        console.log(chalk.red('Usage: config [--list | --get <key> | --set <key>=<value>]'));
    }
}
