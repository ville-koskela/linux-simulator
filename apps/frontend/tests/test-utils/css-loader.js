// CSS loader for Node.js tests
// This prevents CSS imports from causing errors during testing

import { resolve as resolvePath } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Hook to handle CSS imports
export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('.css')) {
    // Need to resolve to an absolute URL
    const parentURL = context.parentURL
      ? fileURLToPath(context.parentURL)
      : process.cwd();
    const resolvedPath = resolvePath(parentURL, '..', specifier);
    return {
      url: pathToFileURL(resolvedPath).href,
      shortCircuit: true,
    };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.css')) {
    return {
      format: 'module',
      shortCircuit: true,
      source: 'export default {};',
    };
  }
  return nextLoad(url, context);
}
