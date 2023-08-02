import axios from 'axios'
import * as vscode from 'vscode'
import { ImprovementScope } from '../type'
const URL =
  'http://s-gateway-qa.k8s.zhihuiya.com/s-ops-yaca-backend/2023-07/code/improvement'
export const Editor = async () => {
  let editor = vscode.window.activeTextEditor
  const document = editor!.document
  if (!editor) {
    vscode.window.showErrorMessage('No editor is active')
    return
  } else {
    let language = editor.document.languageId
    let quickPick = vscode.window.createQuickPick()
    quickPick.items = ['选中部分', '全选'].map((label) => ({ label }))
    quickPick.onDidChangeSelection(async ([item]) => {
      if (item) {
        let choice = item.label
        let range: vscode.Range | vscode.Selection | undefined
        if (choice === '全选') {
          range = new vscode.Range(
            editor!.document.lineAt(0).range.start,
            editor!.document.lineAt(editor!.document.lineCount - 1).range.end
          )
        } else {
          range = editor!.selection
        }

        const code = document.getText(range)
        if (!code) {
          return
        }
        // 请求后端并获取新的内容
        // 注意, 在这里你需要实现你自己的逻辑 (比如使用 fetch, axios 等去请求真实的 API)
        const path = document.uri.fsPath

        const data = {
          scope: ImprovementScope.SNIPPET,
          project_objects: [
            {
              path,
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
        vscode.window.showInformationMessage('language: ' + language)
        let response: any
        try {
          response = await axios.post(URL, data)
        } catch (error: any) {
          console.log('hello error', error)
        }
        console.log(response.data.comment)
        console.log(response.data.improved_project_objects[0].code.content)
        // 消息提示接口
        vscode.window.showInformationMessage('response', response)
        editor!.edit((editBuilder) => {
          if (range) {
            editBuilder.replace(
              range,
              response.data.improved_project_objects[0].code.content
            )
          }
        })
      }
    })
    quickPick.onDidHide(() => quickPick.dispose())
    quickPick.show()
  }
}
