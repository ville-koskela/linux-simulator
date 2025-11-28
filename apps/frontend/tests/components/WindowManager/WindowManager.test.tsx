import { strict as assert } from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { fireEvent } from '@testing-library/react';
import { WindowManager } from '../../../src/components/WindowManager';
import { useWindows } from '../../../src/contexts';
import { createDOM } from '../../test-utils/create-dom';
import { renderWithProviders } from '../../test-utils/render-with-providers';

// Helper component to create windows programmatically
const WindowCreator = ({
  onCreate,
}: {
  onCreate: (
    createWindow: ReturnType<typeof useWindows>['createWindow']
  ) => void;
}) => {
  const { createWindow } = useWindows();

  return (
    <button type="button" onClick={() => onCreate(createWindow)}>
      Create Window
    </button>
  );
};

describe('WindowManager', () => {
  beforeEach(() => {
    createDOM();
  });

  test('renders nothing when no windows exist', () => {
    const { container } = renderWithProviders(<WindowManager />);

    const windows = container.querySelectorAll('.floating-window');
    assert.equal(windows.length, 0);
  });

  test('renders a single window from context', () => {
    const { container, getByText } = renderWithProviders(
      <>
        <WindowCreator
          onCreate={(createWindow) => {
            createWindow({
              id: 'test-window',
              title: 'Test Window',
              content: <div>Test Content</div>,
            });
          }}
        />
        <WindowManager />
      </>
    );

    const createButton = getByText('Create Window');
    fireEvent.click(createButton);

    const windows = container.querySelectorAll('.floating-window');
    assert.equal(windows.length, 1);

    const windowTitle = getByText('Test Window');
    const windowContent = getByText('Test Content');
    assert.ok(windowTitle);
    assert.ok(windowContent);
  });

  test('renders multiple windows from context', () => {
    const { container, getByText } = renderWithProviders(
      <>
        <WindowCreator
          onCreate={(createWindow) => {
            createWindow({
              id: 'window-1',
              title: 'Window 1',
              content: <div>Content 1</div>,
            });
            createWindow({
              id: 'window-2',
              title: 'Window 2',
              content: <div>Content 2</div>,
            });
            createWindow({
              id: 'window-3',
              title: 'Window 3',
              content: <div>Content 3</div>,
            });
          }}
        />
        <WindowManager />
      </>
    );

    const createButton = getByText('Create Window');
    fireEvent.click(createButton);

    const windows = container.querySelectorAll('.floating-window');
    assert.equal(windows.length, 3);

    assert.ok(getByText('Window 1'));
    assert.ok(getByText('Window 2'));
    assert.ok(getByText('Window 3'));
    assert.ok(getByText('Content 1'));
    assert.ok(getByText('Content 2'));
    assert.ok(getByText('Content 3'));
  });

  test('does not render minimized windows', () => {
    const TestComponent = () => {
      const { createWindow, minimizeWindow } = useWindows();

      return (
        <>
          <button
            type="button"
            onClick={() => {
              createWindow({
                id: 'visible-window',
                title: 'Visible',
                content: <div>I am visible</div>,
              });
              createWindow({
                id: 'minimized-window',
                title: 'Minimized',
                content: <div>I am hidden</div>,
              });
              minimizeWindow('minimized-window');
            }}
          >
            Create Windows
          </button>
          <WindowManager />
        </>
      );
    };

    const { container, getByText, queryByText } = renderWithProviders(
      <TestComponent />
    );

    const createButton = getByText('Create Windows');
    fireEvent.click(createButton);

    const windows = container.querySelectorAll('.floating-window');
    assert.equal(windows.length, 1, 'Only one window should be visible');

    assert.ok(getByText('Visible'));
    assert.ok(getByText('I am visible'));
    assert.equal(queryByText('Minimized'), null);
    assert.equal(queryByText('I am hidden'), null);
  });

  test('brings window to front on mouse down', () => {
    const TestComponent = () => {
      const { createWindow, windows } = useWindows();

      return (
        <>
          <button
            type="button"
            onClick={() => {
              createWindow({
                id: 'window-1',
                title: 'Window 1',
                content: <div>Content 1</div>,
              });
              createWindow({
                id: 'window-2',
                title: 'Window 2',
                content: <div>Content 2</div>,
              });
            }}
          >
            Create Windows
          </button>
          <WindowManager />
          <div data-testid="z-index-display">
            {windows.map((w) => (
              <div key={w.id} data-window-id={w.id}>
                {w.id}: {w.zIndex}
              </div>
            ))}
          </div>
        </>
      );
    };

    const { container, getByText } = renderWithProviders(<TestComponent />);

    const createButton = getByText('Create Windows');
    fireEvent.click(createButton);

    const windowWrappers = container.querySelectorAll(
      '[role="button"][aria-label^="Window:"]'
    );
    assert.equal(windowWrappers.length, 2);

    const window1Wrapper = Array.from(windowWrappers).find(
      (el) => el.getAttribute('aria-label') === 'Window: Window 1'
    );

    assert.ok(window1Wrapper);

    // Get initial z-index values
    const zIndexDisplay = container.querySelector(
      '[data-testid="z-index-display"]'
    );
    const initialZIndex1 = zIndexDisplay?.querySelector(
      '[data-window-id="window-1"]'
    )?.textContent;
    const initialZIndex2 = zIndexDisplay?.querySelector(
      '[data-window-id="window-2"]'
    )?.textContent;

    // Click on window 1 to bring it to front
    fireEvent.mouseDown(window1Wrapper);

    const newZIndex1 = zIndexDisplay?.querySelector(
      '[data-window-id="window-1"]'
    )?.textContent;
    const newZIndex2 = zIndexDisplay?.querySelector(
      '[data-window-id="window-2"]'
    )?.textContent;

    // Window 1 should have a higher z-index after being clicked
    assert.notEqual(initialZIndex1, newZIndex1);
    assert.equal(initialZIndex2, newZIndex2);
  });

  test('brings window to front on Enter key', () => {
    const TestComponent = () => {
      const { createWindow, windows } = useWindows();

      return (
        <>
          <button
            type="button"
            onClick={() => {
              createWindow({
                id: 'window-1',
                title: 'Window 1',
                content: <div>Content 1</div>,
              });
            }}
          >
            Create Window
          </button>
          <WindowManager />
          <div data-testid="z-index-display">
            {windows.map((w) => (
              <div key={w.id} data-window-id={w.id}>
                {w.zIndex}
              </div>
            ))}
          </div>
        </>
      );
    };

    const { container, getByText } = renderWithProviders(<TestComponent />);

    const createButton = getByText('Create Window');
    fireEvent.click(createButton);

    const windowWrapper = container.querySelector(
      '[role="button"][aria-label="Window: Window 1"]'
    );
    assert.ok(windowWrapper);

    const zIndexDisplay = container.querySelector(
      '[data-testid="z-index-display"]'
    );
    const initialZIndex = zIndexDisplay?.querySelector(
      '[data-window-id="window-1"]'
    )?.textContent;

    // Press Enter on the window wrapper
    fireEvent.keyDown(windowWrapper, { key: 'Enter' });

    const newZIndex = zIndexDisplay?.querySelector(
      '[data-window-id="window-1"]'
    )?.textContent;

    // Z-index should increase after Enter key
    assert.notEqual(initialZIndex, newZIndex);
  });

  test('brings window to front on Space key', () => {
    const TestComponent = () => {
      const { createWindow, windows } = useWindows();

      return (
        <>
          <button
            type="button"
            onClick={() => {
              createWindow({
                id: 'window-1',
                title: 'Window 1',
                content: <div>Content 1</div>,
              });
            }}
          >
            Create Window
          </button>
          <WindowManager />
          <div data-testid="z-index-display">
            {windows.map((w) => (
              <div key={w.id} data-window-id={w.id}>
                {w.zIndex}
              </div>
            ))}
          </div>
        </>
      );
    };

    const { container, getByText } = renderWithProviders(<TestComponent />);

    const createButton = getByText('Create Window');
    fireEvent.click(createButton);

    const windowWrapper = container.querySelector(
      '[role="button"][aria-label="Window: Window 1"]'
    );
    assert.ok(windowWrapper);

    const zIndexDisplay = container.querySelector(
      '[data-testid="z-index-display"]'
    );
    const initialZIndex = zIndexDisplay?.querySelector(
      '[data-window-id="window-1"]'
    )?.textContent;

    // Press Space on the window wrapper
    fireEvent.keyDown(windowWrapper, { key: ' ' });

    const newZIndex = zIndexDisplay?.querySelector(
      '[data-window-id="window-1"]'
    )?.textContent;

    // Z-index should increase after Space key
    assert.notEqual(initialZIndex, newZIndex);
  });

  test('does not bring window to front on other keys', () => {
    const TestComponent = () => {
      const { createWindow, windows } = useWindows();

      return (
        <>
          <button
            type="button"
            onClick={() => {
              createWindow({
                id: 'window-1',
                title: 'Window 1',
                content: <div>Content 1</div>,
              });
            }}
          >
            Create Window
          </button>
          <WindowManager />
          <div data-testid="z-index-display">
            {windows.map((w) => (
              <div key={w.id} data-window-id={w.id}>
                {w.zIndex}
              </div>
            ))}
          </div>
        </>
      );
    };

    const { container, getByText } = renderWithProviders(<TestComponent />);

    const createButton = getByText('Create Window');
    fireEvent.click(createButton);

    const windowWrapper = container.querySelector(
      '[role="button"][aria-label="Window: Window 1"]'
    );
    assert.ok(windowWrapper);

    const zIndexDisplay = container.querySelector(
      '[data-testid="z-index-display"]'
    );
    const initialZIndex = zIndexDisplay?.querySelector(
      '[data-window-id="window-1"]'
    )?.textContent;

    // Press Tab key (should not trigger bringToFront)
    fireEvent.keyDown(windowWrapper, { key: 'Tab' });

    const newZIndex = zIndexDisplay?.querySelector(
      '[data-window-id="window-1"]'
    )?.textContent;

    // Z-index should remain the same
    assert.equal(initialZIndex, newZIndex);
  });

  test('passes window properties to FloatingWindow', () => {
    const { container, getByText } = renderWithProviders(
      <>
        <WindowCreator
          onCreate={(createWindow) => {
            createWindow({
              id: 'custom-window',
              title: 'Custom Window',
              content: <div>Custom Content</div>,
              initialX: 250,
              initialY: 300,
              initialWidth: 600,
              initialHeight: 450,
              minWidth: 400,
              minHeight: 300,
              className: 'custom-class',
              style: { backgroundColor: 'lightblue' },
            });
          }}
        />
        <WindowManager />
      </>
    );

    const createButton = getByText('Create Window');
    fireEvent.click(createButton);

    const window = container.querySelector(
      '.floating-window.custom-class'
    ) as HTMLElement;
    assert.ok(window);
    assert.equal(window.style.left, '250px');
    assert.equal(window.style.top, '300px');
    assert.equal(window.style.width, '600px');
    assert.equal(window.style.height, '450px');
    assert.equal(window.style.backgroundColor, 'lightblue');

    const title = getByText('Custom Window');
    const content = getByText('Custom Content');
    assert.ok(title);
    assert.ok(content);
  });

  test('applies z-index from window state', () => {
    const { container, getByText } = renderWithProviders(
      <>
        <WindowCreator
          onCreate={(createWindow) => {
            createWindow({
              id: 'window-1',
              title: 'Window 1',
              content: <div>Content 1</div>,
            });
            createWindow({
              id: 'window-2',
              title: 'Window 2',
              content: <div>Content 2</div>,
            });
          }}
        />
        <WindowManager />
      </>
    );

    const createButton = getByText('Create Window');
    fireEvent.click(createButton);

    const windows = container.querySelectorAll(
      '.floating-window'
    ) as NodeListOf<HTMLElement>;
    assert.equal(windows.length, 2);

    // Each window should have a z-index
    for (const window of windows) {
      const zIndex = window.style.zIndex;
      assert.ok(zIndex);
      assert.ok(Number.parseInt(zIndex, 10) > 0);
    }
  });

  test('calls closeWindow when FloatingWindow onClose is triggered', () => {
    const TestComponent = () => {
      const { windows } = useWindows();

      return (
        <>
          <div data-testid="window-count">{windows.length}</div>
          <WindowManager />
        </>
      );
    };

    const { container, getByText, getByRole } = renderWithProviders(
      <>
        <WindowCreator
          onCreate={(createWindow) => {
            createWindow({
              id: 'closable-window',
              title: 'Closable Window',
              content: <div>Will be closed</div>,
            });
          }}
        />
        <TestComponent />
      </>
    );

    const createButton = getByText('Create Window');
    fireEvent.click(createButton);

    const windowCount = container.querySelector('[data-testid="window-count"]');
    assert.equal(windowCount?.textContent, '1');

    const closeButton = getByRole('button', { name: 'Close window' });
    fireEvent.click(closeButton);

    assert.equal(windowCount?.textContent, '0');
  });

  test('window wrapper has correct accessibility attributes', () => {
    const { container, getByText } = renderWithProviders(
      <>
        <WindowCreator
          onCreate={(createWindow) => {
            createWindow({
              id: 'accessible-window',
              title: 'Accessible Window',
              content: <div>Content</div>,
            });
          }}
        />
        <WindowManager />
      </>
    );

    const createButton = getByText('Create Window');
    fireEvent.click(createButton);

    const wrapper = container.querySelector(
      '[role="button"][aria-label="Window: Accessible Window"]'
    );
    assert.ok(wrapper);
    assert.equal(wrapper.getAttribute('role'), 'button');
    assert.equal(wrapper.getAttribute('tabIndex'), '0');
    assert.equal(
      wrapper.getAttribute('aria-label'),
      'Window: Accessible Window'
    );
  });

  test('renders windows with unique keys', () => {
    const { container, getByText } = renderWithProviders(
      <>
        <WindowCreator
          onCreate={(createWindow) => {
            createWindow({
              id: 'window-1',
              title: 'Window 1',
              content: <div>Content 1</div>,
            });
            createWindow({
              id: 'window-2',
              title: 'Window 2',
              content: <div>Content 2</div>,
            });
          }}
        />
        <WindowManager />
      </>
    );

    const createButton = getByText('Create Window');
    fireEvent.click(createButton);

    const wrapper1 = container.querySelector('[aria-label="Window: Window 1"]');
    const wrapper2 = container.querySelector('[aria-label="Window: Window 2"]');

    assert.ok(wrapper1);
    assert.ok(wrapper2);
    assert.notEqual(wrapper1, wrapper2);
  });

  test('merges window style with z-index', () => {
    const { container, getByText } = renderWithProviders(
      <>
        <WindowCreator
          onCreate={(createWindow) => {
            createWindow({
              id: 'styled-window',
              title: 'Styled Window',
              content: <div>Content</div>,
              style: {
                backgroundColor: 'yellow',
                border: '2px solid red',
              },
            });
          }}
        />
        <WindowManager />
      </>
    );

    const createButton = getByText('Create Window');
    fireEvent.click(createButton);

    const window = container.querySelector('.floating-window') as HTMLElement;
    assert.ok(window);
    assert.equal(window.style.backgroundColor, 'yellow');
    assert.equal(window.style.border, '2px solid red');
    assert.ok(window.style.zIndex); // Should also have z-index
  });

  test('handles window restoration from minimized state', () => {
    const TestComponent = () => {
      const { createWindow, minimizeWindow, restoreWindow } = useWindows();

      return (
        <>
          <button
            type="button"
            onClick={() => {
              createWindow({
                id: 'restorable-window',
                title: 'Restorable',
                content: <div>Restorable Content</div>,
              });
            }}
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => minimizeWindow('restorable-window')}
          >
            Minimize
          </button>
          <button
            type="button"
            onClick={() => restoreWindow('restorable-window')}
          >
            Restore
          </button>
          <WindowManager />
        </>
      );
    };

    const { getByText, queryByText } = renderWithProviders(<TestComponent />);

    const createButton = getByText('Create');
    fireEvent.click(createButton);

    // Window should be visible
    assert.ok(getByText('Restorable Content'));

    const minimizeButton = getByText('Minimize');
    fireEvent.click(minimizeButton);

    // Window should be hidden
    assert.equal(queryByText('Restorable Content'), null);

    const restoreButton = getByText('Restore');
    fireEvent.click(restoreButton);

    // Window should be visible again
    assert.ok(getByText('Restorable Content'));
  });

  test('renders empty fragment when all windows are minimized', () => {
    const TestComponent = () => {
      const { createWindow, minimizeWindow } = useWindows();

      return (
        <>
          <button
            type="button"
            onClick={() => {
              createWindow({
                id: 'window-1',
                title: 'Window 1',
                content: <div>Content 1</div>,
              });
              createWindow({
                id: 'window-2',
                title: 'Window 2',
                content: <div>Content 2</div>,
              });
              minimizeWindow('window-1');
              minimizeWindow('window-2');
            }}
          >
            Create and Minimize All
          </button>
          <WindowManager />
        </>
      );
    };

    const { getByText, queryByText } = renderWithProviders(<TestComponent />);

    const createButton = getByText('Create and Minimize All');
    fireEvent.click(createButton);

    // Verify no window content is visible
    assert.equal(queryByText('Content 1'), null);
    assert.equal(queryByText('Content 2'), null);
  });

  test('window content can include complex React components', () => {
    const ComplexContent = () => (
      <div>
        <h1>Complex Header</h1>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
        <button type="button">Action Button</button>
      </div>
    );

    const { getByText, getByRole } = renderWithProviders(
      <>
        <WindowCreator
          onCreate={(createWindow) => {
            createWindow({
              id: 'complex-window',
              title: 'Complex Window',
              content: <ComplexContent />,
            });
          }}
        />
        <WindowManager />
      </>
    );

    const createButton = getByText('Create Window');
    fireEvent.click(createButton);

    assert.ok(getByText('Complex Header'));
    assert.ok(getByText('Item 1'));
    assert.ok(getByText('Item 2'));
    assert.ok(getByRole('button', { name: 'Action Button' }));
  });
});
