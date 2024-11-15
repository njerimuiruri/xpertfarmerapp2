export interface ThemeColorSet {
  background: string; // Main background color
  foreground: string; // Main foreground color (text, icons)
  primary: string; // Primary color (buttons, highlights)
  secondary: string; // Secondary color (links, accents)
  textPrimary: string; // Primary text color
  textSecondary: string; // Secondary text color
  border: string; // Border color
  cardBackground: string; // Card background color
  button: string; // Button background color
  buttonText: string; // Button text color
  shadow: string; // Shadow color
  error: string; // Error color
  success: string; // Success color
  warning: string; // Warning color
}

export interface Theme {
  dark: ThemeColorSet;
  light: ThemeColorSet;
}
