/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { TreeNode } from './asciiRenderer.js';

export interface DependencyManifest {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export class DependencyParser {
  /**
   * Reads and parses a package.json file from the given directory.
   */
  static async parseNodeManifest(dirPath: string): Promise<DependencyManifest> {
    const manifestPath = path.join(dirPath, 'package.json');
    try {
      const content = await fs.readFile(manifestPath, 'utf-8');
      const parsed: unknown = JSON.parse(content);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      return parsed as DependencyManifest;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        throw new Error(
          `No package.json found in ${dirPath}. Visualizer requires a manifest for dependency mapping.`,
        );
      }
      throw new Error(
        `Failed to read or parse package.json: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Converts a DependencyManifest into a TreeNode for AsciiRenderer.
   */
  static manifestToTree(manifest: DependencyManifest): TreeNode {
    const rootLabel = manifest.name
      ? `${manifest.name}${manifest.version ? `@${manifest.version}` : ''}`
      : 'project';
    const root: TreeNode = { label: rootLabel, children: [] };

    const addSection = (title: string, deps?: Record<string, string>) => {
      if (!deps || Object.keys(deps).length === 0) return;

      const sectionNode: TreeNode = { label: title, children: [] };
      // Sort dependencies alphabetically for deterministic output
      for (const [name, version] of Object.entries(deps).sort(([a], [b]) =>
        a.localeCompare(b),
      )) {
        sectionNode.children!.push({ label: `${name}: ${version}` });
      }
      root.children!.push(sectionNode);
    };

    addSection('dependencies', manifest.dependencies);
    addSection('devDependencies', manifest.devDependencies);
    addSection('peerDependencies', manifest.peerDependencies);

    return root;
  }
}
