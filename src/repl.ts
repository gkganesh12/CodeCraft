
import inquirer from 'inquirer';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { planCommand } from './commands/plan';
import { architectCommand } from './commands/architect';
import { codeCommand } from './commands/code';
import { verifyCommand } from './commands/verify';
import { featureCommand } from './commands/feature';
import { adrCommand } from './commands/adr';
import { testCommand } from './commands/test';
import { reviewCommand } from './commands/review';
import { explainCommand } from './commands/explain';
import { configCommand } from './commands/config';
import { updateCommand } from './commands/update';
import { doctorCommand } from './commands/doctor';

export async function startRepl() {
    console.clear();
    console.log(chalk.bold.hex('#7C3AED')('CodeCraft CLI'));
    console.log(chalk.dim('Type /help to see available commands.'));
    console.log('');

    while (true) {
        try {
            const answer = await inquirer.prompt([{
                type: 'input',
                name: 'command',
                message: chalk.hex('#3B82F6')('CodeCraft >'),
                prefix: ''
            }]);

            const input = answer.command.trim();
            if (!input) continue;

            if (input.startsWith('/')) {
                const [cmd, ...args] = input.slice(1).split(' ');
                const argString = args.join(' ');

                console.log(''); // Spacing

                switch (cmd) {
                    case 'init':
                        await initCommand();
                        break;
                    case 'plan':
                        if (!argString) {
                            console.log(chalk.red('Usage: /plan <task description>'));
                        } else {
                            await planCommand(argString);
                        }
                        break;
                    case 'architect':
                        await architectCommand();
                        break;
                    case 'code':
                        await codeCommand();
                        break;
                    case 'verify':
                        await verifyCommand();
                        break;
                    case 'feature':
                        if (!argString) console.log(chalk.red('Usage: /feature <description>'));
                        else await featureCommand(argString);
                        break;
                    case 'adr':
                        if (!argString) console.log(chalk.red('Usage: /adr <title>'));
                        else await adrCommand(argString);
                        break;
                    case 'test':
                        if (!argString) console.log(chalk.red('Usage: /test <file>'));
                        else await testCommand(argString);
                        break;
                    case 'review':
                        if (!argString) console.log(chalk.red('Usage: /review <file>'));
                        else await reviewCommand(argString);
                        break;
                    case 'explain':
                        if (!argString) console.log(chalk.red('Usage: /explain <file>'));
                        else await explainCommand(argString);
                        break;
                    case 'config':
                        await configCommand(args); // Pass split args for sub-commands
                        break;
                    case 'update':
                        await updateCommand();
                        break;
                    case 'doctor':
                        await doctorCommand();
                        break;
                    case 'help':
                        console.log(chalk.cyan(`
Available Commands:
  /init         Initialize project
  /plan <task>  Create implementation plan
  /architect    Validate plan
  /code         Generate code
  /verify       Verify changes
  /feature      Generate feature spec
  /adr          Generate ADR
  /test         Generate unit tests
  /review       Generate code review
  /explain      Explain code
  /config       Manage settings
  /update       Check for updates
  /doctor       Check health
  /exit         Exit CLI
                        `));
                        break;
                    case 'exit':
                        console.log(chalk.yellow('Goodbye! 👋'));
                        process.exit(0);
                    default:
                        console.log(chalk.red(`Unknown command: /${cmd}`));
                }
                console.log(''); // Spacing
            } else {
                console.log(chalk.dim('Please use slash commands (e.g. /plan "task") or type /help.'));
            }
        } catch (error) {
            // Handle Ctrl+C seamlessly if possible, though inquirer throws
            console.log('\n');
            if ((error as any).isTtyError) {
                // Prompt couldn't be rendered in the current environment
            } else {
                // Something else went wrong
                // If it's a force close, exit
                console.log(chalk.yellow('Goodbye! 👋'));
                process.exit(0);
            }
        }
    }
}
