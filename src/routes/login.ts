import express from 'express'
import url from 'url'
import csrf from 'csurf'
import { hydraAdmin } from '../config/hydra'
import { onfidoClient } from '../config/onfido'

const csrfProtection = csrf({ cookie: true })
const router = express.Router()

router.get('/', csrfProtection, (req, res, next) => {
  const query = url.parse(req.url, true).query
  const challenge = String(query.login_challenge)
  if (!challenge) {
    next(new Error('Expected a login challenge to be set but received none.'))
    return
  }

  hydraAdmin
    .getLoginRequest(challenge)
    .then(({ body }) => {
      if (body.skip) {
        return hydraAdmin
          .acceptLoginRequest(challenge, { subject: String(body.subject) })
          .then(({ body }) => {
            res.redirect(String(body.redirectTo))
          })
      }
      onfidoClient.applicant
        .create({
          firstName: 'anon',
          lastName: 'anon',
          email: 'anon@onfido.com',
        })
        .then((applicant) => {
          //eslint-disable-next-line
          req!.session!.applicantId = applicant.id
          onfidoClient.sdkToken
            .generate({
              applicantId: applicant.id,
              referrer: '*://*/*',
            })
            .then((token) => {
              res.render('login', {
                csrfToken: req.csrfToken(),
                challenge: challenge,
                token,
              })
            })
            .catch(next)
        })
        .catch(next)
    })
    .catch(next)
})

router.get('/create', csrfProtection, (req, res, next) => {
  //eslint-disable-next-line
  const applicantId = req!.session!.applicantId

  onfidoClient.check
    .create({
      applicantId,
      reportNames: ['document', 'facial_similarity_photo'],
    })
    .then((check) => {
      //eslint-disable-next-line
      req!.session!.checkId = check.id
      res.json({ check: check.id, status: check.status })
      return
    })
    .catch(next)
})

router.get('/status', csrfProtection, (req, res, next) => {
  //eslint-disable-next-line
  const checkId = req!.session!.checkId

  onfidoClient.check
    .find(checkId)
    .then((result) => {
      res.json({ check: result.id, status: result.status })
      return
    })
    .catch(next)
})

router.post('/', csrfProtection, (req, res, next) => {
  const challenge = req.body.challenge

  if (req.body.submit === 'Deny access') {
    return hydraAdmin
      .rejectLoginRequest(challenge, {
        error: 'access_denied',
        errorDescription: 'The resource owner denied the request',
      })
      .then(({ body }) => {
        res.redirect(String(body.redirectTo))
      })
      .catch(next)
  }

  if (!req.body.onfidoComplete) {
    res.render('login', {
      csrfToken: req.csrfToken(),
      challenge: challenge,
      error: 'You must complete the Identity Verification flow to continue.',
    })
    return
  }

  hydraAdmin
    .acceptLoginRequest(challenge, {
      subject: req.body.applicantId,
      remember: true,
      rememberFor: 0,
      acr: '1',
    })
    .then(({ body }) => {
      res.redirect(String(body.redirectTo))
    })
    .catch(next)
})

export default router
