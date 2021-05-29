const Canvas = require('canvas')
const moment = require('moment')
const { writeFile, readFile, unlink } = require('fs/promises')
const { join } = require('path')
const { ImageReferencesModel } = require('../modules/database')
const { headers } = require('./usefulObjects')
const { OrderHeaders } = require('./enums')
const { updateOrderStatus } = require('./database/order')

// TODO: FUNÇÃO PARA AUMENTAR TAMANHO DA IMAGEM CASO O TEXTO PASSE DO HEIGHT MÁXIMO

const IMAGES_DIRECTORY = join(__dirname, '../images/')
const CACHE_DIRECTORY = join(IMAGES_DIRECTORY, '/cache/')
const ARCHIVE_DIRECTORY = join(IMAGES_DIRECTORY, '/archive/')
const FONTS_DIRECTORY = join(__dirname, '../fonts/')

// Register Default Font
Canvas.registerFont(`${FONTS_DIRECTORY}Montserrat-Medium.ttf`, { family: 'SquashCode Font Medium' })
Canvas.registerFont(`${FONTS_DIRECTORY}Montserrat-Regular.ttf`, { family: 'SquashCode Font Regular' })

// Default font strings
const TITLE_FONT = '36px "SquashCode Font Medium", "SquashCode Font Regular"'
const SUBTITLE_FONT = '32px "SquashCode Font Medium", "SquashCode Font Regular"'

// Default distance from texts
const SUBTITLE_DISTANCE = 60
const NEW_HEADER_DISTANCE = 30
const DISTANCE_BETWEEN_SUBTITLES = 50
const BUGGY_DISTANCE = 35

// default sizes
const DEFAULT_CANVAS_HEIGHT = 1682

// Default Positions
const TEXT_X = 115
const ELIPSE_X = TEXT_X - 55
const LINE_X = ELIPSE_X + ((40 / 2) - 2)

async function createOrderImage (id) {
  const year = new Date().getFullYear()
  const canvas = Canvas.createCanvas(2590, DEFAULT_CANVAS_HEIGHT)
  const ctx = canvas.getContext('2d')
  // Elipse Image
  const elipse = await Canvas.loadImage(`${IMAGES_DIRECTORY}elipse.png`)
  // Line Image
  const line = await Canvas.loadImage(`${IMAGES_DIRECTORY}line.png`)
  // Background Image
  const background = await Canvas.loadImage(`${IMAGES_DIRECTORY}background.png`)
  // Footer Image
  const footer = await Canvas.loadImage(`${IMAGES_DIRECTORY}footer.png`)
  // Draw Background Image
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
  // Draw Footer Image
  ctx.drawImage(footer, 0, background.height - footer.height)

  // CopyRight Year
  ctx.font = '40px "SquashCode Font Medium", "SquashCode Font Regular"'
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(year, 525, ((canvas.height - footer.height) + 48) + BUGGY_DISTANCE)

  // Order ID
  ctx.font = TITLE_FONT
  ctx.fillStyle = '#949494'
  ctx.fillText(`#${id}`, 425, 200 + BUGGY_DISTANCE)

  // Default Title Y position
  const titleY = 285 + BUGGY_DISTANCE
  const elipseY = titleY - BUGGY_DISTANCE
  const lineY = titleY + 5
  const subtitleY = titleY + SUBTITLE_DISTANCE
  // Default Title
  ctx.fillStyle = '#D0D0D0'
  ctx.fillText(headers.MAKEORDER, TEXT_X, titleY)

  // Draw Elipse and Line
  ctx.drawImage(elipse, ELIPSE_X, elipseY)
  ctx.drawImage(line, LINE_X, lineY)

  ctx.font = SUBTITLE_FONT
  const initialDate = moment().utcOffset(-3).format('- HH:mm DD/MM/YYYY')
  const initialSubtitle = 'Recebemos seu pedido'
  const dateX = 10 + TEXT_X + ctx.measureText(initialSubtitle).width
  // Draw Default Subtitle
  ctx.fillStyle = '#939393'
  ctx.fillText(initialSubtitle, TEXT_X, subtitleY)
  ctx.fillStyle = '#6F5D87'
  ctx.fillText(initialDate, dateX, subtitleY)

  const dbReferencesManager = new ImageReferencesModel({ _id: id })
  // Define Header value
  dbReferencesManager.references.header.value = OrderHeaders.MAKEORDER
  // Define lineLimit value
  dbReferencesManager.references.lineLimit.value = lineY + 200
  // Define Next Y position
  dbReferencesManager.references.nextY.value = subtitleY + DISTANCE_BETWEEN_SUBTITLES
  // Define maxHeight value
  dbReferencesManager.references.maxHeight.value = DEFAULT_CANVAS_HEIGHT - footer.height - 100
  // Define height value
  dbReferencesManager.references.height.value = DEFAULT_CANVAS_HEIGHT
  // Save values
  await dbReferencesManager.save()

  const imageBuffer = canvas.toBuffer()
  await cacheImage(imageBuffer, id)
  return imageBuffer
}

async function updateOrderImage (id, header, content) {
  const dbReferencesManager = await ImageReferencesModel.findOne({ _id: id }).exec()
  const heightLimit = dbReferencesManager.references.maxHeight.value
  const currentHeight = dbReferencesManager.references.height.value
  const subtitleY = dbReferencesManager.references.nextY.value
  const lineLimitY = dbReferencesManager.references.lineLimit.value
  const currentHeader = dbReferencesManager.references.header.value

  const canvas = Canvas.createCanvas(2590, currentHeight)
  const ctx = canvas.getContext('2d')
  const elipse = await Canvas.loadImage(`${IMAGES_DIRECTORY}elipse.png`)
  const line = await Canvas.loadImage(`${IMAGES_DIRECTORY}line.png`)
  const cachedImage = await Canvas.loadImage(`${CACHE_DIRECTORY}${id}.png`)
  ctx.drawImage(cachedImage, 0, 0, canvas.width, canvas.height)

  ctx.font = SUBTITLE_FONT
  const updateDate = moment().utcOffset(-3).format('- HH:mm DD/MM/YYYY')
  const dateX = 10 + TEXT_X + ctx.measureText(content).width
  const titleY = subtitleY + NEW_HEADER_DISTANCE
  const lineY = titleY + 5
  const elipseY = titleY - BUGGY_DISTANCE
  await checkHeight()

  if (currentHeader === header) {
    await writeSubtitle(content, subtitleY)
  } else {
    ctx.font = TITLE_FONT
    if (header === OrderHeaders.DEVELOPMENT) {
      await updateOrderStatus(id, 'development')
      await updateHeader('DEVELOPMENT')
    } else if (header === OrderHeaders.DELIVER) {
      await updateHeader('DELIVER')
    } else if (header === OrderHeaders.OTHER) {
      await updateHeader('OTHER')
    } else {
      throw new SyntaxError(`Invalid Header: ${header} is a invalid enum for OrderHeaders`)
    }
  }

  async function checkHeight () {
    if (subtitleY > heightLimit) {
      const year = new Date().getFullYear()
      const footer = await Canvas.loadImage(`${IMAGES_DIRECTORY}footer.png`)
      const expandBlock = await Canvas.loadImage(`${IMAGES_DIRECTORY}expand-block.png`)
      canvas.height += expandBlock.height - footer.height
      dbReferencesManager.references.maxHeight.value = canvas.height - footer.height - 100
      dbReferencesManager.references.height.value = canvas.height
      ctx.drawImage(cachedImage, 0, 0, cachedImage.width, cachedImage.height)
      ctx.drawImage(expandBlock, 0, cachedImage.height - footer.height)
      ctx.drawImage(footer, 0, canvas.height - footer.height)
      ctx.font = '40px "SquashCode Font Medium", "SquashCode Font Regular"'
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText(year, 525, ((canvas.height - footer.height) + 48) + BUGGY_DISTANCE)
    }
  }

  async function updateHeader (newHeader) {
    ctx.fillStyle = '#D0D0D0'
    ctx.fillText(headers[newHeader], TEXT_X, titleY)
    await drawDetails(true)
    const newSubtitleY = titleY + SUBTITLE_DISTANCE
    await writeSubtitle(content, newSubtitleY)
    dbReferencesManager.references.header.value = OrderHeaders[newHeader]
  }

  async function drawDetails (elipseToo = false) {
    if (lineY < lineLimitY) {
      ctx.drawImage(line, LINE_X, lineY)
      if (elipseToo) {
        ctx.drawImage(elipse, ELIPSE_X, elipseY)
      }
      dbReferencesManager.references.lineLimit.value = lineY + 200
    } else {
      const fillUpLineY = lineY - (lineY - lineLimitY)
      ctx.drawImage(line, LINE_X, fillUpLineY)
      if (elipseToo) {
        ctx.drawImage(elipse, ELIPSE_X, elipseY)
      }
      dbReferencesManager.references.lineLimit.value = fillUpLineY + 200
    }
  }

  async function writeSubtitle (text, subY) {
    if (subY > lineLimitY) {
      await drawDetails()
    }

    ctx.font = SUBTITLE_FONT
    ctx.fillStyle = '#939393'
    ctx.fillText(text, TEXT_X, subY)
    ctx.fillStyle = '#6F5D87'
    ctx.fillText(updateDate, dateX, subY)
    dbReferencesManager.references.nextY.value = subY + DISTANCE_BETWEEN_SUBTITLES
  }

  await dbReferencesManager.save()
  const imageBuffer = canvas.toBuffer()
  await cacheImage(imageBuffer, id)
  return imageBuffer
}

/**
 * @param {String} id
 * @param {String} text
 * @param {'delivered' | 'canceled'} type
 */
async function finishOrderImage (id, text, type) {
  const dbReferencesManager = await ImageReferencesModel.findOne({ _id: id }).exec()
  const heightLimit = dbReferencesManager.references.maxHeight.value
  const currentHeight = dbReferencesManager.references.height.value
  const subtitleY = dbReferencesManager.references.nextY.value

  const canvas = Canvas.createCanvas(2590, currentHeight)
  const ctx = canvas.getContext('2d')
  const cachedImage = await Canvas.loadImage(`${CACHE_DIRECTORY}${id}.png`)
  ctx.drawImage(cachedImage, 0, 0, canvas.width, canvas.height)
  const updateDate = moment().utcOffset(-3).format('- HH:mm DD/MM/YYYY')
  ctx.font = SUBTITLE_FONT
  const dateX = 10 + TEXT_X + ctx.measureText(text).width
  await checkHeight()

  if (type === 'delivered') {
    ctx.fillStyle = '#ACE96F'
  } else if (type === 'canceled') {
    ctx.fillStyle = '#E40000'
  } else {
    throw SyntaxError('Invalid type for method finishOrderImage in ImageManipulator')
  }

  ctx.fillText(text, TEXT_X, subtitleY)
  ctx.fillStyle = '#939393'
  ctx.fillText(updateDate, dateX, subtitleY)

  async function checkHeight () {
    if (subtitleY > heightLimit) {
      const year = new Date().getFullYear()
      const footer = await Canvas.loadImage(`${IMAGES_DIRECTORY}footer.png`)
      const expandBlock = await Canvas.loadImage(`${IMAGES_DIRECTORY}expand-block.png`)
      canvas.height += expandBlock.height - footer.height
      dbReferencesManager.references.maxHeight.value = canvas.height - footer.height - 100
      dbReferencesManager.references.height.value = canvas.height
      ctx.drawImage(cachedImage, 0, 0, cachedImage.width, cachedImage.height)
      ctx.drawImage(expandBlock, 0, cachedImage.height - footer.height)
      ctx.drawImage(footer, 0, canvas.height - footer.height)
      ctx.font = '40px "SquashCode Font Medium", "SquashCode Font Regular"'
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText(year, 525, ((canvas.height - footer.height) + 48) + BUGGY_DISTANCE)
    }
  }
  dbReferencesManager.references.nextY.value = subtitleY + DISTANCE_BETWEEN_SUBTITLES

  await dbReferencesManager.save()
  const imageBuffer = canvas.toBuffer()
  await cacheImage(imageBuffer, id, true)
  return imageBuffer
}

async function cacheImage (buffer, id, archive = false) {
  if (archive) {
    await unlink(`${CACHE_DIRECTORY}${id}.png`)
  }
  await writeFile(`${archive ? ARCHIVE_DIRECTORY : CACHE_DIRECTORY}${id}.png`, buffer)
}

async function getCachedImage (id, archived = false) {
  return await readFile(`${archived ? ARCHIVE_DIRECTORY : CACHE_DIRECTORY}${id}.png`)
}

module.exports = {
  createOrderImage,
  getCachedImage,
  updateOrderImage,
  finishOrderImage
}
