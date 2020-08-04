import express, { NextFunction, Response, Request } from 'express'
import path from 'path'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

import routes from './routes'

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', routes)

app.use((req, res, next) => {
  next(new Error('Not Found'))
})

if (app.get('env') === 'development') {
  app.use((err: Error, req: Request, res: Response) => {
    res.status(500)
    res.render('error', {
      message: err.message,
      error: err,
    })
  })
}

app.use((err: Error, req: Request, res: Response) => {
  res.status(500)
  res.render('error', {
    message: err.message,
    error: {},
  })
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).render('error', {
    message: JSON.stringify(err, null, 2),
  })
})

const listenOn = Number(process.env.PORT || 3000)
app.listen(listenOn, () => {
  console.log(`Listening on http://localhost:${listenOn}`)
})
