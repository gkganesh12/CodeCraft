
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { OpenAIAdapter, AIMessage } from '../core/llm/client';
import { REVIEW_PROMPT } from '../core/prompts/roles';
import ora from 'ora';

export async function reviewCommand(file: string) {
    const spinner = ora('Reviewing code...').start();

    const filePath = path.resolve(file);
    if (!fs.existsSync(filePath)) {
        spinner.fail(`File not found: ${file}`);
        return;
    }

    const apiKey = process.env.CODECRAFT_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
        spinner.fail('API Key missing.');
        return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const ai = new OpenAIAdapter(apiKey);
    const prompt: AIMessage[] = [
        { role: 'system', content: REVIEW_PROMPT },
        { role: 'user', content: `Review this code:\n\n${content}` }
    ];

    try {
        const review = await ai.complete(prompt);
        spinner.stop();
        console.log(chalk.bold.hex('#F59E0B')('\n🧐 Code Review Findings\n'));
        console.log(review);

    } catch (err: any) {
        spinner.fail(`Review failed: ${err.message}`);
    }
}
