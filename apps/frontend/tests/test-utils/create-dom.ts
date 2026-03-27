import { JSDOM } from "jsdom";
import React from "react";

let currentDOM: JSDOM | null = null;

export function createDOM(): void {
  // Clean up existing DOM if any
  if (currentDOM) {
    currentDOM.window.close();
  }

  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "http://localhost",
    pretendToBeVisual: true,
  });

  currentDOM = dom;

  // Use Object.defineProperty to avoid "Cannot set property" errors
  Object.defineProperty(globalThis, "document", {
    value: dom.window.document,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(globalThis, "window", {
    value: dom.window,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(globalThis, "navigator", {
    value: dom.window.navigator,
    writable: true,
    configurable: true,
  });

  // Make React available globally for JSX transform
  Object.defineProperty(globalThis, "React", {
    value: React,
    writable: true,
    configurable: true,
  });

  // Use JSDOM's built-in sessionStorage
  Object.defineProperty(globalThis, "sessionStorage", {
    value: dom.window.sessionStorage,
    writable: true,
    configurable: true,
  });

  // Expose Storage and StorageEvent constructors
  Object.defineProperty(globalThis, "Storage", {
    value: dom.window.Storage,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(globalThis, "StorageEvent", {
    value: dom.window.StorageEvent,
    writable: true,
    configurable: true,
  });

  // Stub fetch so tests never make real network connections.
  // Node 25+ ships with native fetch which would actually attempt to reach
  // localhost:3001 (the backend) when providers like ProgressProvider mount.
  Object.defineProperty(globalThis, "fetch", {
    value: async (input: RequestInfo | URL): Promise<Response> => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : (input as Request).url;

      if (url.includes("/progress")) {
        return new Response(JSON.stringify({ xp: 0, level: 1, completedTasks: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Default: return empty 200 for any other API call
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
    writable: true,
    configurable: true,
  });
}

export function cleanupDOM(): void {
  if (currentDOM) {
    currentDOM.window.close();
    currentDOM = null;
  }
}
