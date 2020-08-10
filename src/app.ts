import express, { NextFunction, Response, Request } from 'express'
import path from 'path'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import session from 'express-session'
import dotenv from 'dotenv'

import routes from './routes'
import login from './routes/login'
import consent from './routes/consent'
import discovery from './routes/discovery'
import wellKnown from './routes/well-known'

dotenv.config()

if (module.hot) {
  module.hot.accept()
  module.hot.dispose(() => console.log('Module disposed. '))
}

const cookieSecret = process.env.SESSION_SECRET || 'P^[9%$TQPQV8pqJE'
const app = express()

app.set('trust proxy', '1')
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'pug')

app.use(express.static('public'))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser(cookieSecret))

const memoryStore = new session.MemoryStore()
app.use(
  session({
    secret: cookieSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
    store: memoryStore,
  }),
)
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', routes)
app.use('/login', login)
app.use('/consent', consent)
app.use('/.well-known/openid-configuration', discovery)
app.use('/.well-known/jwks', wellKnown)

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
  console.log(err.stack)
  res.status(500).render('error', {
    message: err.message,
    error: {},
  })
})

const listenOn = Number(process.env.PORT || 3000)
app.listen(listenOn, () => {
  console.log(`Listening on http://localhost:${listenOn}`)
})
