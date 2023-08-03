import * as vscode from 'vscode'
import { YACAPlugin, YACAPluginSelected } from './function/editor'
export function activate(context: vscode.ExtensionContext) {
  let disposable1 = vscode.commands.registerCommand(
    'extension.YACA:VsCodePlugin',
    YACAPlugin
  )
  let disposable2 = vscode.commands.registerCommand(
    'extension.YACA:VsCodePluginSelected',
    YACAPluginSelected
  )
  context.subscriptions.push(disposable1)
  context.subscriptions.push(disposable2)
}

export function deactivate() {}
