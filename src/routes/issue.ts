import express from 'express'
import {
  CryptoBuilder,
  LongFormDid,
  RequestorBuilder,
} from 'verifiablecredentials-verification-sdk-typescript'
import url from 'url'
import csrf from 'csurf'
import { memoryStore } from '../app'

const csrfProtection = csrf({ cookie: true })
const router = express.Router()

const credential =
  process.env.VC_CREDENTIAL ||
  'https://portableidentitycards.azure-api.net/v1.0/9c59be8b-bd18-45d9-b9d9-082bc07c094f/portableIdentities/contracts/Ninja%20Card'

const credentialType =
  process.env.VC_CREDENTIAL_TYPE || 'VerifiedCredentialNinja'

const did = ''
const signingKeyReference = 'sign'
const crypto = new CryptoBuilder(did, signingKeyReference).build()
;(async () => {
  const longForm = new LongFormDid(crypto)
  const longFormDid = await longForm.create(signingKeyReference)
  crypto.builder.did = longFormDid
})()

router.get('/issue-request', csrfProtection, async (req, res) => {
  const requestBuilder = new RequestorBuilder({
    crypto: crypto,
    attestation: {
      presentations: [
        //eslint-disable-next-line
        //@ts-ignore
        {
          credentialType: credentialType,
          contracts: [credential],
        },
      ],
    },
  }).allowIssuance()
  //eslint-disable-next-line
  req!.session!.issueRequest = await requestBuilder.build().create()
  const APP_URI = process.env.APP_URI || 'https://localhost:3000/login'
  const requestUri = encodeURIComponent(
    //eslint-disable-next-line
    `${APP_URI}/issue_request.jwt?id=${req!.session!.id}`,
  )
  const issueRequestReference = 'openid://vc/?request_uri=' + requestUri
  res.send(issueRequestReference)
})

router.get('/issue_request.jwt', async (req, res) => {
  const query = url.parse(req.url, true).query
  const id = String(query.id)
  memoryStore.get(id, (error, session) => {
    //eslint-disable-next-line
    res.send(session!.issueRequest.request)
  })
})

export default router
