import { Platform } from 'react-native';

const tintColor = '#000000'; // 選取狀態設為純黑

export const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: tintColor,
    icon: '#000000',
    tabIconDefault: '#999999',
    tabIconSelected: tintColor,
  },
  dark: {
    text: '#000000',
    background: '#FFFFFF',
    tint: tintColor,
    icon: '#000000',
    tabIconDefault: '#999999',
    tabIconSelected: tintColor,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
