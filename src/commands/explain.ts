
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { OpenAIAdapter, AIMessage } from '../core/llm/client';
import { EXPLAIN_PROMPT } from '../core/prompts/roles';
import ora from 'ora';

export async function explainCommand(file: string) {
    const spinner = ora('Analyzing code...').start();

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
        { role: 'system', content: EXPLAIN_PROMPT },
        { role: 'user', content: `Explain this code:\n\n${content}` }
    ];

    try {
        const explanation = await ai.complete(prompt);
        spinner.stop();
        console.log(chalk.bold.hex('#3B82F6')('\n💡 Code Explanation\n'));
        console.log(explanation);

    } catch (err: any) {
        spinner.fail(`Explanation failed: ${err.message}`);
    }
}
