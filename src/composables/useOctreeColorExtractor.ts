class OctreeColorExtractor {
  maxColors: number
  tree: Octree

  // 构造函数，用于初始化对象
  constructor(maxColors: number = 8) {
    this.maxColors = maxColors
    this.tree = new Octree()
  }

  async extract(imageData: Uint8ClampedArray<ArrayBufferLike>): Promise<[number, number, number][]> {
    const pixels = this.getPixels(imageData)

    pixels.forEach((color: number[]) => this.tree.insert(color))
    this.tree.reduce(this.maxColors)

    return this.tree
      .getColors()
      .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
      .map((c: { color: number[] }) => c.color) as any
  }

  getPixels(imageData: Uint8ClampedArray<ArrayBufferLike>): number[][] {
    const pixels: number[][] = []
    for (let i = 0; i < imageData.length; i += 4) {
      if (imageData[i + 3] < 128) {
        continue
      }
      pixels.push([imageData[i], imageData[i + 1], imageData[i + 2]])
    }
    return pixels
  }
}

class Octree {
  root: OctreeNode
  leafCount: number
  reducible: OctreeNode[][]

  constructor() {
    this.root = new OctreeNode(0)
    this.leafCount = 0
    this.reducible = Array.from({ length: 8 })
      .fill(null)
      .map(() => [])
  }

  insert(color: number[]) {
    this.root.insert(color, 0, this)
  }

  reduce(maxColors: number) {
    while (this.leafCount > maxColors) {
      let depth = -1
      // 修复1: 从最深层级开始归约
      for (let i = this.reducible.length - 1; i >= 0; i--) {
        if (this.reducible[i].length > 0) {
          depth = i
          break
        }
      }
      if (depth < 0) {
        break
      }

      const node = this.reducible[depth].pop()
      const removedLeaves = node!.merge()
      this.leafCount -= removedLeaves
    }
  }

  getColors(): { color: number[], count: number }[] {
    return this.root.getColors()
  }
}

class OctreeNode {
  level: number
  children: OctreeNode[]
  color: number[]
  pixelCount: number
  isLeaf: boolean

  constructor(level: number) {
    this.level = level
    this.children = []
    this.color = [0, 0, 0]
    this.pixelCount = 0
    this.isLeaf = false
  }

  insert(color: number[], level: number, octree: Octree) {
    if (this.isLeaf) {
      this.color[0] += color[0]
      this.color[1] += color[1]
      this.color[2] += color[2]
      this.pixelCount++
      return
    }

    const maxLevel = 7

    const bit = maxLevel - level
    const idx
      = (((color[0] >> bit) & 1) << 2) // 计算红色通道的索引位
      | (((color[1] >> bit) & 1) << 1) // 计算绿色通道的索引位
      | ((color[2] >> bit) & 1) // 计算蓝色通道的索引位

    if (!this.children[idx]) {
      this.children[idx] = new OctreeNode(level + 1)
      if (level === maxLevel) {
        this.children[idx].isLeaf = true
        octree.leafCount++
      } else {
        octree.reducible[level].push(this.children[idx])
      }
    }
    this.children[idx].insert(color, level + 1, octree)
  }

  merge(): number {
    let leafChildren = 0
    // 修复2: 准确统计叶子子节点数量
    this.children.forEach((child: OctreeNode | undefined) => {
      if (!child) {
        return
      }
      if (child.isLeaf) {
        leafChildren++
      }
      this.color[0] += child.color[0]
      this.color[1] += child.color[1]
      this.color[2] += child.color[2]
      this.pixelCount += child.pixelCount
    })

    this.isLeaf = true
    this.children = []
    return leafChildren - 1 // 返回实际减少的叶子数
  }

  getColors(): { color: number[], count: number }[] {
    if (this.isLeaf) {
      return [
        {
          color: [
            Math.round(this.color[0] / this.pixelCount),
            Math.round(this.color[1] / this.pixelCount),
            Math.round(this.color[2] / this.pixelCount),
          ],
          count: this.pixelCount,
        },
      ]
    }
    return this.children.reduce(
      (acc: { color: number[], count: number }[], child: OctreeNode | undefined) =>
        child ? acc.concat(child.getColors()) : acc,
      [],
    )
  }
}

export function useOctreeColorExtractor(imageData: MaybeRef<Uint8ClampedArray<ArrayBufferLike> | undefined>) {
  const ocColors = ref<[number, number, number][]>([])

  watchEffect(async () => {
    const _imageData = toValue(imageData)
    if (!_imageData || !_imageData.byteLength) {
      ocColors.value = []
      return
    }

    const octree = new OctreeColorExtractor()

    ocColors.value = (await octree.extract(_imageData)).splice(0, 5)
  })

  return {
    sourceOcColors: ocColors,
    ocColors: computed(() => ocColors.value.map(getRGBString)),
  }
}

export function getRGBString(array: [number, number, number]) {
  return `rgb(${array.join(',')})`
}
