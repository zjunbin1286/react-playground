import { useContext, useEffect, useRef, useState } from "react"
import { PlaygroundContext } from "../../PlaygroundContext"
import { compile } from "./compiler.worker.ts";
import iframeRaw from './iframe.html?raw'
import { IMPORT_MAP_FILE_NAME } from "../../files";
import { Message } from "../Message";
import CompilerWorker from './compiler.worker?worker'
import { debounce } from "lodash-es";

interface MessageData {
  data: {
    type: string
    message: string
  }
}

export default function Preview() {
  const { files } = useContext(PlaygroundContext)
  const [compiledCode, setCompiledCode] = useState('')

  const compilerWorkerRef = useRef<Worker>();

  // 主线程里创建这个 worker 线程
  useEffect(() => {
    if (!compilerWorkerRef.current) {
      compilerWorkerRef.current = new CompilerWorker();
      // 监听 message 消息
      compilerWorkerRef.current.addEventListener('message', ({ data }) => {
        // console.log('worker', data);
        if (data.type === 'COMPILED_CODE') {
          // 主线程这边给 worker 线程传递 files，然后拿到 woker 线程传回来的编译后的代码
          setCompiledCode(data.data);
        } else {
          //console.log('error', data);
        }
      })
    }
  }, []);

  useEffect(debounce(() => {
    compilerWorkerRef.current?.postMessage(files)
  }, 500), [files]);

  // 替换iframe中的引入
  const getIframeUrl = () => {
    const res = iframeRaw.replace(
      '<script type="importmap"></script>',
      `<script type="importmap">${files[IMPORT_MAP_FILE_NAME].value
      }</script>`
    ).replace(
      '<script type="module" id="appSrc"></script>',
      `<script type="module" id="appSrc">${compiledCode}</script>`,
    )
    return URL.createObjectURL(new Blob([res], { type: 'text/html' }))
  }

  const [iframeUrl, setIframeUrl] = useState(getIframeUrl());

  useEffect(() => {
    setIframeUrl(getIframeUrl())
  }, [files[IMPORT_MAP_FILE_NAME].value, compiledCode])

  const [error, setError] = useState('')

  const handleMessage = (msg: MessageData) => {
    const { type, message } = msg.data
    if (type === 'ERROR') {
      setError(message)
    }
  }

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <div style={{ height: '100%' }}>
      <iframe
        src={iframeUrl}
        style={{
          width: '100%',
          height: '100%',
          padding: 0,
          border: 'none',
        }}
      />
      <Message type='error' content={error} />
    </div>
  )
}
