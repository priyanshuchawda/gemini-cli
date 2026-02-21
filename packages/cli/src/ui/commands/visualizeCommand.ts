/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  type CommandContext,
  type SlashCommand,
  type SlashCommandActionReturn,
  CommandKind,
} from './types.js';
import {
  VisualizeTool,
  type VisualizationRequest,
} from '@google/gemini-cli-core';

export const visualizeCommand: SlashCommand = {
  name: 'visualize',
  description:
    'Visualize project architecture or dependencies. Usage: /visualize [intent] [prompt]',
  kind: CommandKind.BUILT_IN,
  autoExecute: true,
  action: async (
    context: CommandContext,
    args: string,
  ): Promise<void | SlashCommandActionReturn> => {
    const config = context.services.config;
    if (!config) {
      return {
        type: 'message',
        messageType: 'error',
        content: 'Config not available.',
      };
    }

    const trimmedArgs = args.trim();
    if (!trimmedArgs) {
      return {
        type: 'message',
        messageType: 'info',
        content:
          'Usage: /visualize [architecture|dependency] [prompt]\nExample: /visualize architecture Auth Flow\nExample: /visualize dependencies package.json',
      };
    }

    let intent: 'architecture' | 'dependency' = 'architecture';
    let prompt = trimmedArgs;

    if (
      trimmedArgs.startsWith('dependencies ') ||
      trimmedArgs.startsWith('dependency ')
    ) {
      intent = 'dependency';
      prompt = trimmedArgs.replace(/^(dependencies|dependency)\s*/, '');
    } else if (trimmedArgs.startsWith('architecture ')) {
      intent = 'architecture';
      prompt = trimmedArgs.replace(/^architecture\s*/, '');
    }

    const request: VisualizationRequest = { intent, prompt };

    try {
      // Create and validate the tool natively
      const messageBus = config.getMessageBus ? config.getMessageBus() : null;
      // Depending on the exact method, fallback to generic approach or cast
      const tool = new VisualizeTool(config, messageBus as any);
      const result = await tool.validateBuildAndExecute(
        request,
        new AbortController().signal,
      );

      return {
        type: 'message',
        messageType: 'info',
        content:
          typeof result.returnDisplay === 'string'
            ? `\`\`\`\n${result.returnDisplay}\n\`\`\``
            : `Visualization generated.`,
      };
    } catch (e: unknown) {
      return {
        type: 'message',
        messageType: 'error',
        content: `Error generating visualization: ${e instanceof Error ? e.message : String(e)}`,
      };
    }
  },
};
