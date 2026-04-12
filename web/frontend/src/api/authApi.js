import { loginDemoUser, registerDemoUser } from '@/services/demoData'

export const authApi = {
  register(payload) {
    return registerDemoUser(payload)
  },
  login(payload) {
    return loginDemoUser(payload)
  },
}
