import { AdminApi } from '@oryd/hydra-client'

const hydraAdminUrl = process.env.HYDRA_ADMIN_URL || 'https://localhost:4445'
const mockTLSTermination = process.env.MOCK_TLS_TERMINATION || true
const hydraAdmin = new AdminApi(hydraAdminUrl)
if (mockTLSTermination) {
  hydraAdmin.defaultHeaders['X-Forwarded-Proto'] = 'https'
}

export { hydraAdmin }
