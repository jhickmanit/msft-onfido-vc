import { AdminApi, PublicApi } from '@oryd/hydra-client'

const hydraAdminUrl = process.env.HYDRA_ADMIN_URL || 'https://localhost:4445'
const hydraPublicUrl = process.env.HYDRA_PUBLIC_URL || 'https://localhost:4444'
const mockTLSTermination = process.env.MOCK_TLS_TERMINATION || true

const hydraAdmin = new AdminApi(hydraAdminUrl)
const hydraPublic = new PublicApi(hydraPublicUrl)
if (mockTLSTermination) {
  hydraAdmin.defaultHeaders['X-Forwarded-Proto'] = 'https'
  hydraPublic.defaultHeaders['X-Forwarded-Proto'] = 'https'
}

export { hydraAdmin, hydraPublic }
