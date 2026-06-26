/**
 * SSE 流式请求工具函数
 * 用于调用 AI 对话接口，实时接收流式回复
 */

/**
 * 发送 SSE 请求，实时接收 AI 回复
 * @param appId 应用 ID
 * @param message 用户消息
 * @param onMessage 收到消息片段时的回调
 * @param onDone 流结束时的回调
 * @param onError 出错时的回调
 * @returns AbortController，用于取消请求
 */
export function chatToGenCode(
  appId: string,
  message: string,
  onMessage: (text: string) => void,
  onDone: () => void,
  onError: (error: Error) => void,
): AbortController {
  const controller = new AbortController()
  const { signal } = controller

  const baseUrl = import.meta.env.VITE_APP_API_BASE_URL
  const url = new URL(`${baseUrl}/app/chat/gen/code`)
  url.searchParams.set('appId', String(appId))
  url.searchParams.set('message', message)

  fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    signal,
  })
    .then(async (response) => {
      // 先检查响应类型，处理 JSON 错误响应
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const json = await response.json()
        if (json.code !== 0) {
          throw new Error(json.message || '请求失败')
        }
        throw new Error('意外的 JSON 响应')
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法获取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          onDone()
          break
        }

        buffer += decoder.decode(value, { stream: true })

        // SSE 事件以空行分隔（\n\n 或 \r\n\r\n）
        const events = buffer.split(/\n\n|\r\n\r\n/)
        // 保留最后一个可能不完整的事件
        buffer = events.pop() || ''

        for (const event of events) {
          const lines = event.split('\n')
          let eventType = ''
          let eventData = ''

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.slice(6).trim()
            } else if (line.startsWith('data:')) {
              eventData = line.slice(5).trim()
            }
          }

          // 处理结束事件
          if (eventType === 'done') {
            onDone()
            return
          }

          // 解析 data 中的 JSON，提取 "d" 字段
          if (eventData) {
            try {
              const parsed = JSON.parse(eventData)
              // 检查是否是错误响应
              if (parsed.code && parsed.code !== 0) {
                throw new Error(parsed.message || '请求失败')
              }
              const text = parsed.d ?? eventData
              onMessage(text)
            } catch (e) {
              // 如果是我们抛出的错误，重新抛出
              if (e instanceof Error && e.message !== '请求失败') {
                // 非 JSON 格式，直接使用原始数据
                onMessage(eventData)
              } else {
                throw e
              }
            }
          }
        }
      }
    })
    .catch((error) => {
      if (error.name !== 'AbortError') {
        onError(error)
      }
    })

  return controller
}
