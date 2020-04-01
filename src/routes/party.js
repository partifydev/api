const { Router } = require('express')
const { Route } = require('..')
const randomize = require('randomatic')

module.exports = class PartyRoute extends Route {
  constructor (client) {
    super(client)
    this.name = 'party'
  }

  register (app) {
    const router = Router()

    router.get('/create', async (req, res) => {
      if (req.query.name && req.query.password && req.query.userId) {
        // name: req.query.name
        // password: req.query.password
        // owner: req.query.userId
        // id: random 6 digit number
        // active: true

        try {
          // let's attempt to generate a random 6 digit number
          const partyId = await this.generatePartyId()

          const party = new this.client.models.Party({
            id: partyId,
            name: req.query.name,
            password: req.query.password,
            owner: req.query.userId,
            active: true
          })

          await party.save()

          res.status(200).json({ ok: true, partyId, active: true })
        } catch (err) {
          res.status(500).json({ ok: false, error: err.toString() })
        }
      } else return res.status(400).json({ ok: false, error: 'Missing query parameters' })
    })

    app.use(this.path, router)
  }

  async generatePartyId () {
    const partyId = randomize('0', 6)

    await this.client.models.Party.findOne({ id: partyId, active: true }, (err, docs) => {
      if (err || docs) return this.generatePartyId()
    })

    return partyId
  }
}
