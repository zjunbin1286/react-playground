import React, { createContext, PropsWithChildren, useEffect, useState } from 'react'
import { compress, fileName2Language, uncompress } from '../../utils'
import { initFiles } from './files'

export type File = {
  /** 文件名 */
  name: string
  /** 代码内容 */
  value: string
  /** 文件语言（在 monaco editor 这里会用到，用于不同语法的高亮） */
  language: string
}

export type Files = {
  /** 文件名: 文件信息 */
  [key: string]: File
}

export type Theme = 'light' | 'dark'

export type PlaygroundContext = {
  files: Files
  selectedFileName: string
  setSelectedFileName: (fileName: string) => void
  setFiles: (files: Files) => void
  addFile: (fileName: string) => void
  removeFile: (fileName: string) => void
  updateFileName: (oldFieldName: string, newFieldName: string) => void
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const PlaygroundContext = createContext<PlaygroundContext>({
  selectedFileName: 'App.tsx',
} as PlaygroundContext)

const getFilesFromUrl = () => {
  let files: Files | undefined
  try {
    const hash = uncompress(window.location.hash.slice(1))
    files = JSON.parse(hash)
  } catch (error) {
    console.error(error)
  }
  return files
}

export const PlaygroundProvider = (props: PropsWithChildren) => {
  const { children } = props
  const [files, setFiles] = useState<Files>(getFilesFromUrl() || initFiles)
  const [selectedFileName, setSelectedFileName] = useState('App.tsx')
  const [theme, setTheme] = useState<Theme>('dark')

  // 新增文件
  const addFile = (name: string) => {
    files[name] = {
      name,
      language: fileName2Language(name),
      value: '',
    }
    setFiles({ ...files })
  }

  // 修改文件名
  const updateFileName = (oldFieldName: string, newFieldName: string) => {
    if (!files[oldFieldName] || newFieldName === undefined || newFieldName === null) return
    const { [oldFieldName]: value, ...rest } = files
    const newFile = {
      [newFieldName]: {
        ...value,
        language: fileName2Language(newFieldName),
        name: newFieldName,
      },
    }
    setFiles({
      ...rest,
      ...newFile,
    })
  }


  // 移除文件
  const removeFile = (name: string) => {
    delete files[name]
    setFiles({ ...files })
  }

  // 设置文件信息到location.hash
  useEffect(() => {
    const hash = compress(JSON.stringify(files))
    window.location.hash = hash
  }, [files])

  return (
    <PlaygroundContext.Provider
      value={{
        files,
        selectedFileName,
        setSelectedFileName,
        setFiles,
        addFile,
        removeFile,
        updateFileName,
        theme,
        setTheme
      }}
    >
      {children}
    </PlaygroundContext.Provider>
  )

}