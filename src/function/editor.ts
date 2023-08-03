import axios from 'axios'
import * as vscode from 'vscode'
import { ImprovementScope, RequestData } from '../type'
import { startLoading, stopLoading } from './webview'
import path = require('path')

const API_URL =
  'http://s-gateway-qa.k8s.zhihuiya.com/s-ops-yaca-backend/2023-07/code/improvement'

let editor = vscode.window.activeTextEditor

// Get the relative path of the current file
const getRelativePath = (): string => {
  if (editor) {
    const filePath = editor.document.fileName
    const workspaceFolders = vscode.workspace.workspaceFolders
    if (workspaceFolders && workspaceFolders.length > 0) {
      const workspaceRoot = workspaceFolders[0].uri.fsPath
      const relativePath = path.relative(workspaceRoot, filePath)
      return relativePath
    }
  }
  vscode.window.showErrorMessage('No active editor or workspace folder found')
  return 'No active editor or workspace folder found'
}

// Get the language of the current file
const getCodeLanguage = (): string => {
  return editor?.document.languageId.toUpperCase() || ''
}

// Fetch data from the API
const fetchDataFromAPI = async (
  range: vscode.Range | vscode.Position | vscode.Selection,
  code: string
) => {
  const language = getCodeLanguage()
  const relativePath = getRelativePath()
  const requestData: RequestData = {
    scope: ImprovementScope.SNIPPET,
    project_objects: [
      {
        path: relativePath,
        is_directory: false,
        size: code.length,
        code: {
          content: code,
          language,
        },
      },
    ],
    rules: ['AMBIGUOUS_NAME', 'EARLY_RETURN'],
  }

  try {
    const response = await axios.post(API_URL, requestData)
    const improvedCode =
      response.data.improved_project_objects[0]?.code?.content

    if (improvedCode) {
      replaceContent(range, improvedCode)
    }
  } catch (error) {
    console.error('Failed to fetch data from the API:', error)
  } finally {
    stopLoading()
  }
}

// Replace content in the editor
const replaceContent = (
  range: vscode.Range | vscode.Position | vscode.Selection,
  code: string
) => {
  editor?.edit((editBuilder) => {
    editBuilder.replace(range, code)
  })
}

// Main plugin function
export const YACAPlugin = async () => {
  if (!editor) {
    vscode.window.showErrorMessage('No editor is active')
    return
  }
  const startLine = editor.document.lineAt(0).range.start.line
  const endLine = editor.document.lineAt(0).range.end.line
  const range = new vscode.Range(
    editor.document.lineAt(0).range.start,
    editor.document.lineAt(editor.document.lineCount - 1).range.end
  )
  startLoading(startLine, endLine)
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
  startLoading(selectedRange.start.line, selectedRange.end.line)
  const code = editor.document.getText(selectedRange)
  if (!code.length) {
    return
  }
  await fetchDataFromAPI(selectedRange, code)
}
