// 全局错误处理脚本
// 在应用加载时初始化，捕获所有运行时错误

(function() {
  'use strict';

  // 浏览器扩展相关错误的关键词
  const BROWSER_EXTENSION_ERRORS = [
    'runtime.lastError',
    'message channel closed',
    'async response',
    'chrome-extension://',
    'moz-extension://',
    'webextension',
  ];

  // 判断是否是浏览器扩展相关的错误
  function isBrowserExtensionError(message: string): boolean {
    if (!message) return false;
    const lowerMessage = message.toLowerCase();
    return BROWSER_EXTENSION_ERRORS.some(keyword =>
      lowerMessage.includes(keyword.toLowerCase())
    );
  }

  // 判断是否是CSP违规错误
  function isCSPError(message: string): boolean {
    if (!message) return false;
    return message.toLowerCase().includes('content security policy');
  }

  // 全局错误处理器
  window.addEventListener('error', function(event) {
    const errorMessage = event.message || '';
    const errorSource = event.filename || '';

    // 忽略浏览器扩展错误
    if (isBrowserExtensionError(errorMessage) ||
        isBrowserExtensionError(errorSource)) {
      console.warn('[忽略浏览器扩展错误]', errorMessage);
      event.preventDefault();
      event.stopPropagation();
      return false;
    }

    // 忽略来自扩展的脚本错误
    if (errorSource.includes('chrome-extension://') ||
        errorSource.includes('moz-extension://')) {
      console.warn('[忽略扩展脚本错误]', errorMessage);
      event.preventDefault();
      event.stopPropagation();
      return false;
    }

    // CSP 错误不阻止应用运行
    if (isCSPError(errorMessage)) {
      console.warn('[CSP警告]', errorMessage);
      return false;
    }

    // 其他错误正常处理
    console.error('[全局错误]', event.error || errorMessage);
    return true;
  }, true); // 使用捕获阶段

  // 处理未捕获的 Promise 拒绝
  window.addEventListener('unhandledrejection', function(event) {
    const errorMessage = event.reason?.message || String(event.reason);

    // 忽略浏览器扩展错误
    if (isBrowserExtensionError(errorMessage)) {
      console.warn('[忽略浏览器扩展 Promise 错误]', errorMessage);
      event.preventDefault();
      return;
    }

    // 其他 Promise 错误正常处理
    console.error('[未捕获的 Promise 错误]', event.reason);
  }, true);

  // 处理 CSP 违规报告（如果浏览器支持）
  if (window.SecurityPolicyViolationEvent) {
    document.addEventListener('securitypolicyviolation', function(event) {
      console.warn('[CSP 违规]', {
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        documentURI: event.documentURI,
      });
    });
  }

  // 禁用浏览器扩展的警告（仅在控制台输出）
  const originalError = console.error;
  console.error = function(...args) {
    const message = args[0];
    if (typeof message === 'string' && isBrowserExtensionError(message)) {
      console.warn('[浏览器扩展警告]', ...args);
      return;
    }
    originalError.apply(console, args);
  };

  console.log('✅ 全局错误处理器已初始化');
})();
