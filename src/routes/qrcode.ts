import express from 'express'

const router = express.Router()

router.get('/', (req, res) => {
  const redirectUrl = process.env.APP_URI || 'https://localhost:3000'
  res.render('qr', {
    url: redirectUrl + '/login',
  })
})

export default router
