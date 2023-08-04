import * as vscode from 'vscode'
import { editor, fetchDataFromAPI } from '../utils'


// Main plugin function
export const YACAPlugin = async () => {
  if (!editor) {
    vscode.window.showErrorMessage('No editor is active')
    return
  }
  const range = new vscode.Range(
    editor.document.lineAt(0).range.start,
    editor.document.lineAt(editor.document.lineCount - 1).range.end
  )
  const code = editor.document.getText(range)
  if (!code.length) {
    return
  }
  await fetchDataFromAPI(range, code)
}

// Plugin function for selected text
export const YACAPluginSelected = async () => {
  if (!editor) {
    vscode.window.showErrorMessage('No editor is active')
    return
  }
  const selectedRange = editor.selection
  const code = editor.document.getText(selectedRange)
  if (!code.length) {
    return
  }
  await fetchDataFromAPI(selectedRange, code)
}
