import * as vscode from 'vscode'
import { fetchData } from '../api'
import { fileProps } from '../type'
import {
  checkPath,
  createSelectedFileRequestData,
  readFile,
  writeFile,
} from '../utils'

export const selectedFile = async ({ fsPath }: fileProps) => {
  checkPath(fsPath, async (type, path) => {
    if (type === 'file') {
      const code = await readFile(path)
      const requestData = createSelectedFileRequestData(code, path)
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Processing request',
          cancellable: false,
        },
        async (progress) => {
          progress.report({ message: 'Starting to fetch data from the API...' })
          const response = await fetchData(requestData)
          if (response) {
            const improvedCode = response.data.improved_project_objects[0]?.code?.content
            const codeComment = response.data.comment
            await writeFile(path, improvedCode, codeComment)
          }
          progress.report({ message: 'Request finished' })
        }
      )
    }
  })
}
