import { useContext } from "react";
import Editor from "./Editor";
import FileNameList from "./FileNameList";
import styles from './index.module.scss'
import { PlaygroundContext } from "../../PlaygroundContext";
import { debounce } from "lodash-es";

export default function CodeEditor() {
  const {
    files,
    setFiles,
    selectedFileName,
    setSelectedFileName,
    theme,
  } = useContext(PlaygroundContext)

  const file = files[selectedFileName];

  function onEditorChange(value?: string) {
    files[file.name].value = value!
    setFiles({ ...files })
  }

  return (
    <div className={styles.codeEditor}>
      <FileNameList />
      <Editor
        file={file}
        onChange={debounce(onEditorChange, 1500)}
        options={{ theme: `vs-${theme}` }}
      />
    </div>
  )
}
