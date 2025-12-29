import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toCamelCase, toCamelCaseArray } from "./case-converter";

describe("case-converter", () => {
  describe("toCamelCase", () => {
    it("should convert snake_case to camelCase", () => {
      const input = {
        user_id: 1,
        parent_id: 2,
        created_at: "2024-01-01",
        updated_at: "2024-01-02",
      };

      const result = toCamelCase(input);

      assert.deepStrictEqual(result, {
        userId: 1,
        parentId: 2,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
      });
    });

    it("should handle mixed case keys", () => {
      const input = {
        id: 1,
        name: "test",
        user_id: 123,
        isActive: true,
      };

      const result = toCamelCase(input);

      assert.deepStrictEqual(result, {
        id: 1,
        name: "test",
        userId: 123,
        isActive: true,
      });
    });

    it("should handle multiple underscores", () => {
      const input = {
        some_long_field_name: "value",
        another_field: "test",
      };

      const result = toCamelCase(input);

      assert.deepStrictEqual(result, {
        someLongFieldName: "value",
        anotherField: "test",
      });
    });

    it("should preserve null and undefined values", () => {
      const input = {
        parent_id: null,
        optional_field: undefined,
        content: "test",
      };

      const result = toCamelCase(input);

      assert.deepStrictEqual(result, {
        parentId: null,
        optionalField: undefined,
        content: "test",
      });
    });

    it("should handle empty object", () => {
      const input = {};

      const result = toCamelCase(input);

      assert.deepStrictEqual(result, {});
    });

    it("should handle object with nested values", () => {
      const input = {
        user_id: 1,
        nested_object: { key: "value" },
        array_field: [1, 2, 3],
      };

      const result = toCamelCase(input);

      assert.deepStrictEqual(result, {
        userId: 1,
        nestedObject: { key: "value" },
        arrayField: [1, 2, 3],
      });
    });
  });

  describe("toCamelCaseArray", () => {
    it("should convert array of snake_case objects to camelCase", () => {
      const input = [
        { user_id: 1, parent_id: null },
        { user_id: 2, parent_id: 1 },
        { user_id: 3, parent_id: 2 },
      ];

      const result = toCamelCaseArray(input);

      assert.deepStrictEqual(result, [
        { userId: 1, parentId: null },
        { userId: 2, parentId: 1 },
        { userId: 3, parentId: 2 },
      ]);
    });

    it("should handle empty array", () => {
      const input: Record<string, unknown>[] = [];

      const result = toCamelCaseArray(input);

      assert.deepStrictEqual(result, []);
    });

    it("should handle array with mixed objects", () => {
      const input = [
        { id: 1, name: "John" },
        { user_id: 2, created_at: "2024-01-01" },
      ];

      const result = toCamelCaseArray(input);

      assert.deepStrictEqual(result, [
        { id: 1, name: "John" },
        { userId: 2, createdAt: "2024-01-01" },
      ]);
    });
  });
});
