import { WindowManager } from './components/WindowManager';
import { WindowTaskbar } from './components/WindowTaskbar';
import './App.css';

export function App() {
  return (
    <div className="App">
      <WindowManager />
      <WindowTaskbar />
    </div>
  );
}
