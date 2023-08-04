import * as vscode from 'vscode'
import { fetchData } from '../api'
import { ImprovementScope } from '../type'
import path = require('path')

export const editor = vscode.window.activeTextEditor

// Get the relative path of the current file
export const getRelativePath = (): string => {
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
export const getCodeLanguage = (): string => {
  return editor?.document.languageId.toUpperCase() || ''
}

// Replace content in the editor
export const replaceContent = (
  range: vscode.Range | vscode.Position | vscode.Selection,
  code: string,
  codeComment: string
) => {
  editor?.edit((editBuilder) => {
    editBuilder.replace(range, code)
    vscode.window.showInformationMessage('Done! ' + codeComment)
  })
}

export const createRequestData = (code: string) => {
  const language = getCodeLanguage()
  const relativePath = getRelativePath()

  return {
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
}

export const processData = (
  response: any,
  range: vscode.Range | vscode.Position | vscode.Selection
) => {
  const improvedCode = response.data.improved_project_objects[0]?.code?.content
  const codeComment = response.data.comment
  if (improvedCode) {
    replaceContent(range, improvedCode, codeComment)
  }
}

export const fetchDataFromAPI = async (
  range: vscode.Range | vscode.Position | vscode.Selection,
  code: string
) => {
  const requestData = createRequestData(code)

  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Processing request',
      cancellable: false,
    },
    async (progress) => {
      progress.report({ message: 'Starting to fetch data from the API...' })
      const response = await fetchData(requestData)
      progress.report({ message: 'Request finished' })
      if (response) {
        processData(response, range)
      }
    }
  )
}
