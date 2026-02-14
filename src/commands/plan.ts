
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { ConfigLoader } from '../config/loader';
import { ProjectScanner } from '../core/scanner';
import { OpenAIAdapter, AIMessage } from '../core/llm/client';
import ora from 'ora';
import { PM_ROLE } from '../core/prompts/roles';

export async function planCommand(task: string) {
    const spinner = ora('Loading configuration...').start();

    // 1. Load Config
    const configLoader = new ConfigLoader();
    const config = configLoader.load();
    if (!config) {
        spinner.fail('No codecraft.config.json found. Run "codecraft init" first.');
        return;
    }

    // 2. Scan Project
    spinner.text = 'Scanning project structure...';
    const scanner = new ProjectScanner();
    const files = await scanner.scan();
    // Limit files context effectively (only top level trees or summary)
    const fileList = files.slice(0, 50).join('\n'); // mvp hack

    // 3. AI Planning
    spinner.text = 'Generating plan with AI...';

    const apiKey = process.env.CODECRAFT_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
        spinner.fail('CODECRAFT_API_KEY or OPENAI_API_KEY not set.');
        return;
    }

    const ai = new OpenAIAdapter(apiKey);

    const prompt: AIMessage[] = [
        {
            role: 'system',
            content: PM_ROLE
        },
        {
            role: 'user',
            content: `Task: ${task}`
        }
    ];

    try {
        const plan = await ai.complete(prompt);

        // 4. Save Plan
        const planPath = path.join(process.cwd(), 'plan.md');
        fs.writeFileSync(planPath, plan);

        spinner.succeed(chalk.green('Plan generated successfully! 📝'));
        console.log(chalk.dim(`Saved to ${planPath}`));
        console.log('\nRun "codecraft architect" to validate this plan.');

    } catch (err: any) {
        spinner.fail(`AI Planning Failed: ${err.message}`);
    }
}
