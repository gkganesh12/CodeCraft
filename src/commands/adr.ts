
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { ConfigLoader } from '../config/loader';
import { OpenAIAdapter, AIMessage } from '../core/llm/client';
import { ADR_PROMPT } from '../core/prompts/roles';
import ora from 'ora';

export async function adrCommand(title: string) {
    const spinner = ora('Drafting ADR...').start();

    const configLoader = new ConfigLoader();
    const config = configLoader.load();
    if (!config) {
        spinner.fail('No config found.');
        return;
    }

    const apiKey = process.env.CODECRAFT_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
        spinner.fail('API Key missing.');
        return;
    }

    const ai = new OpenAIAdapter(apiKey);
    const prompt: AIMessage[] = [
        { role: 'system', content: ADR_PROMPT },
        { role: 'user', content: `ADR Title/Context: ${title}` }
    ];

    try {
        const adr = await ai.complete(prompt);
        // Save to docs/adr/
        const adrDir = path.join(process.cwd(), 'docs', 'adr');
        fs.ensureDirSync(adrDir);

        const count = fs.readdirSync(adrDir).length + 1;
        const filename = `ADR-${String(count).padStart(3, '0')}.md`;
        const filePath = path.join(adrDir, filename);

        fs.writeFileSync(filePath, adr);

        spinner.succeed(`ADR-${String(count).padStart(3, '0')} generated! 🏛️`);
        console.log(chalk.dim(`Saved to ${filePath}`));

    } catch (err: any) {
        spinner.fail(`ADR generation failed: ${err.message}`);
    }
}
