/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import type { Storage } from '../../config/storage.js';

export interface VisualizeCacheEntry {
  hash: string;
  ascii_diagram: string;
  timestamp: number;
}

export class VisualizeCache {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  private async getCacheDir(): Promise<string> {
    const tempDir = this.storage.getProjectTempDir();
    const cacheDir = path.join(tempDir, 'visualize-cache');
    await fs.mkdir(cacheDir, { recursive: true });
    return cacheDir;
  }

  generateHash<T extends object>(request: T): string {
    // Sort keys and values deterministically for the hash
    const data = JSON.stringify(request, Object.keys(request).sort());
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async get(hash: string): Promise<VisualizeCacheEntry | null> {
    const cacheDir = await this.getCacheDir();
    const filePath = path.join(cacheDir, `${hash}.json`);
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const parsed: unknown = JSON.parse(data);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      return parsed as VisualizeCacheEntry;
    } catch {
      return null;
    }
  }

  async set(hash: string, ascii_diagram: string): Promise<void> {
    const cacheDir = await this.getCacheDir();
    const filePath = path.join(cacheDir, `${hash}.json`);
    const entry: VisualizeCacheEntry = {
      hash,
      ascii_diagram,
      timestamp: Date.now(),
    };
    await fs.writeFile(filePath, JSON.stringify(entry), 'utf-8');
  }
}
