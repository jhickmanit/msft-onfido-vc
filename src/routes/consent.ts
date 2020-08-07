import express from 'express'
import url from 'url'
import csrf from 'csurf'
import { hydraAdmin } from '../config/hydra'
import { onfidoClient } from '../config/onfido'

const csrfProtection = csrf({ cookie: true })
const router = express.Router()

interface Claims {
  first_name: string
  last_name: string
  birthdate?: string
  issuing_country?: string
  nationality?: string
  document_type?: string
  document_number?: string
  onfido_verified: boolean
}

interface Properties {
  first_name: string
  last_name: string
  date_of_birth?: string
  issuing_country?: string
  nationality?: string
  document_type?: string
  document_numbers: Array<DocNumbers>
}

interface DocNumbers {
  value: string
  type: string
}

router.get('/', csrfProtection, (req, res, next) => {
  const query = url.parse(req.url, true).query

  const challenge = String(query.consent_challenge)

  if (!challenge) {
    next(new Error('Expected a consent challenge to be set but received none.'))
    return
  }

  hydraAdmin
    .getConsentRequest(challenge)
    .then(({ body }) => {
      if (body.skip) {
        //eslint-disable-next-line
      const claims = req!.session!.claims
        return hydraAdmin
          .acceptConsentRequest(challenge, {
            grantScope: body.requestedScope,
            grantAccessTokenAudience: body.requestedAccessTokenAudience,
            session: {
              idToken: claims,
            },
          })
          .then(({ body }) => {
            res.redirect(String(body.redirectTo))
          })
      }
      //eslint-disable-next-line
    const check = req!.session!.checkId
      let status = 'in_progress'
      let claims: Claims
      while (status === 'in_progress') {
        onfidoClient.check.find(check).then((response) => {
          if (response.status === 'complete') {
            claims.onfido_verified = response.result === 'clear' ? true : false
            response.reportIds.forEach((report) => {
              onfidoClient.report.find(report).then((details) => {
                if (details.name === 'document') {
                  const properties = <Properties>details.properties
                  claims.first_name = properties.first_name
                  claims.last_name = properties.last_name
                  claims.birthdate = properties.date_of_birth
                  claims.issuing_country = properties.issuing_country
                  claims.nationality = properties.nationality
                  claims.document_type = properties.document_type
                  claims.document_number = properties.document_numbers[0].value
                  status = 'complete'
                  //eslint-disable-next-line
                req!.session!.claims = claims
                  return
                }
              })
            })
          }
          return
        })
      }
      res.render('consent', {
        csrfToken: req.csrfToken(),
        challenge: challenge,
        requested_scope: body.requestedScope,
        user: body.subject,
        client: body.client,
      })
    })
    .catch(next)
})

router.post('/', csrfProtection, (req, res, next) => {
  const challenge = req.body.challenge

  if (req.body.submit === 'Deny access') {
    return hydraAdmin
      .rejectConsentRequest(challenge, {
        error: 'access_denied',
        errorDescription: 'The resource owner denied the request',
      })
      .then(({ body }) => {
        res.redirect(String(body.redirectTo))
      })
      .catch(next)
  }

  let grantScope = req.body.grant_scope
  if (!Array.isArray(grantScope)) {
    grantScope = [grantScope]
  }
  //eslint-disable-next-line
  const claims = req!.session!.claims
  const session = {
    idToken: {
      ...claims,
    },
  }

  hydraAdmin.getConsentRequest(challenge).then(({ body }) => {
    return hydraAdmin
      .acceptConsentRequest(challenge, {
        grantScope: grantScope,
        session: session,
        grantAccessTokenAudience: body.requestedAccessTokenAudience,
        remember: Boolean(req.body.remember),
        rememberFor: 0,
      })
      .then(({ body }) => {
        res.redirect(String(body.redirectTo))
      })
      .catch(next)
  })
})

export default router
