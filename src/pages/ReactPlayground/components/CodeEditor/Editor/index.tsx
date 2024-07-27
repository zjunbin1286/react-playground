import MonacoEditor, { OnMount, EditorProps } from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import { createATA } from './ata'

export type EditorFile = {
  name: string
  value: string
  language: string
}

type Props = {
  file: EditorFile
  onChange?: EditorProps['onChange'],
  options?: editor.IStandaloneEditorConstructionOptions
}

export default function Editor(props: Props) {
  const { file, onChange, options } = props;

  // 编辑器加载完的回调
  const handleEditorMount: OnMount = (editor, monaco) => {
    // ctrl + j 的时候格式化代码（谷歌浏览器默认 shift+alt+f）
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ, () => {
      editor.getAction('editor.action.formatDocument')?.run()
    });

    // 设置 ts 的默认 compilerOptions
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.Preserve,
      esModuleInterop: true,
    })

    // 自动类型获取，传入源码，自动分析出需要的 ts 类型包，然后自动下载
    const ata = createATA((code, path) => {
      // 下载到当前项目的 node_modules 里面 
      monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${path}`)
    })
    editor.onDidChangeModelContent(() => {
      ata(editor.getValue());
    });
    ata(editor.getValue());
  }

  return (
    <MonacoEditor
      height='100%'
      path={file.name}
      language={file.language}
      onMount={handleEditorMount}
      onChange={onChange}
      value={file.value}
      theme="vs-dark"
      options={
        {
          fontSize: 14,
          // 到了最后一行之后依然可以滚动一屏，关闭后就不会了
          scrollBeyondLastLine: false,
          // 缩略图
          minimap: {
            enabled: false,
          },
          // 设置横向纵向滚动条宽度的
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
          ...options
        }
      }
    />
  )
}
