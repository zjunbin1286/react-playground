import classnames from 'classnames'
import React, { useEffect, useState } from 'react'

import styles from './index.module.scss'

export type MessageProps = {
  /** 错误类型 */
  type: 'error' | 'warn'
  /** 内容 */
  content: string
}

export const Message: React.FC<MessageProps> = (props) => {
  const { type, content } = props
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(!!content)
  }, [content])

  return visible ? (
    <div className={classnames(styles.msg, styles[type])}>
      <pre dangerouslySetInnerHTML={{ __html: content }}></pre>
      <button className={styles.dismiss} onClick={() => setVisible(false)}>
        ✕
      </button>
    </div>
  ) : null
}
