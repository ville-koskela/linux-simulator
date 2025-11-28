# Hooks

Custom React hooks used throughout the application.

## useLocalStorage

A reusable hook for managing state that persists in localStorage.

### Usage

```tsx
import { useLocalStorage } from '../hooks';

function MyComponent() {
  const [name, setName] = useLocalStorage<string>('user-name', 'Guest');
  
  return (
    <div>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
      />
    </div>
  );
}
```

### Features

- **Type-safe**: Fully typed with TypeScript generics
- **Simple API**: Works exactly like `useState`
- **Automatic persistence**: Saves to localStorage on every change
- **Cross-tab sync**: Listens for storage events and updates when changed in other tabs
- **Error handling**: Gracefully handles localStorage errors (e.g., quota exceeded, disabled storage)
- **SSR-safe**: Can be used in server-side rendering contexts

### Parameters

- `key` (string): The localStorage key to use for storing the value
- `initialValue` (T): The initial value to use if no stored value exists

### Returns

A tuple `[value, setValue]` where:
- `value`: The current value (either from localStorage or the initial value)
- `setValue`: A function to update the value (accepts either a new value or an updater function)

### Implementation Notes

The hook automatically:
1. Reads from localStorage on mount
2. Saves to localStorage whenever the value changes
3. Syncs across browser tabs/windows using the `storage` event
4. Handles JSON serialization/deserialization
5. Falls back to initial value if localStorage is unavailable or contains invalid data
