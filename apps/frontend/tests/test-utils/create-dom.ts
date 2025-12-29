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
}

export function cleanupDOM(): void {
  if (currentDOM) {
    currentDOM.window.close();
    currentDOM = null;
  }
}
