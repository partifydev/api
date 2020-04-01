const { Router } = require('express')
const { Route } = require('..')
const os = require('os')

module.exports = class MainRoute extends Route {
  constructor (client) {
    super(client)
    this.name = ''
  }

  register (app) {
    const router = Router()

    router.get('/', (req, res) => {
      res.redirect(process.env.FRONTEND_URL)
    })

    router.get('/test', (req, res) => {
      res.status(200).json({ ok: true, hostname: os.hostname() })
    })

    app.use(this.path, router)
  }
}
