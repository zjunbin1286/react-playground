import { transform } from '@babel/standalone'
import { File, Files } from '../../PlaygroundContext'
import { ENTRY_FILE_NAME } from '../../files'
import { PluginObj } from '@babel/core'
import { getModuleFile, css2Js, json2Js } from '../../../../utils'

/**
 * babel 编译之前，判断下文件内容有没有 import React，没有就自动引入
 * 
 * @param filename 
 * @param code
 * @returns 
 */
export const beforeTransformCode = (filename: string, code: string) => {
  let _code = code
  const regexReact = /import\s+React/g
  if ((filename.endsWith('.jsx') || filename.endsWith('.tsx')) && !regexReact.test(code)) {
    _code = `import React from 'react';\n${code}`
  }
  return _code
}

/**
 * 转换
 * @param filename 文件名
 * @param code 内容
 * @param files 文件信息
 * @returns 
 */
export const babelTransform = (filename: string, code: string, files: Files) => {
  let _code = beforeTransformCode(filename, code);
  let result = ''
  try {
    // 调用 babel 的 transform 方法进行编译。
    result = transform(_code, {
      // 指定 react 和 typescript，也就是对 jsx 和 ts 语法做处理
      presets: ['react', 'typescript'],
      filename,
      plugins: [customResolver(files)],
      // 编译后保持原有行列号不变
      retainLines: true
    }).code!
  } catch (e) {
    console.error('编译出错', e);
  }
  return result
}

/**
 * 通过 babel 插件来处理 import 语句，转换成 blob url 的方式
 * @param files 
 * @returns 
 */
function customResolver(files: Files): PluginObj {
  return {
    visitor: {
      ImportDeclaration(path) {
        const modulePath = path.node.source.value
        if (modulePath.startsWith('.')) {
          // 获取模块文件
          const file = getModuleFile(files, modulePath)
          if (!file)
            return

          if (file.name.endsWith('.css')) {
            path.node.source.value = css2Js(file) // 处理css
          } else if (file.name.endsWith('.json')) {
            path.node.source.value = json2Js(file) // 处理json
          } else {
            path.node.source.value = URL.createObjectURL(
              new Blob([babelTransform(file.name, file.value, files)], {
                type: 'application/javascript',
              })
            )
          }
        }
      }
    }
  }
}

/**
 * 对 main.tsx 内容做编译，然后展示编译后的代码
 * @param files 
 * @returns 
 */
export const compile = (files: Files) => {
  const main = files[ENTRY_FILE_NAME]
  return babelTransform(ENTRY_FILE_NAME, main.value, files)
}

// worker 线程这边则是监听主线程的 message，传递 files 编译后的代码给主线程
self.addEventListener('message', async ({ data }) => {
  try {
    self.postMessage({
      type: 'COMPILED_CODE',
      data: compile(data)
    })
  } catch (e) {
    self.postMessage({ type: 'ERROR', error: e })
  }
})
