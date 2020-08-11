import express from 'express'

const router = express.Router()

router.get('/', (req, res) => {
  const redirectUrl = process.env.VC_URL || 'https://localhost:3000/login'
  res.render('qr', {
    url: redirectUrl,
  })
})

export default router
