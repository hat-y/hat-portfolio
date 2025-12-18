import { Injectable } from '@angular/core';

export interface PerformanceMetrics {
  fps: number;
  memoryUsage?: number;
  renderTime: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private frameCount = 0;
  private lastFrameTime = performance.now();
  private fps = 60;
  private observers: PerformanceObserver[] = [];
  private metrics: PerformanceMetrics[] = [];
  private maxMetricsStored = 100;

  constructor() {
    this.initializeFPSMonitor();
    this.initializePerformanceObservers();
  }

  /**
   * Monitor FPS to detect performance issues
   */
  private initializeFPSMonitor(): void {
    const measureFPS = () => {
      this.frameCount++;
      const currentTime = performance.now();

      if (currentTime - this.lastFrameTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFrameTime));
        this.frameCount = 0;
        this.lastFrameTime = currentTime;

        // Store metrics
        this.addMetric({
          fps: this.fps,
          renderTime: 0,
          timestamp: currentTime
        });

        // Alert if performance is poor
        if (this.fps < 30) {
          console.warn(`Low FPS detected: ${this.fps}`);
          this.suggestOptimizations();
        }
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  /**
   * Initialize Performance Observers for measuring render times
   */
  private initializePerformanceObservers(): void {
    if ('PerformanceObserver' in window) {
      // Measure navigation timing
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const navEntry = entry as PerformanceNavigationTiming;
          const renderTime = navEntry.loadEventEnd - navEntry.loadEventStart;

          this.addMetric({
            fps: this.fps,
            renderTime,
            timestamp: navEntry.loadEventEnd
          });
        }
      });

      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);

      // Measure paint timing
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`${entry.name}: ${entry.startTime}ms`);
        }
      });

      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // Measure long tasks (indicating potential blocking operations)
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn(`Long task detected: ${entry.duration}ms`);
          this.optimizeForLongTasks(entry.duration);
        }
      });

      if ('longtask' in PerformanceObserver.supportedEntryTypes) {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      }
    }
  }

  /**
   * Add performance metric to history
   */
  private addMetric(metric: PerformanceMetrics): void {
    // Add memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metric.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsStored) {
      this.metrics.shift();
    }
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    return {
      fps: this.fps,
      memoryUsage: this.getMemoryUsage(),
      renderTime: this.getAverageRenderTime(),
      timestamp: performance.now()
    };
  }

  /**
   * Get memory usage in MB
   */
  getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100;
    }
    return 0;
  }

  /**
   * Get average render time from recent metrics
   */
  private getAverageRenderTime(): number {
    if (this.metrics.length === 0) return 0;

    const recentMetrics = this.metrics.slice(-10);
    const totalTime = recentMetrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    return Math.round(totalTime / recentMetrics.length * 100) / 100;
  }

  /**
   * Suggest optimizations based on performance issues
   */
  private suggestOptimizations(): void {
    const suggestions = [];

    if (this.fps < 30) {
      suggestions.push('Consider reducing animations or CSS effects');
      suggestions.push('Check for expensive DOM operations');
    }

    const memoryUsage = this.getMemoryUsage();
    if (memoryUsage > 100) {
      suggestions.push('High memory usage detected, check for memory leaks');
      suggestions.push('Consider implementing object pooling');
    }

    const avgRenderTime = this.getAverageRenderTime();
    if (avgRenderTime > 100) {
      suggestions.push('Slow render times detected, optimize critical rendering path');
    }

    if (suggestions.length > 0) {
      console.group('Performance Optimization Suggestions:');
      suggestions.forEach(suggestion => console.log(`• ${suggestion}`));
      console.groupEnd();
    }
  }

  /**
   * Optimize for detected long tasks
   */
  private optimizeForLongTasks(duration: number): void {
    if (duration > 100) {
      // Suggest breaking up long tasks
      console.log('Consider breaking up long operations with setTimeout or requestIdleCallback');
    }
  }

  /**
   * Measure function execution time
   */
  measureFunction<T>(fn: () => T, label: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    console.log(`${label}: ${end - start}ms`);
    return result;
  }

  /**
   * Async function to measure execution time
   */
  async measureAsyncFunction<T>(fn: () => Promise<T>, label: string): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    console.log(`${label}: ${end - start}ms`);
    return result;
  }

  /**
   * Throttle function calls to improve performance
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Debounce function calls to reduce frequency
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let debounceTimer: number;

    return (...args: Parameters<T>) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Cleanup performance observers
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}