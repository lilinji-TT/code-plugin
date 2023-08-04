import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'
import { fetchData } from '../api'
import { ImprovementScope } from '../type'

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

export const getSelectedFileRelativePath = (absFilePath: string): string => {
  const workspaceFolders = vscode.workspace.workspaceFolders
  if (workspaceFolders && workspaceFolders.length > 0) {
    const workspaceRoot = workspaceFolders[0].uri.fsPath
    const relativePath = path.relative(workspaceRoot, absFilePath)
    return relativePath
  }
  vscode.window.showErrorMessage('No workspace folder found')
  return 'No workspace folder found'
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
export const createSelectedFileRequestData = (
  code: string,
  abspath: string
) => {
  const language = getFileLanguage(abspath)
  const relativePath = getSelectedFileRelativePath(abspath)

  return {
    scope: ImprovementScope.FILE,
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

// 检查给定路径是文件还是目录
export const checkPath = (
  filePath: string,
  callback: (type: string, path: string) => void
): void => {
  fs.lstat(filePath, (err, stats) => {
    if (err) {
      vscode.window.showErrorMessage(`Error reading path: ${filePath}`)
      console.error(err)
      return
    }

    if (stats.isFile()) {
      callback('file', filePath)
    } else if (stats.isDirectory()) {
      callback('directory', filePath)
    } else {
      console.log(`Not a file or directory: ${filePath}`)
    }
  })
}

// 读取文件内容
export const readFile = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.log(`Error reading file: ${filePath}`)
        console.error(err)
        reject(err)
        return
      }
      resolve(data)
    })
  })
}

// 写入文件内容
export const writeFile = async (
  filePath: string,
  data: string,
  codeComment: string
) => {
  fs.writeFile(filePath, data, 'utf8', (err) => {
    if (err) {
      console.log(`Error writing file: ${filePath}`)
      console.error(err)
      return
    }

    vscode.window.showInformationMessage('Done! ' + codeComment)
  })
}

export const getFileLanguage = (filePath: string): string => {
  const ext = path.extname(filePath)
  switch (ext) {
    case '.sh':
      return 'BASH'
    case '.c':
      return 'C'
    case '.cpp':
      return 'CPP'
    case '.cs':
      return 'CSHARP'
    case '.go':
      return 'GO'
    case '.java':
      return 'JAVA'
    case '.js':
      return 'JAVASCRIPT'
    case '.kt':
      return 'KOTLIN'
    case '.py':
      return 'PYTHON'
    case '.rs':
      return 'RUST'
    case '.sql':
      return 'SQL'
    case '.ts':
      return 'TYPESCRIPT'
    case '.php':
      return 'PHP'
    case '.R':
      return 'R'
    case '.rb':
      return 'RUBY'
    case '.jsx':
      return 'JAVASCRIPT JSX'
    case '.vue':
      return 'VUE'
    case '.tsx':
      return 'TYPESCRIPT JSX'
    default:
      return 'UNKNOWN'
  }
}
