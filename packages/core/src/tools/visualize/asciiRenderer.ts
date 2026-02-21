/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TreeNode {
  label: string;
  children?: TreeNode[];
}

export class AsciiRenderer {
  /**
   * Renders a simple ASCII box around text
   */
  static renderBox(text: string, width: number): string {
    const contentWidth = Math.max(text.length, width - 4);
    const paddedText = text.padEnd(contentWidth, ' ');

    const top = `┌${'─'.repeat(contentWidth + 2)}┐`;
    const middle = `│ ${paddedText} │`;
    const bottom = `└${'─'.repeat(contentWidth + 2)}┘`;

    return [top, middle, bottom].join('\n');
  }

  /**
   * Renders a tree structure
   */
  static renderTree(
    node: TreeNode,
    prefix: string | null = null,
    isLast: boolean = true,
  ): string {
    let result = '';

    if (prefix === null) {
      result += `${node.label}\n`;
    } else {
      const connector = isLast ? '└── ' : '├── ';
      result += `${prefix}${connector}${node.label}\n`;
    }

    if (node.children && node.children.length > 0) {
      const childPrefix =
        prefix === null ? '' : prefix + (isLast ? '    ' : '│   ');
      for (let i = 0; i < node.children.length; i++) {
        const isChildLast = i === node.children.length - 1;
        result += this.renderTree(node.children[i], childPrefix, isChildLast);
      }
    }

    return prefix === null ? result.trimEnd() : result;
  }
}
