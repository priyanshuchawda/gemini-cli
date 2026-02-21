/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { VisualizeTool } from './visualize.js';
import { VISUALIZE_TOOL_NAME } from './tool-names.js';
import type { Config } from '../config/config.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';

describe('VisualizeTool', () => {
  let mockConfig: Config;
  let mockMessageBus: MessageBus;
  let tool: VisualizeTool;

  beforeEach(() => {
    mockConfig = {
      storage: {
        getProjectTempDir: vi
          .fn()
          .mockReturnValue('/tmp/gemini-visualize-test'),
      },
    } as unknown as Config;

    mockMessageBus = {
      publish: vi.fn(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    } as unknown as MessageBus;

    tool = new VisualizeTool(mockConfig, mockMessageBus);
  });

  it('validates a correct payload directly', () => {
    const validParams = {
      intent: 'architecture' as const,
      prompt: 'System auth flow',
    };

    const error = (
      tool as unknown as {
        validateToolParamValues: (params: unknown) => string | null;
      }
    ).validateToolParamValues(validParams);
    expect(error).toBeNull();
  });

  it('rejects invalid intent', () => {
    const invalidParams = {
      intent: 'magic',
      prompt: 'Draw me something',
    };

    const error = (
      tool as unknown as {
        validateToolParamValues: (params: unknown) => string | null;
      }
    ).validateToolParamValues(invalidParams);
    expect(error).toContain("The 'intent' parameter must be either");
  });

  it('rejects empty prompt', () => {
    const invalidParams = {
      intent: 'dependency',
      prompt: '',
    };

    const error = (
      tool as unknown as {
        validateToolParamValues: (params: unknown) => string | null;
      }
    ).validateToolParamValues(invalidParams);
    expect(error).toContain("The 'prompt' parameter cannot be empty");
  });

  it('creates an invocation that resolves with diagram', async () => {
    const validParams = {
      intent: 'architecture' as const,
      prompt: 'Testing diagram',
    };

    const invocation = tool.build(validParams);

    // Check definition overrides - mock messagebus decision
    (
      invocation as unknown as { getMessageBusDecision: () => Promise<string> }
    ).getMessageBusDecision = vi.fn().mockResolvedValue('ALLOW');

    const result = await invocation.execute(new AbortController().signal);

    expect(result.llmContent).toBeDefined();
    expect(typeof result.llmContent).toBe('string');
    expect(result.llmContent as string).toContain('Testing diagram');
  });

  it('initializes correct name and schema', () => {
    expect(tool.name).toBe(VISUALIZE_TOOL_NAME);
    const schema = tool.schema;
    expect(schema.name).toBe(VISUALIZE_TOOL_NAME);
  });
});
