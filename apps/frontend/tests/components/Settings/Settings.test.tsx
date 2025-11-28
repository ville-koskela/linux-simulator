import { strict as assert } from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { fireEvent } from '@testing-library/react';
import { Settings } from '../../../src/components/Settings/Settings';
import { createDOM } from '../../test-utils/create-dom';
import { renderWithProviders } from '../../test-utils/render-with-providers';

describe('Settings Component', () => {
  beforeEach(() => {
    createDOM();

    // Mock window.matchMedia which is used by SettingsContext
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    });
  });

  test('renders without crashing', () => {
    const { getByText } = renderWithProviders(<Settings />);
    assert.ok(getByText('Language Settings'));
    assert.ok(getByText('Theme Presets'));
  });

  test('displays language selector', () => {
    const { getByLabelText } = renderWithProviders(<Settings />);
    const languageSelect = getByLabelText('Language');
    assert.ok(languageSelect);
  });

  test('displays theme preset buttons', () => {
    const { getByText } = renderWithProviders(<Settings />);
    assert.ok(getByText('Light'));
    assert.ok(getByText('Dark'));
    assert.ok(getByText('Ocean'));
    assert.ok(getByText('Sunset'));
    assert.ok(getByText('Forest'));
  });

  test('changes language when selected', () => {
    const { getByLabelText } = renderWithProviders(<Settings />);
    const languageSelect = getByLabelText('Language') as HTMLSelectElement;
    fireEvent.change(languageSelect, { target: { value: 'fi' } });
    assert.equal(languageSelect.value, 'fi');
  });

  test('displays custom theme color fields', () => {
    const { getByText } = renderWithProviders(<Settings />);
    assert.ok(getByText('Primary Color'));
    assert.ok(getByText('Secondary Color'));
    assert.ok(getByText('Background'));
  });

  test('displays action buttons', () => {
    const { getByText } = renderWithProviders(<Settings />);
    assert.ok(getByText('Apply Custom Theme'));
    assert.ok(getByText('Reset to Defaults'));
  });
});
