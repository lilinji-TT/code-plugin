import * as vscode from 'vscode'
import { Editor } from './function/editor'
const URL =
  'http://s-gateway-qa.k8s.zhihuiya.com/s-ops-yaca-backend/2023-07/code/improvement'
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'extension.YACA:VsCodePlugin',
    Editor
  )

  context.subscriptions.push(disposable)

  let disposable2 = vscode.commands.registerCommand(
    'extension.myCustomCommandExplorer',
    function () {
      vscode.window.showInformationMessage(
        'My Custom Command for Editor Executed!'
      )
    }
  )
  context.subscriptions.push(disposable2)
}

export function deactivate() {}
