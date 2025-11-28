import { strict as assert } from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { fireEvent } from '@testing-library/react';
import { WindowTaskbar } from '../../../src/components/WindowTaskbar';
import { createDOM } from '../../test-utils/create-dom';
import { renderWithProviders } from '../../test-utils/render-with-providers';

describe('WindowTaskbar', () => {
  beforeEach(() => {
    createDOM();
  });

  test('renders taskbar with start menu button', () => {
    const { getByTitle } = renderWithProviders(<WindowTaskbar />);

    const startButton = getByTitle('Start Menu');
    assert.ok(startButton);
    assert.ok(startButton.textContent?.includes('Start'));
  });

  test('renders empty state when no windows are open', () => {
    const { getByText } = renderWithProviders(<WindowTaskbar />);

    const emptyMessage = getByText('No open windows');
    assert.ok(emptyMessage);
  });

  test('start menu is closed by default', () => {
    const { container } = renderWithProviders(<WindowTaskbar />);

    const startMenu = container.querySelector('.start-menu');
    assert.equal(startMenu, null);
  });

  test('start menu opens when start button is clicked', () => {
    const { getByTitle, container } = renderWithProviders(<WindowTaskbar />);

    const startButton = getByTitle('Start Menu');
    fireEvent.click(startButton);

    const startMenu = container.querySelector('.start-menu');
    assert.ok(startMenu);
  });

  test('start menu displays "Applications" header', () => {
    const { getByTitle, getByText } = renderWithProviders(<WindowTaskbar />);

    const startButton = getByTitle('Start Menu');
    fireEvent.click(startButton);

    const header = getByText('Applications');
    assert.ok(header);
  });

  test('start menu contains "Terminal" menu item', () => {
    const { getByTitle, getByText } = renderWithProviders(<WindowTaskbar />);

    const startButton = getByTitle('Start Menu');
    fireEvent.click(startButton);

    const menuItem = getByText('Terminal');
    assert.ok(menuItem);
  });

  test('start menu closes when clicking backdrop', () => {
    const { getByTitle, getByRole, container } = renderWithProviders(
      <WindowTaskbar />
    );

    const startButton = getByTitle('Start Menu');
    fireEvent.click(startButton);

    let startMenu = container.querySelector('.start-menu');
    assert.ok(startMenu, 'Menu should be open');

    const backdrop = getByRole('button', { name: 'Close start menu' });
    fireEvent.click(backdrop);

    startMenu = container.querySelector('.start-menu');
    assert.equal(startMenu, null, 'Menu should be closed');
  });

  test('start menu closes when pressing Escape on backdrop', () => {
    const { getByTitle, getByRole, container } = renderWithProviders(
      <WindowTaskbar />
    );

    const startButton = getByTitle('Start Menu');
    fireEvent.click(startButton);

    let startMenu = container.querySelector('.start-menu');
    assert.ok(startMenu, 'Menu should be open');

    const backdrop = getByRole('button', { name: 'Close start menu' });
    fireEvent.keyDown(backdrop, { key: 'Escape' });

    startMenu = container.querySelector('.start-menu');
    assert.equal(startMenu, null, 'Menu should be closed after Escape');
  });

  test('start button has active class when menu is open', () => {
    const { getByTitle } = renderWithProviders(<WindowTaskbar />);

    const startButton = getByTitle('Start Menu');

    // Initially not active
    assert.ok(!startButton.className.includes('active'));

    // Click to open
    fireEvent.click(startButton);
    assert.ok(startButton.className.includes('active'));

    // Click to close
    fireEvent.click(startButton);
    assert.ok(!startButton.className.includes('active'));
  });

  test('start menu closes when "Terminal" is clicked', () => {
    const { getByTitle, getByText, container } = renderWithProviders(
      <WindowTaskbar />
    );

    const startButton = getByTitle('Start Menu');
    fireEvent.click(startButton);

    const createButton = getByText('Terminal');
    fireEvent.click(createButton);

    const startMenu = container.querySelector('.start-menu');
    assert.equal(startMenu, null, 'Menu should close after creating window');
  });

  test('renders taskbar separator', () => {
    const { container } = renderWithProviders(<WindowTaskbar />);

    const separator = container.querySelector('.taskbar-separator');
    assert.ok(separator);
  });

  test('taskbar has proper structure', () => {
    const { container } = renderWithProviders(<WindowTaskbar />);

    const taskbar = container.querySelector('.window-taskbar');
    const taskbarStart = container.querySelector('.taskbar-start');
    const taskbarItems = container.querySelector('.taskbar-items');

    assert.ok(taskbar);
    assert.ok(taskbarStart);
    assert.ok(taskbarItems);
  });

  test('start button contains icon and text', () => {
    const { container } = renderWithProviders(<WindowTaskbar />);

    const icon = container.querySelector('.start-icon');
    const text = container.querySelector('.start-text');

    assert.ok(icon);
    assert.ok(text);
    assert.equal(icon?.textContent, '⊞');
    assert.equal(text?.textContent, 'Start');
  });

  test('menu item contains icon and text', () => {
    const { getByTitle, container } = renderWithProviders(<WindowTaskbar />);

    const startButton = getByTitle('Start Menu');
    fireEvent.click(startButton);

    const icon = container.querySelector('.menu-item-icon');
    const text = container.querySelector('.menu-item-text');

    assert.ok(icon);
    assert.ok(text);
    assert.equal(icon?.textContent, '▶');
    assert.equal(text?.textContent, 'Terminal');
  });

  test('all buttons have proper type attribute', () => {
    const { getByTitle, getByRole, container } = renderWithProviders(
      <WindowTaskbar />
    );

    const startButton = getByTitle('Start Menu') as HTMLButtonElement;
    assert.equal(startButton.type, 'button');

    // Open menu
    fireEvent.click(startButton);

    const backdrop = getByRole('button', {
      name: 'Close start menu',
    }) as HTMLButtonElement;
    assert.equal(backdrop.type, 'button');

    const menuItems = container.querySelectorAll('.start-menu-item');
    for (const item of menuItems) {
      assert.equal((item as HTMLButtonElement).type, 'button');
    }
  });

  test('start menu has proper positioning classes', () => {
    const { getByTitle, container } = renderWithProviders(<WindowTaskbar />);

    const startButton = getByTitle('Start Menu');
    fireEvent.click(startButton);

    const startMenu = container.querySelector('.start-menu');
    const menuHeader = container.querySelector('.start-menu-header');
    const menuItems = container.querySelector('.start-menu-items');

    assert.ok(startMenu);
    assert.ok(menuHeader);
    assert.ok(menuItems);
  });

  test('toggles menu on multiple clicks', () => {
    const { getByTitle, container } = renderWithProviders(<WindowTaskbar />);

    const startButton = getByTitle('Start Menu');

    // Open
    fireEvent.click(startButton);
    assert.ok(container.querySelector('.start-menu'));

    // Close
    fireEvent.click(startButton);
    assert.equal(container.querySelector('.start-menu'), null);

    // Open again
    fireEvent.click(startButton);
    assert.ok(container.querySelector('.start-menu'));
  });
});
