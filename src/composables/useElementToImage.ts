import html2canvas from 'html2canvas'

interface ElementToImageOptions {
  /** 图片文件名（不含扩展名） */
  fileName?: string
  /** 图片类型 */
  imageType?: 'png' | 'jpeg'
  /** 图片质量 (0-1), 仅对 JPEG 有效 */
  quality?: number
}

/**
 * 将 DOM 元素转换为图片并下载
 * @param target DOM 元素或其引用
 * @param options 配置项
 */
export function useElementToImage(target: MaybeRef<HTMLElement | null>) {
  const downloadElementAsImage = async (
    options: ElementToImageOptions = {},
  ) => {
    target = toValue(target)
    if (!target) {
      console.error('目标元素不存在')
      return
    }

    const {
      fileName = 'download',
      imageType = 'png',
      quality = 1,
    } = options

    try {
      // 创建 canvas
      const canvas = await html2canvas(target, {
        logging: false,
        useCORS: true, // 允许跨域图片
        allowTaint: true, // 允许跨域图片
        scale: window.devicePixelRatio, // 设备像素比
        backgroundColor: null, // 透明背景
      })

      // 转换为图片数据
      const mimeType = `image/${imageType}`
      const dataUrl = canvas.toDataURL(mimeType, quality)

      // 创建下载链接
      const link = document.createElement('a')
      link.download = `${fileName}.${imageType}`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('图片生成失败:', error)
    }
  }

  return {
    downloadElementAsImage,
  }
}
