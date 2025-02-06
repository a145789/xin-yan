async function loadImage(source: string | HTMLImageElement): Promise<HTMLImageElement> {
  if (typeof source === 'string') {
    return new Promise((resolve: (img: HTMLImageElement) => void, reject: (error: any) => void) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = source
    })
  }
  return source.complete
    ? source
    : await new Promise((resolve: (img: HTMLImageElement) => void) => {
      source.onload = () => resolve(source)
    })
}

export function useImageData(source: MaybeRef<string | HTMLImageElement>) {
  const imageData = shallowRef<Uint8ClampedArray<ArrayBufferLike>>()
  const imageLoading = ref(false)

  watchDebounced(() => toValue(source), async (source) => {
    if (!source) {
      imageData.value = undefined
      return
    }

    imageLoading.value = true
    try {
      const image = await loadImage(source)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = image.naturalWidth || image.width
      canvas.height = image.naturalHeight || image.height

      ctx.drawImage(image, 0, 0)

      imageData.value = ctx.getImageData(0, 0, canvas.width, canvas.height).data

      imageLoading.value = false
    } catch {
      imageData.value = undefined
      Snackbar.error('路径不正确或无法加载该图片！')
      imageLoading.value = false
    }
  }, { debounce: 600, maxWait: 5000 })

  return {
    imageData,
    imageLoading,
  }
}
