import { strFromU8, strToU8, unzlibSync, zlibSync } from "fflate"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import { File, Files } from '../pages/ReactPlayground/PlaygroundContext'

export const fileName2Language = (name: string) => {
  const suffix = name.split('.').pop() || ''
  if (['js', 'jsx'].includes(suffix)) return 'javascript'
  if (['ts', 'tsx'].includes(suffix)) return 'typescript'
  if (['json'].includes(suffix)) return 'json'
  if (['css'].includes(suffix)) return 'css'
  return 'javascript'
}

/**
 * 获取模块文件
 * @param files 
 * @param modulePath 
 * @returns 
 */
export const getModuleFile = (files: Files, modulePath: string) => {
  let moduleName = modulePath.split('./').pop() || ''
  if (!moduleName.includes('.')) {
    const realModuleName = Object.keys(files).filter(key => {
      return key.endsWith('.ts')
        || key.endsWith('.tsx')
        || key.endsWith('.js')
        || key.endsWith('.jsx')
    }).find((key) => {
      return key.split('.').includes(moduleName)
    })
    if (realModuleName) {
      moduleName = realModuleName
    }
  }
  return files[moduleName]
}

/**
 * json to js
 * @param file 
 * @returns 
 */
export const json2Js = (file: File) => {
  const js = `export default ${file.value}`
  return URL.createObjectURL(new Blob([js], { type: 'application/javascript' }))
}

/**
 * css to js
 * @param file 
 * @returns 
 */
export const css2Js = (file: File) => {
  const randomId = new Date().getTime()
  const js = `
    (() => {
      const stylesheet = document.createElement('style')
      stylesheet.setAttribute('id', 'style_${randomId}_${file.name}')
      document.head.appendChild(stylesheet)

      const styles = document.createTextNode(\`${file.value}\`)
      stylesheet.innerHTML = ''
      stylesheet.appendChild(styles)
    })()
  `
  return URL.createObjectURL(new Blob([js], { type: 'application/javascript' }))
}

/**
 * 压缩代码
 * 代码内容会压缩后以 asc 码字符串的方式保存在 url 里
 * 调用 fflate 包的 strToU8 把字符串转为字节数组，然后 zlibSync 压缩，之后 strFromU8 转为字符串。
 * 最后用 btoa 把这个 base64 编码的字符串转为 asc 码
 * @param data 
 * @returns 
 */
export function compress(data: string): string {
  const buffer = strToU8(data)
  const zipped = zlibSync(buffer, { level: 9 })
  const str = strFromU8(zipped, true)
  return btoa(str)
}

/**
 * 解压代码
 * 跟 compress 相反
 * @param base64 
 * @returns 
 */
export function uncompress(base64: string): string {
  const binary = atob(base64)

  const buffer = strToU8(binary, true)
  const unzipped = unzlibSync(buffer)
  return strFromU8(unzipped)
}

/**
 * 下载代码
 * @param files 
 */
export async function downloadFiles(files: Files) {
  const zip = new JSZip()

  Object.keys(files).forEach((name) => {
    zip.file(name, files[name].value)
  })

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, `code${Math.random().toString().slice(2, 8)}.zip`)
}
