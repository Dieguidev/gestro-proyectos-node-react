import { CorsOptions } from 'cors'
import { envs } from './envs'

export const corsConfig: CorsOptions = {
  origin: function (origin, callback) {
    const whiteList = [envs.FRONTEND_URL]

    if (whiteList.includes(origin ?? '') || !origin) {
      return callback(null, true)
    } else {
      return callback(new Error('Not allowed by CORS'))
    }
  }
}
