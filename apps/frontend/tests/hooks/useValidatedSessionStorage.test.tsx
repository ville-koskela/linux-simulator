import assert from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import { act, renderHook } from "@testing-library/react";
import { z } from "zod";
import { useValidatedSessionStorage } from "../../src/hooks/useValidatedSessionStorage";
import { createDOM } from "../test-utils/create-dom";

describe("useValidatedSessionStorage", () => {
  beforeEach(() => {
    createDOM();
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("should return initial value when sessionStorage is empty", () => {
    const schema = z.string();
    const { result } = renderHook(() =>
      useValidatedSessionStorage("test-key", "initial value", schema)
    );

    assert.strictEqual(result.current[0], "initial value");
  });

  it("should return stored value when sessionStorage has valid data", () => {
    const schema = z.string();
    sessionStorage.setItem("test-key", JSON.stringify("stored value"));

    const { result } = renderHook(() =>
      useValidatedSessionStorage("test-key", "initial value", schema)
    );

    assert.strictEqual(result.current[0], "stored value");
  });

  it("should update sessionStorage when value changes", () => {
    const schema = z.string();
    const { result } = renderHook(() =>
      useValidatedSessionStorage("test-key", "initial value", schema)
    );

    act(() => {
      result.current[1]("new value");
    });

    assert.strictEqual(result.current[0], "new value");
    assert.strictEqual(sessionStorage.getItem("test-key"), JSON.stringify("new value"));
  });

  it("should work with complex validated objects", () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
      active: z.boolean(),
    });

    type TestObject = z.infer<typeof schema>;

    const initialObj: TestObject = { name: "John", age: 30, active: true };
    const { result } = renderHook(() => useValidatedSessionStorage("test-obj", initialObj, schema));

    assert.deepStrictEqual(result.current[0], initialObj);

    const updatedObj: TestObject = { name: "Jane", age: 25, active: false };
    act(() => {
      result.current[1](updatedObj);
    });

    assert.deepStrictEqual(result.current[0], updatedObj);
    assert.deepStrictEqual(JSON.parse(sessionStorage.getItem("test-obj") || "{}"), updatedObj);
  });

  it("should support updater function like useState", () => {
    const schema = z.number();
    const { result } = renderHook(() => useValidatedSessionStorage("counter", 0, schema));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    assert.strictEqual(result.current[0], 1);

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    assert.strictEqual(result.current[0], 6);
  });

  it("should handle invalid JSON in sessionStorage gracefully", () => {
    const schema = z.string();
    sessionStorage.setItem("test-key", "invalid json {");

    const { result } = renderHook(() =>
      useValidatedSessionStorage("test-key", "fallback value", schema)
    );

    assert.strictEqual(result.current[0], "fallback value");
  });

  it("should reject and remove invalid data that fails schema validation", () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    type TestObject = z.infer<typeof schema>;

    // Store data that doesn't match the schema
    sessionStorage.setItem("test-key", JSON.stringify({ name: "John", age: "not a number" }));

    const initialObj: TestObject = { name: "Default", age: 0 };
    const { result } = renderHook(() => useValidatedSessionStorage("test-key", initialObj, schema));

    // Should return initial value since stored data is invalid
    assert.deepStrictEqual(result.current[0], initialObj);

    // Invalid data should be removed from sessionStorage
    assert.strictEqual(sessionStorage.getItem("test-key"), null);
  });

  it("should not update state or storage when setting invalid data", () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    type TestObject = z.infer<typeof schema>;

    const validObj: TestObject = { name: "John", age: 30 };
    const { result } = renderHook(() => useValidatedSessionStorage("test-key", validObj, schema));

    // Try to set invalid data
    act(() => {
      result.current[1]({ name: "Jane", age: "invalid" } as unknown as TestObject);
    });

    // State should remain unchanged
    assert.deepStrictEqual(result.current[0], validObj);

    // SessionStorage should remain empty (no valid data was ever stored)
    assert.strictEqual(sessionStorage.getItem("test-key"), null);
  });

  it("should handle sessionStorage quota exceeded error", () => {
    const schema = z.string();
    const { result } = renderHook(() =>
      useValidatedSessionStorage("test-key", "initial value", schema)
    );

    // Mock sessionStorage.setItem to throw quota exceeded error
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = (): void => {
      throw new Error("QuotaExceededError");
    };

    act(() => {
      result.current[1]("new value");
    });

    // State should still update even if sessionStorage fails
    assert.strictEqual(result.current[0], "new value");

    Storage.prototype.setItem = originalSetItem;
  });

  it("should sync across tabs when storage event is fired with valid data", () => {
    const schema = z.string();
    const { result } = renderHook(() =>
      useValidatedSessionStorage("test-key", "initial value", schema)
    );

    assert.strictEqual(result.current[0], "initial value");

    // Simulate storage event from another tab
    act(() => {
      const storageEvent = new StorageEvent("storage", {
        key: "test-key",
        newValue: JSON.stringify("value from another tab"),
        storageArea: sessionStorage,
      });
      window.dispatchEvent(storageEvent);
    });

    assert.strictEqual(result.current[0], "value from another tab");
  });

  it("should ignore storage events for different keys", () => {
    const schema = z.string();
    const { result } = renderHook(() =>
      useValidatedSessionStorage("test-key", "initial value", schema)
    );

    act(() => {
      result.current[1]("updated value");
    });

    assert.strictEqual(result.current[0], "updated value");

    // Simulate storage event for a different key
    act(() => {
      const storageEvent = new StorageEvent("storage", {
        key: "different-key",
        newValue: JSON.stringify("other value"),
        storageArea: sessionStorage,
      });
      window.dispatchEvent(storageEvent);
    });

    // Value should remain unchanged
    assert.strictEqual(result.current[0], "updated value");
  });

  it("should handle storage event with null newValue", () => {
    const schema = z.string();
    const { result } = renderHook(() =>
      useValidatedSessionStorage("test-key", "initial value", schema)
    );

    act(() => {
      result.current[1]("updated value");
    });

    assert.strictEqual(result.current[0], "updated value");

    // Simulate storage event with null newValue (key was removed)
    act(() => {
      const storageEvent = new StorageEvent("storage", {
        key: "test-key",
        newValue: null,
        storageArea: sessionStorage,
      });
      window.dispatchEvent(storageEvent);
    });

    // Value should remain unchanged when newValue is null
    assert.strictEqual(result.current[0], "updated value");
  });

  it("should ignore storage events with invalid data", () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    type TestObject = z.infer<typeof schema>;

    const validObj: TestObject = { name: "John", age: 30 };
    const { result } = renderHook(() => useValidatedSessionStorage("test-key", validObj, schema));

    act(() => {
      result.current[1](validObj);
    });

    assert.deepStrictEqual(result.current[0], validObj);

    // Simulate storage event with data that fails validation
    act(() => {
      const storageEvent = new StorageEvent("storage", {
        key: "test-key",
        newValue: JSON.stringify({ name: "Jane", age: "invalid" }),
        storageArea: sessionStorage,
      });
      window.dispatchEvent(storageEvent);
    });

    // Value should remain unchanged since new data is invalid
    assert.deepStrictEqual(result.current[0], validObj);
  });

  it("should work with array schemas", () => {
    const schema = z.array(z.number());

    const { result } = renderHook(() => useValidatedSessionStorage("numbers", [1, 2, 3], schema));

    assert.deepStrictEqual(result.current[0], [1, 2, 3]);

    act(() => {
      result.current[1]([4, 5, 6]);
    });

    assert.deepStrictEqual(result.current[0], [4, 5, 6]);
    assert.deepStrictEqual(JSON.parse(sessionStorage.getItem("numbers") || "[]"), [4, 5, 6]);
  });

  it("should validate array data and reject invalid items", () => {
    const schema = z.array(z.number());

    sessionStorage.setItem("numbers", JSON.stringify([1, 2, "invalid", 4]));

    const { result } = renderHook(() => useValidatedSessionStorage("numbers", [0], schema));

    // Should return initial value and remove invalid data
    assert.deepStrictEqual(result.current[0], [0]);
    assert.strictEqual(sessionStorage.getItem("numbers"), null);
  });

  it("should work with optional and nullable fields", () => {
    const schema = z.object({
      name: z.string(),
      nickname: z.string().optional(),
      email: z.string().nullable(),
    });

    type TestObject = z.infer<typeof schema>;

    const obj: TestObject = { name: "John", email: null };
    const { result } = renderHook(() => useValidatedSessionStorage("user", obj, schema));

    assert.deepStrictEqual(result.current[0], obj);

    act(() => {
      result.current[1]({ name: "Jane", nickname: "Janie", email: "jane@example.com" });
    });

    assert.deepStrictEqual(result.current[0], {
      name: "Jane",
      nickname: "Janie",
      email: "jane@example.com",
    });
  });

  it("should handle storage event with invalid JSON", () => {
    const schema = z.string();
    const { result } = renderHook(() =>
      useValidatedSessionStorage("test-key", "initial value", schema)
    );

    act(() => {
      result.current[1]("updated value");
    });

    // Simulate storage event with invalid JSON
    act(() => {
      const storageEvent = new StorageEvent("storage", {
        key: "test-key",
        newValue: "invalid json {",
        storageArea: sessionStorage,
      });
      window.dispatchEvent(storageEvent);
    });

    // Value should remain unchanged when JSON parsing fails
    assert.strictEqual(result.current[0], "updated value");
  });
});
