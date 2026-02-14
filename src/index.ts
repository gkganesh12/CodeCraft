#!/usr/bin / env node
import { Command } from 'commander';
import chalk from 'chalk';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';
import { initCommand } from './commands/init';
import { planCommand } from './commands/plan';
import { architectCommand } from './commands/architect';
import { codeCommand } from './commands/code';
import { verifyCommand } from './commands/verify';

dotenv.config();

const program = new Command();

// Read version from package.json
const packageJson = JSON.parse(readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));

program
    .name('codecraft')
    .description('AI Governance CLI for Developers')
    .version(packageJson.version);

import { configCommand } from './commands/config';
import { updateCommand } from './commands/update';
import { doctorCommand } from './commands/doctor';
import { startRepl } from './repl';

// Global Options
program
    .option('-v, --verbose', 'Enable verbose logging')
    .option('-m, --model <name>', 'Override AI model')
    .option('-p, --print', 'Print output instead of interactive mode');

program
    .command('init')
    .description('Initialize CodeCraft in the current project')
    .action(initCommand);

program
    .command('plan')
    .description('Create an implementation plan for a task')
    .argument('<task>', 'Description of the task')
    .action(planCommand);

// ...

program
    .command('architect')
    .description('Validate the plan against architecture rules')
    .action(architectCommand);

program
    .command('code')
    .description('Execute the plan and generate code')
    .action(codeCommand);

program
    .command('verify')
    .description('Verify changes and calculate risk score')
    .action(verifyCommand);

program
    .command('config')
    .description('Manage configuration')
    .argument('[args...]', 'Arguments for config')
    .action((args) => configCommand(args || []));

program
    .command('update')
    .description('Check for updates')
    .action(updateCommand);

program
    .command('doctor')
    .description('Check environment health')
    .action(doctorCommand);

// Check for globals before processing
program.hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.verbose) {
        process.env.VERBOSE = 'true';
        console.log(chalk.gray('[Verbose Mode Enabled]'));
    }
    if (opts.model) {
        process.env.CODECRAFT_MODEL = opts.model;
        console.log(chalk.gray(`[Model Override: ${opts.model}]`));
    }
});

// Check if any command is provided (args[0] is node, args[1] is script)
if (process.argv.length <= 2) {
    startRepl();
} else {
    program.parse(process.argv);
}
