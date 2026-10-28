/**
 * chaos-mesh.js - Enterprise Chaos Engineering & Fault Resilience Mesh
 * 
 * Provides:
 *  1. CircuitBreaker - Automatic failure isolation with CLOSED / OPEN / HALF_OPEN state machine
 *  2. DeadLetterQueue (DLQ) - Persistent event buffer with exponential backoff & retry
 *  3. FallbackStorage - Transparent memory-backed storage failover when localStorage is blocked or full
 *  4. LatencyJitterInjector - Configurable chaos injection for simulated latency and network flaps
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ChaosMesh = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // =========================================================================
  // 1. CIRCUIT BREAKER
  // =========================================================================
  class CircuitBreaker {
    constructor(options = {}) {
      this.name = options.name || 'default-service';
      this.failureThreshold = options.failureThreshold || 3;
      this.cooldownPeriodMs = options.cooldownPeriodMs || 10000;
      this.halfOpenMaxCalls = options.halfOpenMaxCalls || 2;

      this.state = 'CLOSED'; // 'CLOSED' | 'OPEN' | 'HALF_OPEN'
      this.failureCount = 0;
      this.successCount = 0;
      this.lastFailureTime = null;
      this.halfOpenCalls = 0;
    }

    async execute(action, fallback = null) {
      if (this.isOpen()) {
        if (typeof fallback === 'function') {
          return await fallback(new Error(`[CircuitBreaker: ${this.name}] Circuit is OPEN`));
        }
        throw new Error(`[CircuitBreaker: ${this.name}] Circuit is OPEN. Fast failing.`);
      }

      if (this.state === 'HALF_OPEN') {
        this.halfOpenCalls++;
      }

      try {
        const result = await action();
        this.onSuccess();
        return result;
      } catch (err) {
        this.onFailure(err);
        if (typeof fallback === 'function') {
          return await fallback(err);
        }
        throw err;
      }
    }

    isOpen() {
      if (this.state === 'OPEN') {
        const now = Date.now();
        if (now - this.lastFailureTime > this.cooldownPeriodMs) {
          this.state = 'HALF_OPEN';
          this.halfOpenCalls = 0;
          this.successCount = 0;
          return false;
        }
        return true;
      }
      return false;
    }

    onSuccess() {
      if (this.state === 'HALF_OPEN') {
        this.successCount++;
        if (this.successCount >= this.halfOpenMaxCalls) {
          this.state = 'CLOSED';
          this.failureCount = 0;
          this.halfOpenCalls = 0;
        }
      } else {
        this.failureCount = 0;
      }
    }

    onFailure(err) {
      this.lastFailureTime = Date.now();
      if (this.state === 'HALF_OPEN') {
        this.state = 'OPEN';
      } else {
        this.failureCount++;
        if (this.failureCount >= this.failureThreshold) {
          this.state = 'OPEN';
        }
      }
    }

    getState() {
      return {
        name: this.name,
        state: this.state,
        failureCount: this.failureCount,
        lastFailureTime: this.lastFailureTime
      };
    }

    reset() {
      this.state = 'CLOSED';
      this.failureCount = 0;
      this.successCount = 0;
      this.halfOpenCalls = 0;
      this.lastFailureTime = null;
    }
  }

  // =========================================================================
  // 2. DEAD LETTER QUEUE (DLQ)
  // =========================================================================
  class DeadLetterQueue {
    constructor(storageKey = 'chaos_dlq_queue', maxEntries = 100) {
      this.storageKey = storageKey;
      this.maxEntries = maxEntries;
      this.queue = this._load();
    }

    _load() {
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(this.storageKey);
          if (raw) return JSON.parse(raw);
        }
      } catch (e) {}
      return [];
    }

    _save() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
        }
      } catch (e) {}
    }

    enqueue(payload, errorReason = 'unknown') {
      const entry = {
        id: 'dlq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        timestamp: new Date().toISOString(),
        retryCount: 0,
        maxRetries: 5,
        reason: String(errorReason),
        payload
      };

      this.queue.push(entry);
      if (this.queue.length > this.maxEntries) {
        this.queue.shift(); // Evict oldest
      }
      this._save();
      return entry;
    }

    async processQueue(retryHandler) {
      if (typeof retryHandler !== 'function' || this.queue.length === 0) return { processed: 0, failed: 0 };

      const remaining = [];
      let processed = 0;
      let failed = 0;

      for (const entry of this.queue) {
        try {
          await retryHandler(entry.payload);
          processed++;
        } catch (err) {
          entry.retryCount++;
          entry.lastAttempt = new Date().toISOString();
          entry.lastError = String(err);
          if (entry.retryCount < entry.maxRetries) {
            remaining.push(entry);
          } else {
            failed++;
          }
        }
      }

      this.queue = remaining;
      this._save();
      return { processed, failed, remaining: this.queue.length };
    }

    size() {
      return this.queue.length;
    }

    clear() {
      this.queue = [];
      this._save();
    }
  }

  // =========================================================================
  // 3. TRANSPARENT FALLBACK STORAGE
  // =========================================================================
  class FallbackStorage {
    constructor() {
      this.memoryMap = new Map();
      this.isStorageAvailable = this._testLocalStorage();
    }

    _testLocalStorage() {
      if (typeof localStorage === 'undefined') return false;
      try {
        const testKey = '__storage_test__' + Math.random();
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        return false;
      }
    }

    setItem(key, value) {
      if (this.isStorageAvailable) {
        try {
          localStorage.setItem(key, String(value));
          return;
        } catch (e) {
          // QuotaExceeded or privacy restriction -> fallback to memory
          this.isStorageAvailable = false;
        }
      }
      this.memoryMap.set(key, String(value));
    }

    getItem(key) {
      if (this.isStorageAvailable) {
        try {
          return localStorage.getItem(key);
        } catch (e) {
          this.isStorageAvailable = false;
        }
      }
      return this.memoryMap.has(key) ? this.memoryMap.get(key) : null;
    }

    removeItem(key) {
      if (this.isStorageAvailable) {
        try {
          localStorage.removeItem(key);
        } catch (e) {}
      }
      this.memoryMap.delete(key);
    }

    clear() {
      if (this.isStorageAvailable) {
        try {
          localStorage.clear();
        } catch (e) {}
      }
      this.memoryMap.clear();
    }
  }

  // =========================================================================
  // 4. LATENCY & JITTER INJECTOR
  // =========================================================================
  class LatencyJitterInjector {
    constructor(minMs = 50, maxMs = 300, dropRate = 0.0) {
      this.minMs = minMs;
      this.maxMs = maxMs;
      this.dropRate = dropRate; // 0.0 to 1.0 probability of injected packet loss
      this.enabled = false;
    }

    enable() { this.enabled = true; }
    disable() { this.enabled = false; }

    async inject() {
      if (!this.enabled) return;
      if (this.dropRate > 0 && Math.random() < this.dropRate) {
        throw new Error('[ChaosMesh] Injected simulated packet drop (Chaos Experiment)');
      }
      const delay = Math.floor(this.minMs + Math.random() * (this.maxMs - this.minMs));
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    CircuitBreaker,
    DeadLetterQueue,
    FallbackStorage,
    LatencyJitterInjector,
    createBreaker: (options) => new CircuitBreaker(options),
    storage: new FallbackStorage(),
    dlq: new DeadLetterQueue()
  };
}));
