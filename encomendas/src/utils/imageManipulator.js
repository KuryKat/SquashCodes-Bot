const Canvas = require('canvas')
const moment = require('moment')
const { writeFile, readFile } = require('fs/promises')
const { join } = require('path')
const { ConfigModel } = require('../modules/database')
const { OrderHeaders } = require('./enums')

// TODO: FUNÇÃO PARA AUMENTAR TAMANHO DA IMAGEM CASO O TEXTO PASSE DO HEIGHT MÁXIMO
// Referenciar o height máximo na database
// **Inner shadow removido**

const headers = {
  MAKEORDER: 'Primeira fase de desenvolvimento - Encomendar pedido',
  DEVELOPMENT: 'Segunda fase de desenvolvimento - Desenvolver pedido',
  DELIVER: 'Terceira fase de desenvolvimento - Entregar pedido',
  FINISH: 'Entregamos seu pedido, a Squash Codes agradece',
  OTHER: 'Outros'
}

const imagesDirectory = join(__dirname, '../images/')
const cacheDirectory = join(imagesDirectory, '/cache/')
const fontsDirectory = join(__dirname, '../fonts/')

// Register Default Font
Canvas.registerFont(`${fontsDirectory}Montserrat-Medium.ttf`, { family: 'SquashCode Font Medium' })
Canvas.registerFont(`${fontsDirectory}Montserrat-Regular.ttf`, { family: 'SquashCode Font Regular' })

// Default font strings
const titleFont = '36px "SquashCode Font Medium", "SquashCode Font Regular"'
const subTitleFont = '32px "SquashCode Font Medium", "SquashCode Font Regular"'

// Default distance from texts
const subtitleDistance = 60
const newHeaderDistance = 30
const distanceBetweenSubtitles = 50
const buggyDistance = 35

// Default Positions
const textX = 115
const elipseX = textX - 55
const lineX = elipseX + ((40 / 2) - 2)

async function createOrderImage (id) {
  const year = new Date().getFullYear()
  const canvas = Canvas.createCanvas(2590, 1682)
  const ctx = canvas.getContext('2d')
  // Elipse Image
  const elipse = await Canvas.loadImage(`${imagesDirectory}elipse.png`)
  // Line Image
  const line = await Canvas.loadImage(`${imagesDirectory}line.png`)
  // Background Image
  const background = await Canvas.loadImage(`${imagesDirectory}background.png`)
  // Footer Image
  const footer = await Canvas.loadImage(`${imagesDirectory}footer.png`)
  // Draw Background Image
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
  // Draw Footer Image
  ctx.drawImage(footer, 0, background.height - footer.height)

  // CopyRight Year
  ctx.font = '40px "SquashCode Font Medium", "SquashCode Font Regular"'
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(year, 525, 1590 + buggyDistance)

  // Order ID
  ctx.font = titleFont
  ctx.fillStyle = '#949494'
  ctx.fillText(`#${id}`, 425, 200 + buggyDistance)

  // Default Title Y position
  const titleY = 285 + buggyDistance
  const elipseY = titleY - buggyDistance
  const lineY = titleY + 5
  const subtitleY = titleY + subtitleDistance
  // Default Title
  ctx.fillStyle = '#D0D0D0'
  ctx.fillText(headers.MAKEORDER, textX, titleY)

  // Draw Elipse and Line
  ctx.drawImage(elipse, elipseX, elipseY)
  ctx.drawImage(line, lineX, lineY)

  ctx.font = subTitleFont
  const initialDate = moment().utcOffset(-3).format('- HH:mm DD/MM/YYYY')
  const initialSubtitle = 'Recebemos seu pedido'
  const dateX = 10 + textX + (ctx.measureText(initialSubtitle)).width
  // Draw Default Subtitle
  ctx.fillStyle = '#939393'
  ctx.fillText(initialSubtitle, textX, subtitleY)
  ctx.fillStyle = '#6F5D87'
  ctx.fillText(initialDate, dateX, subtitleY)

  // TODO: Verificar se isso é suficiente para referenciar o Header inicial da imagem
  const imageheader = new ConfigModel({ _id: id })
  imageheader.type = 'header'
  imageheader.value = OrderHeaders.MAKEORDER

  const lineLimit = new ConfigModel({ _id: id })
  lineLimit.type = 'lineLimit'
  lineLimit.value = lineY + 200

  const imageNextY = new ConfigModel({ _id: id })
  imageNextY.type = 'nextY'
  imageNextY.value = subtitleY + distanceBetweenSubtitles
  await imageNextY.save()

  const imageBuffer = canvas.toBuffer()
  await cacheImage(imageBuffer, id)
  return imageBuffer
}

/**
 * Função única para gerenciar e manipular as alterações na imagem de changelog e retornar o Buffer delas
 * @param {String} id
 * @param {Number} header
 * @param {String} content
 * @returns {Buffer}
 */
async function updateOrderImage (id, header, content) {
  const canvas = Canvas.createCanvas(2590, 1682)
  const ctx = canvas.getContext('2d')
  // Elipse Image
  const elipse = await Canvas.loadImage(`${imagesDirectory}elipse.png`)
  // Line Image
  const line = await Canvas.loadImage(`${imagesDirectory}line.png`)
  // Cached image
  const cachedImage = await Canvas.loadImage(`${cacheDirectory}${id}.png`)
  ctx.drawImage(cachedImage, 0, 0, canvas.width, canvas.height)

  // Import config values
  const nextY = await ConfigModel.findOne({ _id: id, type: 'nextY' })
  const subtitleY = nextY.value

  const lineLimit = await ConfigModel.findOne({ _id: id, type: 'lineLimit' })
  const lineLimitY = lineLimit.value

  const dbHeader = await ConfigModel.findOne({ _id: id, type: 'header' })
  const currentHeader = dbHeader.value

  // Default needed info
  const updateDate = moment().utcOffset(-3).format('- HH:mm DD/MM/YYYY')
  const dateX = 10 + textX + (ctx.measureText(content)).width
  const titleY = subtitleY + newHeaderDistance
  const lineY = titleY + 5
  const elipseY = titleY - buggyDistance

  if (currentHeader === header) {
    await writeSubtitle(content, subtitleY)
  } else {
    ctx.font = titleFont
    if (header === OrderHeaders.DEVELOPMENT) {
      await updateHeader('DEVELOPMENT')
    } else if (header === OrderHeaders.DELIVER) {
      await updateHeader('DELIVER')
    } else if (header === OrderHeaders.FINISH) {
      ctx.font = subTitleFont
      ctx.fillStyle = '#ACE96F'
      ctx.fillText(headers.finish, textX, subtitleY)
      ctx.fillStyle = '#939393'
      ctx.fillText(updateDate, dateX, subtitleY)
    } else if (header === OrderHeaders.OTHER) {
      await updateHeader('OTHER')
    } else {
      throw new SyntaxError(`Invalid Header: ${header} is a invalid enum for OrderHeaders`)
    }
  }

  async function updateHeader (newHeader) {
    ctx.fillStyle = '#D0D0D0'
    ctx.fillText(headers[newHeader], textX, titleY)
    await drawLinesAndElipses()
    const newSubtitleY = titleY + subtitleDistance
    await writeSubtitle(content, newSubtitleY)
    dbHeader.value = OrderHeaders[newHeader]
    await dbHeader.save()
  }

  async function drawLinesAndElipses () {
    if (lineY < lineLimitY) {
      ctx.drawImage(elipse, elipseX, elipseY)
      ctx.drawImage(line, lineX, lineY)
      lineLimit.value = lineY + 200
      await lineLimit.save()
    } else {
      const fillUpLineY = lineY - (lineY - lineLimitY)
      ctx.drawImage(line, lineX, fillUpLineY)
      ctx.drawImage(elipse, elipseX, elipseY)
      lineLimit.value = fillUpLineY + 200
      await lineLimit.save()
    }
  }

  async function writeSubtitle (text, subY) {
    ctx.font = subTitleFont
    ctx.fillStyle = '#939393'
    ctx.fillText(text, textX, subY)
    ctx.fillStyle = '#6F5D87'
    ctx.fillText(updateDate, dateX, subY)
    nextY.value = subY + distanceBetweenSubtitles
    await nextY.save()
  }

  const imageBuffer = canvas.toBuffer()
  await cacheImage(imageBuffer, id)
  return imageBuffer
}

async function cacheImage (buffer, id) {
  await writeFile(`${cacheDirectory}${id}.png`, buffer)
    .catch(console.error)
}

async function getFromCache (id) {
  return await readFile(`${cacheDirectory}${id}.png`)
}

module.exports = { createOrderImage, getFromCache, updateOrderImage }
