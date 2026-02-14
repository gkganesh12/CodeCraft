
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { CodeCraftConfig } from '../config/schema';

export async function initCommand() {
    console.log(chalk.green('Welcome to CodeCraft Setup! 🚀'));

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'projectType',
            message: 'What type of project is this?',
            choices: ['monorepo', 'standard', 'unknown'],
            default: 'standard'
        },
        {
            type: 'confirm',
            name: 'autoLock',
            message: 'Enable Scope Guard auto-lock?',
            default: true
        }
    ]);

    const config: CodeCraftConfig = {
        projectType: answers.projectType,
        layers: {
            frontend: ['src/ui/**/*', 'pages/**/*'],
            backend: ['src/api/**/*', 'server/**/*']
        },
        rules: [
            {
                name: 'no-secrets',
                description: 'Do not commit .env files',
                severity: 'error',
                check: 'grep -r ".env" .'
            }
        ],
        scopeGuard: {
            protectedPaths: ['package.json', 'tsconfig.json', '.env'],
            autoLock: answers.autoLock
        }
    };

    const configPath = path.join(process.cwd(), 'codecraft.config.json');

    if (fs.existsSync(configPath)) {
        const overwrite = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirm',
            message: 'Config file already exists. Overwrite?',
            default: false
        }]);
        if (!overwrite.confirm) {
            console.log(chalk.yellow('Skipping initialization.'));
            return;
        }
    }

    fs.writeJSONSync(configPath, config, { spaces: 2 });
    console.log(chalk.green(`✅ Created codecraft.config.json at ${configPath}`));
}
