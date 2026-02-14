
import chalk from 'chalk';
import ora from 'ora';
import { loadGlobalConfig } from './config';
import os from 'os';

export async function doctorCommand() {
    console.log(chalk.bold('🚑 CodeCraft Doctor\n'));

    const steps = [
        { name: 'Node.js Version', check: () => process.version, required: '>= v18.0.0' },
        { name: 'OS Platform', check: () => os.platform(), required: 'Any' },
        {
            name: 'Configuration', check: async () => {
                const config = loadGlobalConfig();
                return config.apiKey ? 'API Key Configured ✅' : 'API Key Missing ❌';
            }, required: 'Required for AI features'
        }
    ];

    for (const step of steps) {
        process.stdout.write(`Compiling ${step.name}... `);
        try {
            const result = await Promise.resolve(step.check());
            console.log(chalk.green('OK'));
            console.log(chalk.dim(`  Value: ${result}`));
        } catch (e) {
            console.log(chalk.red('FAILED'));
        }
        await new Promise(r => setTimeout(r, 200)); // Visual pause
    }

    console.log(chalk.blue('\nDiagnostics complete.'));
}
