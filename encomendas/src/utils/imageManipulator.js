const Canvas = require('canvas')
const moment = require('moment')
const { writeFile, readFile } = require('fs/promises')
const { join } = require('path')
const { ConfigModel } = require('../modules/database')

// Register Default Font
Canvas.registerFont(join(__dirname, '../fonts/', 'Montserrat-Medium.ttf'), { family: 'SquashCode Font Medium' })
Canvas.registerFont(join(__dirname, '../fonts/', 'Montserrat-Regular.ttf'), { family: 'SquashCode Font Regular' })
// Default Sizes
const elipseWH = 40

// Default Positions
const textX = 115
const elipseX = 60
const lineX = elipseX + ((elipseWH / 2) - 2)

async function createOrderImage (id) {
  const year = new Date().getFullYear()
  const canvas = Canvas.createCanvas(2590, 1682)
  const ctx = canvas.getContext('2d')
  // Elipse Image
  const elipse = await Canvas.loadImage(join(__dirname, '../images/', 'elipse.png'))
  // Line Image
  const line = await Canvas.loadImage(join(__dirname, '../images/', 'line.png'))
  // Background Image
  const background = await Canvas.loadImage(join(__dirname, '../images/', 'background.png'))

  // Draw Background Image
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

  // CopyRight Year
  ctx.font = 'Medium 40px "SquashCode Font Medium", "SquashCode Font Regular"'
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(year, 525, 1630)

  // Order ID
  ctx.font = 'Medium 36px "SquashCode Font Medium", "SquashCode Font Regular"'
  ctx.fillStyle = '#949494'
  ctx.fillText(`#${id}`, 426, 240)

  // Default Title Y position
  const titleY = 325
  const elipseY = titleY - 40
  const subtitleY = titleY + 60
  // Default Title
  ctx.fillStyle = '#D0D0D0'
  ctx.fillText('Primeira fase de desenvolvimento - Encomendar pedido', textX, titleY)

  // Draw Elipse and Line
  ctx.drawImage(elipse, elipseX, elipseY, elipseWH, elipseWH)
  ctx.drawImage(line, lineX, titleY, 4, 200)

  ctx.font = 'Medium 32px "SquashCode Font Medium", "SquashCode Font Regular"'
  const initialDate = moment().utcOffset(-3).format('- HH:mm DD/MM/YYYY')
  const initialSubtitle = 'Recebemos seu pedido'
  const dateX = 10 + textX + (ctx.measureText(initialSubtitle)).width
  // Draw Default Subtitle
  ctx.fillStyle = '#939393'
  ctx.fillText(initialSubtitle, textX, subtitleY)
  ctx.fillStyle = '#6F5D87'
  ctx.fillText(initialDate, dateX, subtitleY)

  const imageNextY = new ConfigModel({ _id: id })
  imageNextY.type = 'nextY'
  imageNextY.value = subtitleY + 50
  await imageNextY.save()

  return canvas.toBuffer()
}

async function updateOrderImage (id, flag, content) {
  // Pensar numa forma de referenciar o proximo local que ira ser escrito
  // Ideia: DB Config :)
}

async function cacheImage (buffer, id) {
  await writeFile(join(__dirname, '../images/', '/cache/', `${id}.png`), buffer)
    .catch(console.error)
}

async function getFromCache (id) {
  return await readFile(join(__dirname, '../images/', '/cache/', `${id}.png`))
}

module.exports = { createOrderImage, cacheImage, getFromCache, updateOrderImage }
