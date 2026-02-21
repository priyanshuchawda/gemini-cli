/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest';
import { visualizeCommand } from './visualizeCommand.js';
import type { CommandContext } from './types.js';

describe('visualizeCommand', () => {
  it('returns usage if no args provided', async () => {
    const mockContext = {
      services: {
        config: {},
      },
    } as unknown as CommandContext;

    const result = await visualizeCommand.action!(mockContext, '');
    expect(result).toBeDefined();
    expect((result as { messageType: string }).messageType).toBe('info');
    expect((result as { content: string }).content).toContain(
      'Usage: /visualize',
    );
  });

  it('handles config absent', async () => {
    const mockContext = {
      services: {
        config: null,
      },
    } as unknown as CommandContext;

    const result = await visualizeCommand.action!(
      mockContext,
      'architecture test',
    );
    expect((result as { messageType: string }).messageType).toBe('error');
    expect((result as { content: string }).content).toContain(
      'Config not available',
    );
  });
});
