import express from 'express'
import csrf from 'csurf'
import { hydraPublic } from '../config/hydra'

const csrfProtection = csrf({ cookie: true })
const router = express.Router()

router.get('/', csrfProtection, (req, res, next) => {
  hydraPublic
    .discoverOpenIDConfiguration()
    .then(({ body }) => {
      res.send(JSON.stringify(body, null, 2))
    })
    .catch(next)
})

export default router
