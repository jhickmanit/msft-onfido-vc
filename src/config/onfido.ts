import { Onfido, Region } from '@onfido/api'

const onfidoApiToken = process.env.ONFIDO_API_TOKEN || 'unknown'
const onfidoRegion = process.env.ONFIDO_REGION || 'EU'

const onfidoClient = new Onfido({
  apiToken: onfidoApiToken,
  region:
    onfidoRegion === 'EU'
      ? Region.EU
      : onfidoRegion === 'US'
      ? Region.US
      : onfidoRegion === 'CA'
      ? Region.CA
      : Region.EU,
})

export { onfidoClient }
