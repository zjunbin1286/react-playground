import { setupTypeAcquisition } from '@typescript/ata'
import typescriprt from 'typescript';

export function createATA(onDownloadFile: (code: string, path: string) => void) {
  const ata = setupTypeAcquisition({
    projectName: 'my-ata',
    typescript: typescriprt,
    logger: console,
    delegate: {
      // 该回调可以拿到下载的代码和路径
      receivedFile: (code, path) => {
        console.log('自动下载的包', path);
        onDownloadFile(code, path);
      }
    },
  })

  return ata;
}
