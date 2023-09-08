const fs = require('fs')
const path = require('path')
const express = require('express')
const sizeOf = require('image-size')
const { AppError } = require('./errors')
const puppeteer = require('puppeteer-core')

const AppConstants = require('./constants')
const { AuthService, FileService } = require('./services')
const { ErrorHandler, FileUploadHandler } = require('./handlers')

const app = express()
app.use(express.json())

app.use((req, res, next) => {
  try {
    if (
      !AuthService.getInstance().isValidRequest(
        req.get(AppConstants.Headers.CodelibSecretKey)
      )
    ) {
      throw new AppError(
        401,
        "You don't have permission to perform this operation. Kindly contact your administrator for more details."
      )
    }

    next()
  } catch (err) {
    const { statusCode, ...others } =
      ErrorHandler.getInstance().processError(err)

    res.status(statusCode).send(others)
  }
})

app.post('/resize', async (req, res) => {
  try {
    await FileUploadHandler.getInstance(req, res, [
      {
        name: 'image',
        maxCount: 1
      }
    ]).handleFileUpload()

    const browserWSEndpoint = process.env[AppConstants.Env.BrowserWSEndpoint]

    const templateFilePath = path.join(
      __dirname,
      'templates',
      'ResizeTemplate.html'
    )

    if (!req.files.image) {
      throw new AppError(400, "'image' cannot be empty.")
    }

    const image = req.files.image[0]

    const { width, height } = req.body

    if (width) {
      if (!AppConstants.NumberRegex.test(width)) {
        throw new AppError(400, "'width' should be a number.")
      }
    } else {
      throw new AppError(400, "'width' cannot be empty.")
    }
    if (height) {
      if (!AppConstants.NumberRegex.test(height)) {
        throw new AppError(400, "'height' should be a number.")
      }
    } else {
      throw new AppError(400, "'height' cannot be empty.")
    }

    const fileService = new FileService()
    const localFilePath = fileService.createTempFilePath(Date.now() + '-' + image.originalname)

    // obtain the size of an image
    const dimensions = sizeOf(image.path)

    if (width > AppConstants.MaxImageWidth) {
      dimensions.width = AppConstants.MaxImageWidth
    } else {
      dimensions.width = width
    }
    if (height > AppConstants.MaxImageHeight) {
      dimensions.height = AppConstants.MaxImageHeight
    } else {
      dimensions.height = height
    }

    let template = fs.readFileSync(templateFilePath, 'utf8')

    const imageSrc = await fs.promises.readFile(image.path, 'base64')

    const templateData = {
      imageSrc,
      mountingDivID: AppConstants.MountingDivID,
      imageWidth: dimensions.width,
      imageHeight: dimensions.height
    }

    for (const [placeholder, value] of Object.entries(templateData)) {
      template = template.replace(new RegExp(placeholder, 'g'), value)
    }

    const browser = await puppeteer.connect({ browserWSEndpoint })
    const page = await browser.newPage()
    await page.setContent(template, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector(`#${AppConstants.MountingDivID}`)
    const element = await page.$(`#${AppConstants.MountingDivID}`)
    await element.screenshot({ path: localFilePath, type: 'png' })
    await page.close()

    res.status(200).download(localFilePath, image.originalname)
  } catch (err) {
    const { statusCode, ...others } =
      ErrorHandler.getInstance().processError(err)

    res.status(statusCode).send(others)
  }
})

app.post('/compress', async (req, res) => {
  try {
    await FileUploadHandler.getInstance(req, res, [
      {
        name: 'image',
        maxCount: 1
      }
    ]).handleFileUpload()

    const browserWSEndpoint = process.env[AppConstants.Env.BrowserWSEndpoint]

    const templateFilePath = path.join(
      __dirname,
      'templates',
      'CompressTemplate.html'
    )

    if (!req.files.image) {
      throw new AppError(400, "'image' cannot be empty.")
    }

    const image = req.files.image[0]
    const compressQuality = req.body.compress_quality

    if (compressQuality) {
      if (!AppConstants.NumberRegex.test(compressQuality)) {
        throw new AppError(400, "'compress_quality' should be a number.")
      } else {
        if (!(compressQuality > 0 && compressQuality <= 100)) {
          throw new AppError(
            400,
            "'compress_quality' should be in the range between 1 and 100."
          )
        }
      }
    } else {
      throw new AppError(400, "'compress_quality' cannot be empty.")
    }

    const fileService = new FileService()
    const localFilePath = fileService.createTempFilePath(Date.now() + '-' + image.originalname)

    // obtain the size of an image
    const dimensions = sizeOf(image.path)

    if (dimensions.width > AppConstants.MaxImageWidth) {
      dimensions.width = AppConstants.MaxImageWidth
    }
    if (dimensions.height > AppConstants.MaxImageHeight) {
      dimensions.height = AppConstants.MaxImageHeight
    }

    let template = fs.readFileSync(templateFilePath, 'utf8')

    const imageSrc = await fs.promises.readFile(image.path, 'base64')

    const templateData = {
      imageSrc,
      mountingDivID: AppConstants.MountingDivID,
      imageWidth: dimensions.width,
      imageHeight: dimensions.height,
      imageCompressQuality: compressQuality / 100
    }

    for (const [placeholder, value] of Object.entries(templateData)) {
      template = template.replace(new RegExp(placeholder, 'g'), value)
    }
    const browser = await puppeteer.connect({ browserWSEndpoint })
    const page = await browser.newPage()
    await page.setContent(template, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector(`#${AppConstants.MountingDivID}`)
    const element = await page.$(`#${AppConstants.MountingDivID}`)
    await element.screenshot({ path: localFilePath, type: 'png' })
    await page.close()

    res.status(200).download(localFilePath, image.originalname)
  } catch (err) {
    const { statusCode, ...others } =
      ErrorHandler.getInstance().processError(err)

    res.status(statusCode).send(others)
  }
})

app.all('*', function (_req, res) {
  res.status(404).send({
    status: 'failure',
    message: "We couldn't find the requested url."
  })
})

module.exports = app
