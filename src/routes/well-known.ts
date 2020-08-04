import express from 'express'
import url from 'url'
import csrf from 'csurf'
import { hydraAdmin } from '../config/hydra'

const csrfProtection = csrf({ cookie: true })
const router = express.Router()
