import assert from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { act, renderHook } from '@testing-library/react';
import { JSDOM } from 'jsdom';
import { useLocalStorage } from '../../src/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  let dom: JSDOM;

  beforeEach(() => {
    // Create a new DOM for each test
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
    });

    // Set up globals
    global.window = dom.window as unknown as Window & typeof globalThis;
    global.document = dom.window.document;
    global.localStorage = dom.window.localStorage;
    global.StorageEvent = dom.window.StorageEvent;
    global.Storage = dom.window.Storage;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial value')
    );

    assert.strictEqual(result.current[0], 'initial value');
  });

  it('should return stored value when localStorage has data', () => {
    localStorage.setItem('test-key', JSON.stringify('stored value'));

    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial value')
    );

    assert.strictEqual(result.current[0], 'stored value');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial value')
    );

    act(() => {
      result.current[1]('new value');
    });

    assert.strictEqual(result.current[0], 'new value');
    assert.strictEqual(
      localStorage.getItem('test-key'),
      JSON.stringify('new value')
    );
  });

  it('should work with complex objects', () => {
    interface TestObject {
      name: string;
      age: number;
      active: boolean;
    }

    const initialObj: TestObject = { name: 'John', age: 30, active: true };
    const { result } = renderHook(() =>
      useLocalStorage('test-obj', initialObj)
    );

    assert.deepStrictEqual(result.current[0], initialObj);

    const updatedObj: TestObject = { name: 'Jane', age: 25, active: false };
    act(() => {
      result.current[1](updatedObj);
    });

    assert.deepStrictEqual(result.current[0], updatedObj);
    assert.deepStrictEqual(
      JSON.parse(localStorage.getItem('test-obj') || '{}'),
      updatedObj
    );
  });

  it('should support updater function like useState', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    assert.strictEqual(result.current[0], 1);

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    assert.strictEqual(result.current[0], 6);
  });

  it('should handle invalid JSON in localStorage gracefully', () => {
    localStorage.setItem('test-key', 'invalid json {');

    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'fallback value')
    );

    assert.strictEqual(result.current[0], 'fallback value');
  });

  it('should handle localStorage quota exceeded error', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial value')
    );

    // Mock localStorage.setItem to throw quota exceeded error
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error('QuotaExceededError');
    };

    act(() => {
      result.current[1]('new value');
    });

    // State should still update even if localStorage fails
    assert.strictEqual(result.current[0], 'new value');

    Storage.prototype.setItem = originalSetItem;
  });

  it('should sync across tabs when storage event is fired', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial value')
    );

    assert.strictEqual(result.current[0], 'initial value');

    // Simulate storage event from another tab
    act(() => {
      const storageEvent = new StorageEvent('storage', {
        key: 'test-key',
        newValue: JSON.stringify('value from another tab'),
        storageArea: localStorage,
      });
      window.dispatchEvent(storageEvent);
    });

    assert.strictEqual(result.current[0], 'value from another tab');
  });

  it('should ignore storage events for different keys', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial value')
    );

    act(() => {
      result.current[1]('updated value');
    });

    assert.strictEqual(result.current[0], 'updated value');

    // Simulate storage event for a different key
    act(() => {
      const storageEvent = new StorageEvent('storage', {
        key: 'different-key',
        newValue: JSON.stringify('other value'),
        storageArea: localStorage,
      });
      window.dispatchEvent(storageEvent);
    });

    // Value should remain unchanged
    assert.strictEqual(result.current[0], 'updated value');
  });

  it('should handle storage event with null newValue', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial value')
    );

    act(() => {
      result.current[1]('updated value');
    });

    assert.strictEqual(result.current[0], 'updated value');

    // Simulate storage event with null newValue (key was removed)
    act(() => {
      const storageEvent = new StorageEvent('storage', {
        key: 'test-key',
        newValue: null,
        storageArea: localStorage,
      });
      window.dispatchEvent(storageEvent);
    });

    // Value should remain unchanged when newValue is null
    assert.strictEqual(result.current[0], 'updated value');
  });
});
