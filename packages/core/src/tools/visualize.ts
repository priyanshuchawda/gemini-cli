/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MessageBus } from '../confirmation-bus/message-bus.js';
import type { ToolInvocation, ToolResult } from './tools.js';
import { BaseDeclarativeTool, BaseToolInvocation, Kind } from './tools.js';
import { type Config } from '../config/config.js';
import { VISUALIZE_TOOL_NAME } from './tool-names.js';
import { getErrorMessage } from '../utils/errors.js';
import { debugLogger } from '../utils/debugLogger.js';
import { VISUALIZE_DEFINITION } from './definitions/coreTools.js';
import { resolveToolDeclaration } from './definitions/resolver.js';
import { AsciiRenderer } from './visualize/asciiRenderer.js';
import { VisualizeCache } from './visualize/cache.js';
import { DependencyParser } from './visualize/dependencyParser.js';
import { ToolErrorType } from './tool-error.js';

export interface VisualizationRequest {
  intent: 'architecture' | 'dependency';
  prompt: string;
  targets?: string[];
  diagram_type?: 'flowchart' | 'sequence' | 'class' | 'auto';
  max_nodes?: number;
  refresh_cache?: boolean;
}

class VisualizeToolInvocation extends BaseToolInvocation<
  VisualizationRequest,
  ToolResult
> {
  constructor(
    private config: Config,
    params: VisualizationRequest,
    messageBus: MessageBus,
    _toolName?: string,
    _toolDisplayName?: string,
  ) {
    super(params, messageBus, _toolName, _toolDisplayName);
  }

  getDescription(): string {
    return `Visualizing codebase architecture (${this.params.intent}): ${this.params.prompt}`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    try {
      // Create cache instance with generic Record
      const cache = new VisualizeCache(this.config.storage);
      const requestHash = cache.generateHash(this.params);

      if (!this.params.refresh_cache) {
        const cached = await cache.get(requestHash);
        if (cached) {
          return {
            llmContent: cached.ascii_diagram,
            returnDisplay: `Successfully visualized from cache:\n${cached.ascii_diagram}`,
          };
        }
      }

      let diagram = '';

      if (this.params.intent === 'dependency') {
        try {
          // Pass target dir if resolving workspace, here default to config target dir
          const targetDir = this.config.getTargetDir();
          const manifest = await DependencyParser.parseNodeManifest(targetDir);
          const treeNode = DependencyParser.manifestToTree(manifest);
          diagram = AsciiRenderer.renderTree(treeNode);
        } catch (depError: any) {
          return {
            llmContent: `Could not parse dependencies: ${depError.message}`,
            returnDisplay: `Could not parse dependencies: ${depError.message}`,
            error: {
              message: depError.message,
              type: ToolErrorType.EXECUTION_FAILED,
            },
          };
        }
      } else {
        // MVP string rendering for architecture
        diagram = AsciiRenderer.renderBox(
          `Visualization: ${this.params.prompt}`,
          40,
        );
      }

      await cache.set(requestHash, diagram);

      return {
        llmContent: diagram,
        returnDisplay: `Successfully visualized:\n${diagram}`,
      };
    } catch (error) {
      debugLogger.warn(`VisualizeTool execute Error`, error);
      const errorMessage = getErrorMessage(error);
      const rawError = `Error during visualize operation: ${errorMessage}`;
      return {
        llmContent: rawError,
        returnDisplay: `Error: An unexpected error occurred.`,
        error: {
          message: rawError,
          type: ToolErrorType.EXECUTION_FAILED,
        },
      };
    }
  }
}

export class VisualizeTool extends BaseDeclarativeTool<
  VisualizationRequest,
  ToolResult
> {
  static readonly Name = VISUALIZE_TOOL_NAME;

  constructor(
    private config: Config,
    messageBus: MessageBus,
  ) {
    super(
      VisualizeTool.Name,
      'Visualize',
      VISUALIZE_DEFINITION.base.description!,
      Kind.Read,
      VISUALIZE_DEFINITION.base.parametersJsonSchema,
      messageBus,
      true,
      false,
    );
  }

  /**
   * Validates the parameters for the tool.
   */
  protected override validateToolParamValues(
    params: VisualizationRequest,
  ): string | null {
    if (
      !params.intent ||
      (params.intent !== 'architecture' && params.intent !== 'dependency')
    ) {
      return "The 'intent' parameter must be either 'architecture' or 'dependency'.";
    }
    if (
      !params.prompt ||
      typeof params.prompt !== 'string' ||
      params.prompt.trim() === ''
    ) {
      return "The 'prompt' parameter cannot be empty.";
    }
    return null;
  }

  protected createInvocation(
    params: VisualizationRequest,
    messageBus: MessageBus,
    _toolName?: string,
    _toolDisplayName?: string,
  ): ToolInvocation<VisualizationRequest, ToolResult> {
    return new VisualizeToolInvocation(
      this.config,
      params,
      messageBus,
      _toolName,
      _toolDisplayName,
    );
  }

  override getSchema(modelId?: string) {
    return resolveToolDeclaration(VISUALIZE_DEFINITION, modelId);
  }
}
