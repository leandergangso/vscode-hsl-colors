const vscode = require('vscode');

const DECIMAL_REGEX = '(\\d+|\\d*\\.\\d+)';
const DECIMAL_360_REGEX = '((([0-9][0-9]?|[12][0-9][0-9]|3[0-5][0-9]|360)(\\.\\d+)?)|(\\.\\d+))';
const DECIMAL_100_REGEX = '((([0-9]{1,2}|100)(\\.\\d+)?)|(\\.\\d+))';
const HSL_REGEX = '(\\s*' + DECIMAL_360_REGEX + '\\s*\\s*' + DECIMAL_100_REGEX + '\\s*%\\s*\\s*' + DECIMAL_100_REGEX + '\\s*%\\s*)';

const FORBIDDENPADDING = '[a-z\\d\\-]';

const COLOR_REGEX = new RegExp('[^a-z\\d\\-](' + HSL_REGEX + ')(?!' + FORBIDDENPADDING + ')', 'gi');
const COLOR_REGEX_BEGINNING = new RegExp('(' + HSL_REGEX + ')(?!' + FORBIDDENPADDING + ')', 'i');

function convertColor(backgroundColor) {
  var r = 0;
  var g = 0;
  var b = 0;
  var a = 1;

  if (backgroundColor.match(new RegExp(HSL_REGEX, 'g'))) {
    var parts = backgroundColor.match(new RegExp(DECIMAL_REGEX, 'g'));
    var h = parts[0] / 360;
    var s = parts[1] / 100;
    var l = parts[2] / 100;
    if (!s)
      r = g = b = Math.round(l * 255);
    else {
      var hue2rgb = (p, q, t) => {
        if (t < 0)
          t++;
        if (t > 1)
          t--;
        if (t < 1 / 6)
          return p + (q - p) * 6 * t;
        if (t < 1 / 2)
          return q;
        if (t < 2 / 3)
          return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
      g = Math.round(hue2rgb(p, q, h) * 255);
      b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
    }
  }

  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

function getForegroundColor(backgroundColor) {
  var parts = backgroundColor.match(new RegExp(DECIMAL_REGEX, 'g'));
  var r = parts[0];
  var g = parts[1];
  var b = parts[2];
  return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000' : '#fff';
}

function activate(context) {
  var activeEditor = vscode.window.activeTextEditor;
  var decorations = {};
  vscode.window.onDidChangeActiveTextEditor(editor => {
    activeEditor = editor;
    if (editor)
      triggerUpdateDecorations(true);
  }, null, context.subscriptions);
  vscode.workspace.onDidChangeTextDocument(event => {
    if (activeEditor && event.document === activeEditor.document)
      triggerUpdateDecorations();
  }, null, context.subscriptions);
  if (activeEditor)
    triggerUpdateDecorations();
  var timeout = null;
  var updateStaged;

  function triggerUpdateDecorations(force) {
    if (force === void 0)
      force = false;
    updateStaged = true;
    if (!timeout || force)
      runStaged();
    else
      clearTimeout(timeout);
    timeout = setTimeout(runStaged, 500);
  }

  function runStaged() {
    if (updateStaged) {
      updateDecorations();
      updateStaged = false;
    }
  }

  function updateDecorations() {
    if (!activeEditor || !activeEditor.document)
      return;
    if (decorations) {
      Object.keys(decorations).forEach(key => {
        var color = decorations[key];
        color.decorationType.dispose();
        delete decorations[key];
      });
    }
    var text = activeEditor.document.getText();
    var match;
    while (match = COLOR_REGEX.exec(text)) {
      match[0] = match[0].slice(1);
      match.index++;

      if (!decorations[match[0]]) {
        var convertedColor = convertColor(match[0]);
        decorations[match[0]] = {
          decorationOptions: [],
          decorationType: vscode.window.createTextEditorDecorationType({
            backgroundColor: convertedColor,
            borderRadius: '0px',
            color: getForegroundColor(convertedColor),
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
          })
        };
      }
      var start = activeEditor.document.positionAt(match.index + 1);
      var end = activeEditor.document.positionAt(match.index + match[0].length);
      decorations[match[0]].decorationOptions.push({ range: new vscode.Range(start, end) });
    }

    if (match = COLOR_REGEX_BEGINNING.exec(text)) {
      if (!match.index) {
        if (!decorations[match[0]]) {
          var convertedColor = convertColor(match[0]);
          decorations[match[0]] = {
            decorationOptions: [],
            decorationType: vscode.window.createTextEditorDecorationType({
              backgroundColor: convertedColor,
              borderRadius: '0px',
              color: getForegroundColor(convertedColor),
              rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
            })
          };
        }
        var start = activeEditor.document.positionAt(match.index + 1);
        var end = activeEditor.document.positionAt(match.index + match[0].length);
        decorations[match[0]].decorationOptions.push({ range: new vscode.Range(start, end) });
      }
    }

    Object.keys(decorations).forEach(key => {
      var color = decorations[key];
      activeEditor.setDecorations(color.decorationType, color.decorationOptions);
    });
  }
}

exports.activate = activate;