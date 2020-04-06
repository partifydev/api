const { Router } = require('express')
const { URLSearchParams } = require('url')

const fetch = require('node-fetch')
const { Route } = require('..')

module.exports = class AuthRoute extends Route {
  constructor (client) {
    super(client)
    this.name = 'auth'
  }

  register (app) {
    const router = Router()

    router.get('/callback', (req, res) => {
      if (req.body.error) res.status(500).json({ ok: false, error: req.body.error })

      if (req.params.code) {
        const params = new URLSearchParams()

        params.append('grant_type', 'authorization_code')
        params.append('code', req.params.code)
        params.append('redirect_uri', `${process.env.APP_REDIRECT_URL}`)

        fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          body: params,
          headers: {
            Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
          }
        }).then((res) => res.json())
          .then((json) => {
            if (json.error) return res.status(500).json(json)
            else return res.status(200).json(json)
          }).catch((error) => console.error(error))
      }
    })

    router.get('/refresh', (req, res) => {
      if (req.body.error) res.status(500).json({ ok: false, error: req.body.error })

      if (req.params.refresh_token) {
        const params = new URLSearchParams()

        params.append('grant_type', 'refresh_token')
        params.append('refresh_token', req.params.refresh_token)

        fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          body: params,
          headers: {
            Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
          }
        }).then((res) => res.json())
          .then((json) => {
            if (json.error) return res.status(500).json(json)
            else return res.status(200).json(json)
          }).catch((error) => console.error(error))
      }
    })

    app.use(this.path, router)
  }
}
