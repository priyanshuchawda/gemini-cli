/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest';
import {
  DependencyParser,
  type DependencyManifest,
} from './dependencyParser.js';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';

describe('DependencyParser', () => {
  it('manifestToTree correctly maps valid manifest', () => {
    const manifest: DependencyManifest = {
      name: 'test-app',
      version: '1.0.0',
      dependencies: {
        react: '^18.0.0',
        express: '~4.17.1',
      },
      devDependencies: {
        typescript: '^5.0.0',
      },
    };

    const tree = DependencyParser.manifestToTree(manifest);
    expect(tree.label).toBe('test-app@1.0.0');
    expect(tree.children).toHaveLength(2); // dependencies and devDependencies
    expect(tree.children![0].label).toBe('dependencies');

    // Check children sorting
    expect(tree.children![0].children![0].label).toBe('express: ~4.17.1');
    expect(tree.children![0].children![1].label).toBe('react: ^18.0.0');

    expect(tree.children![1].label).toBe('devDependencies');
    expect(tree.children![1].children![0].label).toBe('typescript: ^5.0.0');
  });

  it('manifestToTree gracefully handles empty manifest', () => {
    const tree = DependencyParser.manifestToTree({});
    expect(tree.label).toBe('project');
    expect(tree.children).toHaveLength(0);
  });

  it('parseNodeManifest reads real files', async () => {
    // Create a temp dir using fs.mkdtemp
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gemini-dep-test-'));
    try {
      const manifestPath = path.join(tmpDir, 'package.json');
      await fs.writeFile(manifestPath, JSON.stringify({ name: 'tmp-project' }));

      const parsed = await DependencyParser.parseNodeManifest(tmpDir);
      expect(parsed.name).toBe('tmp-project');
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it('parseNodeManifest throws useful error when manifest fails', async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'gemini-dep-test-fail-'),
    );
    try {
      await expect(
        DependencyParser.parseNodeManifest(tmpDir),
      ).rejects.toThrowError(/No package.json found/);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
