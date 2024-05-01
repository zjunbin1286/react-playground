import Editor from "./Editor";
import FileNameList from "./FileNameList";
import styles from './index.module.scss'

export default function CodeEditor() {
  const file = {
    name: 'coderbin.tsx',
    // value: 'import lodash from "lodash";\n\nconst a = <div>CoderBin</div>',
    value: 'const a = <div>CoderBin</div>',
    language: 'typescript'
  }

  function onEditorChange() {
    console.log(...arguments);
  }

  return (
    <div className={styles.codeEditor}>
      <FileNameList />
      <Editor file={file} onChange={onEditorChange}/>
    </div>
  )
}
