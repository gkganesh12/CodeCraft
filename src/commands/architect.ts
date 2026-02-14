
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { ConfigLoader } from '../config/loader';
import { ScopeManager } from '../core/scope';
import { RuleValidator } from '../core/rules';
import { OpenAIAdapter, AIMessage } from '../core/llm/client';
import { ARCHITECT_ROLE } from '../core/prompts/roles';
import inquirer from 'inquirer';

export async function architectCommand() {
    console.log(chalk.blue('Architect Role: Validating Plan... 🏗️'));

    // 1. Load Config
    const configLoader = new ConfigLoader();
    const config = configLoader.load();
    if (!config) {
        console.error(chalk.red('No config found.'));
        return;
    }

    // 2. Load Plan
    const planPath = path.join(process.cwd(), 'plan.md');
    if (!fs.existsSync(planPath)) {
        console.error(chalk.red('No plan.md found. Run "codecraft plan <task>" first.'));
        return;
    }
    const planContent = fs.readFileSync(planPath, 'utf-8');

    // 3. Extract Files from Plan (Simple Regex for now, upgrade later)
    // Match any backticked content that looks like a file path
    const fileRegex = /`([\w./-]+)`/g;
    const matches = [...planContent.matchAll(fileRegex)].map(m => m[1]).filter((f): f is string => !!f);
    const uniqueFiles = [...new Set(matches)]; // Dedup

    console.log(chalk.dim(`Found ${uniqueFiles.length} files in plan.`));

    // 4. Validate Scope
    const scopeManager = new ScopeManager(config);
    const { allowed, blocked } = scopeManager.validateScope(uniqueFiles);

    if (blocked.length > 0) {
        console.log(chalk.red('\n🚫 Scope Violation: The plan modifies protected files!'));
        blocked.forEach(f => console.log(chalk.red(`   - ${f}`)));

        // Prompt Override
        const confirm = await inquirer.prompt([{
            type: 'confirm',
            name: 'override',
            message: 'Do you want to authorize these changes anyway??',
            default: false
        }]);

        if (!confirm.override) {
            console.log(chalk.red('Aborted by user.'));
            return;
        }
    }

    // 5. AI Architect Review
    console.log(chalk.blue('🤖 AI Architect is reviewing the plan...'));
    const apiKey = process.env.CODECRAFT_API_KEY || process.env.OPENAI_API_KEY;
    if (apiKey) {
        const ai = new OpenAIAdapter(apiKey);
        const prompt: AIMessage[] = [
            { role: 'system', content: ARCHITECT_ROLE },
            { role: 'user', content: `Review this implementation plan:\n\n${planContent}` }
        ];
        try {
            const review = await ai.complete(prompt);
            console.log(chalk.cyan('\n📋 Architect Review:\n'));
            console.log(review);
        } catch (e) {
            console.error(chalk.red('AI Review Failed.'));
        }
    } else {
        console.log(chalk.yellow('Skipping AI Review (No API Key).'));
    }

    // 6. Validate Rules
    // ideally we check if the PLAN violates rules, but that requires semantic analysis of natural language.
    // For MVP, we assume the Architect Step validates that the plan LOOKS okay.
    // We can suggest running "codecraft verify" after code is generated.

    console.log(chalk.green('\n✅ Architecture Check Passed.'));
    console.log('You can now run "codecraft code" to execute this plan.');
}
