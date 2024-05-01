import Editor from "./Editor";
import FileNameList from "./FileNameList";

export default function CodeEditor() {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <FileNameList />
      <Editor />
    </div>
  )
}
