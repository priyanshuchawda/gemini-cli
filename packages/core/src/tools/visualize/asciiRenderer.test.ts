/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest';
import { AsciiRenderer } from './asciiRenderer.js';

describe('AsciiRenderer', () => {
  it('renders a simple box deterministically', () => {
    const result = AsciiRenderer.renderBox('Hello', 7);
    const expected = ['┌───────┐', '│ Hello │', '└───────┘'].join('\n');
    expect(result).toBe(expected);
  });

  it('renders a tree structure', () => {
    const tree = {
      label: 'Root',
      children: [{ label: 'Child A' }, { label: 'Child B' }],
    };
    const result = AsciiRenderer.renderTree(tree);
    const expected = `Root
├── Child A
└── Child B`;
    expect(result).toBe(expected);
  });
});
