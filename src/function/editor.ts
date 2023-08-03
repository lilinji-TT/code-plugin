import axios from 'axios'
import * as vscode from 'vscode'
import { ImprovementScope, RequestData } from '../type'
import path = require('path')
const URL =
  'http://s-gateway-qa.k8s.zhihuiya.com/s-ops-yaca-backend/2023-07/code/improvement'

let editor = vscode.window.activeTextEditor

const getRelativePath = (): string => {
  if (editor) {
    let filePath = editor!.document.fileName
    let workspaceRoot
    if (vscode.workspace.workspaceFolders !== undefined) {
      workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath
    }
    let relativePath = path.relative(workspaceRoot!, filePath)

    return relativePath
  }
  vscode.window.showErrorMessage('No Editor is active')
  return 'No Editor is active'
}

const getCodeLanguage = (): string => {
  return editor!.document.languageId.toUpperCase()
}

async function fetchFromAPI(code: string) {
  let language = getCodeLanguage()
  let relativePath = getRelativePath()
  const data: RequestData = {
    scope: ImprovementScope.SNIPPET,
    project_objects: [
      {
        path: relativePath,
        is_directory: false,
        size: code.length,
        code: {
          content: `${code}`,
          language,
        },
      },
    ],
    rules: ['AMBIGUOUS_NAME', 'EARLY_RETURN'],
  }
  return await axios.post(URL, data)
}

export const YACAPlugin = async () => {
  if (!editor) {
    vscode.window.showErrorMessage('No editor is active')
    return
  }

  //运行命令选择所有文本
  const range = new vscode.Range(
    editor.document.lineAt(0).range.start,
    editor.document.lineAt(editor.document.lineCount - 1).range.end
  )

  const code = editor.document.getText(range)
  if (!code) {
    return
  }

  const response = await fetchFromAPI(code)
  //处理响应
  if (!response.data.improved_project_objects[0].code.content) {
    return
  }
  //处理响应
  if (range) {
    replaceContent(
      range,
      response.data.improved_project_objects[0].code.content
    )
  }
}

export const YACAPluginSelected = async () => {
  const editor = vscode.window.activeTextEditor //获取当前激活的编辑区

  if (!editor) {
    vscode.window.showErrorMessage('No editor is active')
    return
  }

  const code = editor.document.getText(editor.selection)
  const range = editor.selection
  if (!code) {
    return
  }

  const response = await fetchFromAPI(code)
  //处理响应
  if (!response.data.improved_project_objects[0].code.content) {
    return
  }
  //处理响应
  if (range) {
    replaceContent(
      range,
      response.data.improved_project_objects[0].code.content
    )
  }
}

const replaceContent = async (
  range: vscode.Range | vscode.Position | vscode.Selection,
  code: string
) => {
  editor!.edit((editBuilder) => {
    editBuilder.replace(range, code)
  })
}
