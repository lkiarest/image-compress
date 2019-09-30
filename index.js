const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
const compressConf = require('./config.json')

const currentDir = path.resolve(__dirname)

let allImages = []

// 遍历出所有图片文件
const walkImages = ({ rootDir = currentDir, formats = ['.jpg', '.png'] } = {}) => {
  if (!fs.existsSync(rootDir)) {
    return
  }

  const stat = fs.statSync(rootDir)
  if (stat.isFile()) {
    const ext = path.extname(rootDir)

    if (formats.includes(ext)) {
      allImages.push(rootDir)
    }
  } else if (stat.isDirectory()) {
    const files = fs.readdirSync(rootDir)
    files.forEach(file => {
      walkImages({ rootDir: path.join(rootDir, file), formats })
    })
  }
}

/**
 * 处理单个文件
 */
const compressImg = (imgFile, radio = 0.5) => {
  const ext = path.extname(imgFile)
  const oldName = imgFile.replace(ext, '') + '.old' + ext
  fs.renameSync(imgFile, oldName)
  const img = sharp(oldName)
  img.metadata().then(meta => {
    img.resize(Math.round(meta.width * radio), Math.round(meta.height * radio))
      .toFile(imgFile)
      .then(() => {
        if (compressConf.removeOld) {
          fs.unlinkSync(oldName)
        }

        console.info(imgFile, ' done !')
      })
  })
}

/**
 * 开始处理
 */
const start = () => {
  allImages = []
  walkImages({
    rootDir: compressConf.root,
    formats: compressConf.format
  })

  if (allImages.length > 0) {
    allImages.forEach(item => {
      compressImg(item, compressConf.radio)
    })
  }
}

start()
