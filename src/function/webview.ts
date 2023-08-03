// 在 extension.ts 文件中创建一个装饰器类
import * as vscode from 'vscode'
class LoadingDecorator {
  private decorationType: vscode.TextEditorDecorationType | undefined

  constructor() {
    // 创建装饰类型，定义装饰器的样式和效果
    this.decorationType = vscode.window.createTextEditorDecorationType({
      textDecoration: 'none; display: inline-block; margin-left: 5px;',
      before: {
        contentText: 'Generating',
        color: 'gray',
      },
    })
  }

  // 显示装饰器，并设置动画效果
  showLoading(startLine: number, endLine: number) {
    const activeEditor = vscode.window.activeTextEditor
    if (activeEditor) {
      const startPosition = new vscode.Position(startLine, 0)
      const endPosition = new vscode.Position(endLine, 0)
      const range = new vscode.Range(startPosition, endPosition)
      activeEditor.edit((editBuilder) => {
        const emptyLine = new vscode.Position(startLine, 0)
        editBuilder.insert(emptyLine, '\n')
      })
      // 将装饰器应用到选中文本开始行的上方
      activeEditor.setDecorations(this.decorationType!, [{ range }])
    }
  }

  // 隐藏装饰器
  hideLoading() {
    const activeEditor = vscode.window.activeTextEditor
    if (activeEditor) {
      // 清除装饰器和空行
      activeEditor.edit((editBuilder) => {
        const firstLine = activeEditor.document.lineAt(0)
        const lastLine = activeEditor.document.lineAt(
          activeEditor.document.lineCount - 1
        )
        const range = new vscode.Range(
          firstLine.range.start,
          lastLine.range.end
        )
        editBuilder.delete(range)
      })
      // 清除所有装饰器
      activeEditor.setDecorations(this.decorationType!, [])
    }
  }
}

// 在需要显示动画效果的位置调用装饰器类的方法
const loadingDecorator = new LoadingDecorator()

export const startLoading = (sLine: number, eLine: number) => {
  loadingDecorator.showLoading(sLine, eLine)
}
export const stopLoading = () => {
  loadingDecorator.hideLoading()
}
