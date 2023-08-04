import * as vscode from 'vscode'
import { YACAPlugin, YACAPluginSelected } from './function/editor'

export function activate(context: vscode.ExtensionContext) {
  const disposableYACAPlugin = vscode.commands.registerCommand(
    'extension.YACA:VsCodePlugin',
    YACAPlugin
  )
  const disposableYACAPluginSelected = vscode.commands.registerCommand(
    'extension.YACA:VsCodePluginSelected',
    YACAPluginSelected
  )
  const disposableYACAPluginFileSelected = vscode.commands.registerCommand(
    'extension.YACAFileSelected',
    async () => {
      vscode.window.showInformationMessage('YACAFileSelected')
    }
  )
  context.subscriptions.push(disposableYACAPlugin)
  context.subscriptions.push(disposableYACAPluginSelected)
  context.subscriptions.push(disposableYACAPluginFileSelected)
}

export function deactivate() {}
