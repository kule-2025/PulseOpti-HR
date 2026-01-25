/**
 * AI SDK 配置文件
 * 统一管理所有 AI 服务的配置
 */

import { Config, ImageGenerationConfig, VoiceConfig } from 'coze-coding-dev-sdk';

/**
 * LLM 客户端配置
 */
export const llmConfig = new Config({
  apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
});

/**
 * 图片生成客户端配置
 */
export const imageGenConfig = new ImageGenerationConfig({
  apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
});

/**
 * 语音客户端配置
 */
export const voiceConfig = new VoiceConfig({
  apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
});
