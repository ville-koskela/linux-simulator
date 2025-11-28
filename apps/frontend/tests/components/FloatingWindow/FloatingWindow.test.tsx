import { strict as assert } from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { FloatingWindow } from '../../../src/components/FloatingWindow';
import { createDOM } from '../../test-utils/create-dom';
import { renderWithProviders } from '../../test-utils/render-with-providers';

describe('FloatingWindow', () => {
  // Always set up DOM environment before tests
  beforeEach(() => {
    createDOM();
  });

  test('renders with required props', () => {
    const { getByText } = renderWithProviders(
      <FloatingWindow>
        <p>Window content</p>
      </FloatingWindow>
    );

    const content = getByText('Window content');
    assert.ok(content);
  });

  test('renders with default title', () => {
    const { getByText } = renderWithProviders(
      <FloatingWindow>
        <p>Content</p>
      </FloatingWindow>
    );

    const title = getByText('Window');
    assert.equal(title.textContent, 'Window');
  });

  test('renders with custom title', () => {
    const { getByText } = renderWithProviders(
      <FloatingWindow title="My Custom Window">
        <p>Content</p>
      </FloatingWindow>
    );

    const title = getByText('My Custom Window');
    assert.equal(title.textContent, 'My Custom Window');
  });

  test('renders children correctly', () => {
    const { getByText } = renderWithProviders(
      <FloatingWindow title="Test">
        <div>
          <h1>Heading</h1>
          <p>Paragraph content</p>
        </div>
      </FloatingWindow>
    );

    assert.ok(getByText('Heading'));
    assert.ok(getByText('Paragraph content'));
  });

  test('applies default position', () => {
    const { container } = renderWithProviders(
      <FloatingWindow>
        <p>Content</p>
      </FloatingWindow>
    );

    const window = container.querySelector('.floating-window');
    assert.ok(window);
    const style = (window as HTMLElement).style;
    assert.equal(style.left, '100px');
    assert.equal(style.top, '100px');
  });

  test('applies custom initial position', () => {
    const { container } = renderWithProviders(
      <FloatingWindow initialX={200} initialY={150}>
        <p>Content</p>
      </FloatingWindow>
    );

    const window = container.querySelector('.floating-window');
    assert.ok(window);
    const style = (window as HTMLElement).style;
    assert.equal(style.left, '200px');
    assert.equal(style.top, '150px');
  });

  test('applies default size', () => {
    const { container } = renderWithProviders(
      <FloatingWindow>
        <p>Content</p>
      </FloatingWindow>
    );

    const window = container.querySelector('.floating-window');
    assert.ok(window);
    const style = (window as HTMLElement).style;
    assert.equal(style.width, '400px');
    assert.equal(style.height, '300px');
  });

  test('applies custom initial size', () => {
    const { container } = renderWithProviders(
      <FloatingWindow initialWidth={600} initialHeight={450}>
        <p>Content</p>
      </FloatingWindow>
    );

    const window = container.querySelector('.floating-window');
    assert.ok(window);
    const style = (window as HTMLElement).style;
    assert.equal(style.width, '600px');
    assert.equal(style.height, '450px');
  });

  test('renders close button when onClose is provided', () => {
    const { getByRole } = renderWithProviders(
      <FloatingWindow onClose={() => {}}>
        <p>Content</p>
      </FloatingWindow>
    );

    const closeButton = getByRole('button', { name: 'Close window' });
    assert.ok(closeButton);
  });

  test('does not render close button when onClose is not provided', () => {
    const { container } = renderWithProviders(
      <FloatingWindow>
        <p>Content</p>
      </FloatingWindow>
    );

    const closeButton = container.querySelector('.floating-window-close');
    assert.equal(closeButton, null);
  });

  test('calls onClose when close button is clicked', () => {
    let closed = false;
    const handleClose = () => {
      closed = true;
    };

    const { getByRole } = renderWithProviders(
      <FloatingWindow onClose={handleClose}>
        <p>Content</p>
      </FloatingWindow>
    );

    const closeButton = getByRole('button', { name: 'Close window' });
    closeButton.click();

    assert.equal(closed, true);
  });

  test('applies custom className', () => {
    const { container } = renderWithProviders(
      <FloatingWindow className="custom-window">
        <p>Content</p>
      </FloatingWindow>
    );

    const window = container.querySelector('.floating-window.custom-window');
    assert.ok(window);
  });

  test('applies custom style', () => {
    const customStyle = {
      backgroundColor: 'red',
      border: '2px solid blue',
    };

    const { container } = renderWithProviders(
      <FloatingWindow style={customStyle}>
        <p>Content</p>
      </FloatingWindow>
    );

    const window = container.querySelector('.floating-window') as HTMLElement;
    assert.ok(window);
    assert.equal(window.style.backgroundColor, 'red');
    assert.equal(window.style.border, '2px solid blue');
  });

  test('renders header with drag handle', () => {
    const { container } = renderWithProviders(
      <FloatingWindow title="Draggable">
        <p>Content</p>
      </FloatingWindow>
    );

    const header = container.querySelector('.floating-window-header');
    assert.ok(header);
    assert.equal(header?.getAttribute('role'), 'button');
    assert.equal(header?.getAttribute('tabIndex'), '0');
  });

  test('renders content area', () => {
    const { container } = renderWithProviders(
      <FloatingWindow>
        <p>Test content</p>
      </FloatingWindow>
    );

    const contentArea = container.querySelector('.floating-window-content');
    assert.ok(contentArea);
    assert.ok(contentArea?.textContent?.includes('Test content'));
  });

  test('renders resize handles', () => {
    const { container } = renderWithProviders(
      <FloatingWindow>
        <p>Content</p>
      </FloatingWindow>
    );

    const resizeS = container.querySelector('.resize-handle.resize-s');
    const resizeE = container.querySelector('.resize-handle.resize-e');
    const resizeSE = container.querySelector('.resize-handle.resize-se');

    assert.ok(resizeS, 'South resize handle should exist');
    assert.ok(resizeE, 'East resize handle should exist');
    assert.ok(resizeSE, 'Southeast resize handle should exist');
  });

  test('resize handles have proper aria labels', () => {
    const { container } = renderWithProviders(
      <FloatingWindow>
        <p>Content</p>
      </FloatingWindow>
    );

    const resizeS = container.querySelector('.resize-s');
    const resizeE = container.querySelector('.resize-e');
    const resizeSE = container.querySelector('.resize-se');

    assert.equal(resizeS?.getAttribute('aria-label'), 'Resize bottom');
    assert.equal(resizeE?.getAttribute('aria-label'), 'Resize right');
    assert.equal(resizeSE?.getAttribute('aria-label'), 'Resize bottom-right');
  });

  test('accepts minWidth and minHeight props', () => {
    // Test that component renders without error with min size props
    const { container } = renderWithProviders(
      <FloatingWindow minWidth={300} minHeight={200}>
        <p>Content</p>
      </FloatingWindow>
    );

    const window = container.querySelector('.floating-window');
    assert.ok(window);
  });

  test('merges custom style with position and size styles', () => {
    const customStyle = {
      zIndex: 9999,
      opacity: 0.8,
    };

    const { container } = renderWithProviders(
      <FloatingWindow
        style={customStyle}
        initialX={50}
        initialY={75}
        initialWidth={500}
        initialHeight={400}
      >
        <p>Content</p>
      </FloatingWindow>
    );

    const window = container.querySelector('.floating-window') as HTMLElement;
    assert.ok(window);
    assert.equal(window.style.left, '50px');
    assert.equal(window.style.top, '75px');
    assert.equal(window.style.width, '500px');
    assert.equal(window.style.height, '400px');
    assert.equal(window.style.zIndex, '9999');
    assert.equal(window.style.opacity, '0.8');
  });

  test('header has proper keyboard interaction attributes', () => {
    const { container } = renderWithProviders(
      <FloatingWindow title="Keyboard Test">
        <p>Content</p>
      </FloatingWindow>
    );

    const header = container.querySelector('.floating-window-header');
    assert.ok(header);
    assert.equal(header?.getAttribute('role'), 'button');
    assert.equal(header?.getAttribute('tabIndex'), '0');
  });

  test('close button has proper type attribute', () => {
    const { getByRole } = renderWithProviders(
      <FloatingWindow onClose={() => {}}>
        <p>Content</p>
      </FloatingWindow>
    );

    const closeButton = getByRole('button', {
      name: 'Close window',
    }) as HTMLButtonElement;
    assert.equal(closeButton.type, 'button');
  });

  test('renders with all optional props', () => {
    const handleClose = () => {};
    const customStyle = { border: '1px solid black' };

    const { container, getByText } = renderWithProviders(
      <FloatingWindow
        title="Complete Window"
        initialX={150}
        initialY={200}
        initialWidth={500}
        initialHeight={400}
        minWidth={250}
        minHeight={200}
        onClose={handleClose}
        className="custom-class"
        style={customStyle}
      >
        <p>Full featured window</p>
      </FloatingWindow>
    );

    const title = getByText('Complete Window');
    const content = getByText('Full featured window');
    const window = container.querySelector(
      '.floating-window.custom-class'
    ) as HTMLElement;
    const closeButton = container.querySelector('.floating-window-close');

    assert.ok(title);
    assert.ok(content);
    assert.ok(window);
    assert.ok(closeButton);
    assert.equal(window.style.left, '150px');
    assert.equal(window.style.top, '200px');
    assert.equal(window.style.width, '500px');
    assert.equal(window.style.height, '400px');
  });

  test('close button displays × symbol', () => {
    const { getByRole } = renderWithProviders(
      <FloatingWindow onClose={() => {}}>
        <p>Content</p>
      </FloatingWindow>
    );

    const closeButton = getByRole('button', { name: 'Close window' });
    assert.equal(closeButton.textContent, '×');
  });

  test('title is displayed in header', () => {
    const { container } = renderWithProviders(
      <FloatingWindow title="Test Window Title">
        <p>Content</p>
      </FloatingWindow>
    );

    const titleElement = container.querySelector('.floating-window-title');
    assert.ok(titleElement);
    assert.equal(titleElement?.textContent, 'Test Window Title');
  });

  test('renders minimize button when onMinimize is provided', () => {
    const { getByRole } = renderWithProviders(
      <FloatingWindow onMinimize={() => {}}>
        <p>Content</p>
      </FloatingWindow>
    );

    const minimizeButton = getByRole('button', { name: 'Minimize window' });
    assert.ok(minimizeButton);
  });

  test('does not render minimize button when onMinimize is not provided', () => {
    const { container } = renderWithProviders(
      <FloatingWindow>
        <p>Content</p>
      </FloatingWindow>
    );

    const minimizeButton = container.querySelector('.floating-window-minimize');
    assert.equal(minimizeButton, null);
  });

  test('calls onMinimize when minimize button is clicked', () => {
    let minimized = false;
    const handleMinimize = () => {
      minimized = true;
    };

    const { getByRole } = renderWithProviders(
      <FloatingWindow onMinimize={handleMinimize}>
        <p>Content</p>
      </FloatingWindow>
    );

    const minimizeButton = getByRole('button', { name: 'Minimize window' });
    minimizeButton.click();

    assert.equal(minimized, true);
  });

  test('minimize button displays − symbol', () => {
    const { getByRole } = renderWithProviders(
      <FloatingWindow onMinimize={() => {}}>
        <p>Content</p>
      </FloatingWindow>
    );

    const minimizeButton = getByRole('button', { name: 'Minimize window' });
    assert.equal(minimizeButton.textContent, '−');
  });

  test('minimize button has proper type attribute', () => {
    const { getByRole } = renderWithProviders(
      <FloatingWindow onMinimize={() => {}}>
        <p>Content</p>
      </FloatingWindow>
    );

    const minimizeButton = getByRole('button', {
      name: 'Minimize window',
    }) as HTMLButtonElement;
    assert.equal(minimizeButton.type, 'button');
  });

  test('renders both minimize and close buttons when both handlers provided', () => {
    const { getByRole } = renderWithProviders(
      <FloatingWindow onMinimize={() => {}} onClose={() => {}}>
        <p>Content</p>
      </FloatingWindow>
    );

    const minimizeButton = getByRole('button', { name: 'Minimize window' });
    const closeButton = getByRole('button', { name: 'Close window' });

    assert.ok(minimizeButton);
    assert.ok(closeButton);
  });

  test('renders controls container when minimize or close button exists', () => {
    const { container } = renderWithProviders(
      <FloatingWindow onMinimize={() => {}} onClose={() => {}}>
        <p>Content</p>
      </FloatingWindow>
    );

    const controls = container.querySelector('.floating-window-controls');
    assert.ok(controls);
  });

  test('minimize button appears before close button', () => {
    const { container } = renderWithProviders(
      <FloatingWindow onMinimize={() => {}} onClose={() => {}}>
        <p>Content</p>
      </FloatingWindow>
    );

    const controls = container.querySelector('.floating-window-controls');
    assert.ok(controls);

    const buttons = controls?.querySelectorAll('button');
    assert.ok(buttons);
    assert.equal(buttons.length, 2);
    assert.ok(buttons[0].classList.contains('floating-window-minimize'));
    assert.ok(buttons[1].classList.contains('floating-window-close'));
  });

  test('only minimize button is called when clicked, not close', () => {
    let minimized = false;
    let closed = false;

    const handleMinimize = () => {
      minimized = true;
    };
    const handleClose = () => {
      closed = true;
    };

    const { getByRole } = renderWithProviders(
      <FloatingWindow onMinimize={handleMinimize} onClose={handleClose}>
        <p>Content</p>
      </FloatingWindow>
    );

    const minimizeButton = getByRole('button', { name: 'Minimize window' });
    minimizeButton.click();

    assert.equal(minimized, true);
    assert.equal(closed, false);
  });

  test('only close button is called when clicked, not minimize', () => {
    let minimized = false;
    let closed = false;

    const handleMinimize = () => {
      minimized = true;
    };
    const handleClose = () => {
      closed = true;
    };

    const { getByRole } = renderWithProviders(
      <FloatingWindow onMinimize={handleMinimize} onClose={handleClose}>
        <p>Content</p>
      </FloatingWindow>
    );

    const closeButton = getByRole('button', { name: 'Close window' });
    closeButton.click();

    assert.equal(minimized, false);
    assert.equal(closed, true);
  });

  test('renders with all props including minimize', () => {
    const handleClose = () => {};
    const handleMinimize = () => {};
    const customStyle = { border: '1px solid black' };

    const { container, getByText, getByRole } = renderWithProviders(
      <FloatingWindow
        title="Complete Window"
        initialX={150}
        initialY={200}
        initialWidth={500}
        initialHeight={400}
        minWidth={250}
        minHeight={200}
        onClose={handleClose}
        onMinimize={handleMinimize}
        className="custom-class"
        style={customStyle}
      >
        <p>Full featured window</p>
      </FloatingWindow>
    );

    const title = getByText('Complete Window');
    const content = getByText('Full featured window');
    const window = container.querySelector(
      '.floating-window.custom-class'
    ) as HTMLElement;
    const minimizeButton = getByRole('button', { name: 'Minimize window' });
    const closeButton = getByRole('button', { name: 'Close window' });

    assert.ok(title);
    assert.ok(content);
    assert.ok(window);
    assert.ok(minimizeButton);
    assert.ok(closeButton);
    assert.equal(window.style.left, '150px');
    assert.equal(window.style.top, '200px');
    assert.equal(window.style.width, '500px');
    assert.equal(window.style.height, '400px');
  });
});
