import { editor } from 'monaco-editor';

// Helper function to convert HSL to hex with lightness adjustment
function hslToHex(h: number, s: number, l: number, adjustment = 'normal', withHash = true) {
  // Adjustment to lightness based on the user's preference
  switch (adjustment) {
    case 'lighter':
      l = Math.min(100, l + 5); // Increase lightness by 20%
      break;
    case 'darker':
      l = Math.max(0, l - 5); // Decrease lightness by 20%
      break;
    case 'normal':
    default:
      break;
  }

  // Convert HSL to RGB
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  // Convert RGB to hex
  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `${withHash ? '#' : ''}${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getCssVarAsHex(varName: string, adjustment = 'normal', fallback = '#1E1E1E', withHash = true) {
  try {
    const cssVar = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    if (!cssVar) return fallback;

    // Parse HSL values from format like "240 10% 3.9%"
    const [h, s, l] = cssVar.split(' ').map(val =>
      parseFloat(val.replace('%', ''))
    );
    return hslToHex(h, s, l, adjustment, withHash);
  } catch (e) {
    console.error(`Error converting CSS var ${varName} to hex:`, e);
    return fallback;
  }
}

export function createCustomTheme(isDarkMode: boolean): editor.IStandaloneThemeData {
  const backgroundColor = getCssVarAsHex('--background');
  const secondaryColor = getCssVarAsHex('--secondary');
  const foregroundColor = getCssVarAsHex('--foreground')
  const primaryColorNoHash = getCssVarAsHex('--primary', 'normal', undefined, false);
  const primaryColorNoHashDarker = getCssVarAsHex('--primary', 'darker', undefined, false);
  const primaryColorNoHashLighter = getCssVarAsHex('--primary', 'lighter', undefined, false);
  const primaryColor = getCssVarAsHex('--primary');
  const primaryColorDarker = getCssVarAsHex('--primary', 'darker');

  const syntaxRules = [
    // Basic syntax
    { token: 'comment', foreground: primaryColorNoHash, fontStyle: 'italic' },
    { token: 'keyword', foreground: primaryColorNoHashDarker, fontStyle: 'bold', backgroundColor: '00FF00' },
    // { token: 'string', foreground: primaryColorDarker },
    { token: 'number', foreground: primaryColorNoHashDarker },

    // Variables and identifiers
    { token: 'variable', foreground: primaryColorNoHashLighter },
    { token: 'variable.predefined', foreground: primaryColorNoHashLighter },
    // { token: 'constant', foreground: '4FC1FF' },
    // { token: 'type', foreground: '4EC9B0' },
    // { token: 'class', foreground: '4EC9B0', fontStyle: 'bold' },
    // { token: 'interface', foreground: '4EC9B0' },
    // { token: 'enum', foreground: '4EC9B0' },

    // Functions
    // { token: 'function', foreground: primaryColorNoHash },
    // { token: 'member', foreground: primaryColorNoHashLighter },
    // { token: 'parameter', foreground: primaryColorNoHashLighter },

    // Control flow
    // { token: 'tag', foreground: '569CD6' },
    // { token: 'delimiter', foreground: 'D4D4D4' },
    // { token: 'delimiter.bracket', foreground: 'D4D4D4' },
    // { token: 'delimiter.parenthesis', foreground: 'D4D4D4' },

    // Markup
    // { token: 'attribute.name', foreground: '9CDCFE' },
    // { token: 'attribute.value', foreground: 'CE9178' },

    // JSON
    // { token: 'string.key', foreground: '9CDCFE' },
    // { token: 'string.value', foreground: 'CE9178' },

    // CSS
    // { token: 'attribute.name.css', foreground: 'D7BA7D' },
    // { token: 'attribute.value.css', foreground: 'CE9178' },

    // Error states
    // { token: 'invalid', foreground: 'F44747' }
  ]

  const editorColors = {
    // Editor UI
    'editor.background': secondaryColor,
    'editor.foreground': foregroundColor,
    // 'editorCursor.foreground': '#AEAFAD',
    // 'editorLineNumber.foreground': '#858585',
    // 'editorLineNumber.activeForeground': '#C6C6C6',

    // 'editor.focus.border': '#00000000',
    // 'focusBorder': '#00000000',
    // 'editorWidget.resizeBorder': '#00000000',


    // // Selection highlighting
    // 'editor.selectionBackground': '#264F78',
    // 'editor.inactiveSelectionBackground': '#3A3D41',
    // 'editor.selectionHighlightBackground': '#2D2D30',
    // 'editor.wordHighlightBackground': '#575757B8',
    // 'editor.wordHighlightStrongBackground': '#004972B8',

    // // Current line highlighting
    // 'editor.lineHighlightBackground': '#2D2D30',
    // 'editor.lineHighlightBorder': '#282828',

    // // Gutter
    // 'editorGutter.background': '#00000000',
    // 'editorGutter.modifiedBackground': '#4B9257',
    // 'editorGutter.addedBackground': '#587C0C',
    // 'editorGutter.deletedBackground': '#94151B',

    // // Indentation guides
    // 'editorIndentGuide.background': '#404040',
    // 'editorIndentGuide.activeBackground': '#707070',

    // // Rulers
    // 'editorRuler.foreground': '#383838',

    // // Bracket matching
    // 'editorBracketMatch.background': '#0D3A58',
    // 'editorBracketMatch.border': '#216694',

    // // Overview ruler
    // 'editorOverviewRuler.border': '#010101',
    // 'editorOverviewRuler.errorForeground': '#FF1212B3',
    // 'editorOverviewRuler.warningForeground': '#FFCC00B3',
    // 'editorOverviewRuler.infoForeground': '#3794FFB3',

    // // Error and warning squiggles
    'editorError.foreground': '#F14C4C',
    'editorWarning.foreground': '#CCA700',
    'editorInfo.foreground': '#3794FF',

    // // Scrollbar
    'scrollbarSlider.background': primaryColor + '55',
    'scrollbarSlider.hoverBackground': primaryColor + 'AA',
    // 'scrollbarSlider.activeBackground': '#BFBFBF66',

    // // Suggestion widget
    // 'editorSuggestWidget.background': '#252526',
    // 'editorSuggestWidget.border': '#454545',
    // 'editorSuggestWidget.foreground': '#D4D4D4',
    // 'editorSuggestWidget.highlightForeground': '#0097FB',
    // 'editorSuggestWidget.selectedBackground': '#062F4A',

    // // Mini map
    // 'minimap.background': '#1E1E1E',
    // 'minimap.errorHighlight': '#FF1212B3',
    // 'minimap.warningHighlight': '#FFCC00B3',

    // // Diff editor
    // 'diffEditor.insertedTextBackground': '#9CCC2C33',
    // 'diffEditor.removedTextBackground': '#FF000033',

    // // Widget backgrounds
    // 'widget.shadow': '#000000',
    // 'editorWidget.background': '#252526',
    // 'editorWidget.border': '#454545',
    // 'editorHoverWidget.background': '#252526',
    // 'editorHoverWidget.border': '#454545',
  }

  console.log("we are using base: ", isDarkMode ? 'vs-dark' : 'vs');

  return {
    base: isDarkMode ? 'vs-dark' : 'vs',
    inherit: true,
    rules: syntaxRules,
    colors: editorColors
  };
}