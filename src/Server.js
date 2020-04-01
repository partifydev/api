const express = require('express')
const morgan = require('morgan')
// const path = require('path')

const { FileUtils, Route } = require('.')

module.exports = class Server {
  constructor () {
    this.app = null
    this.routes = []
    this.mongoose = require('mongoose')
    this.models = []
  }

  start () {
    const port = process.env.PORT
    if (!port) {
      console.error('Environment variable "PORT" wasn\'t defined.')
      process.exit(1)
    }

    this.app = express()

    this.app.use(express.json()) // Express's JSON parser
    this.app.use(morgan('dev'))
    this.app.set('port', port)
    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', 'https://spotiparty.live')
      next()
    })

    this.app.listen(port, () => {
      console.log(`Server is now listening on port "${port}". Initializing routes...`)
      return this.startRoutes()
    })
  }

  startRoutes (dirPath = 'src/routes') {
    let success = 0
    let failed = 0
    return FileUtils.requireDirectory(dirPath, (NewRoute) => {
      if (Object.getPrototypeOf(NewRoute) !== Route) return
      this.addRoute(new NewRoute(this)) ? success++ : failed++
    }, console.log.bind(this)).then(() => {
      if (failed === 0) {
        console.log(`All ${success} routes loaded without errors.`)
      } else {
        console.log(`${success} routes loaded, ${failed} failed.`)
      }

      console.log('Initializing database...')
      this.startDatabase()
    })
  }

  addRoute (route) {
    if (!(route instanceof Route)) {
      console.log(`${route} failed to load - Not a Route`)
      return false
    }

    route._register(this.app)
    this.routes.push(route)
    return true
  }

  startDatabase () {
    const databaseUri = process.env.DATABASE_URI

    if (!databaseUri) {
      console.error('Environment variable "DATABASE_URI" wasn\'t defined.')
      process.exit(1)
    }

    try {
      this.mongoose.connect(databaseUri, { useNewUrlParser: true, useUnifiedTopology: true })

      const db = this.mongoose.connection

      db.once('open', () => {
        console.log('Database connection established successfully.')

        const musicSchema = new this.mongoose.Schema({
          _id: String,
          name: String,
          explicit: Boolean,
          duration: Number,
          coverUrl: String
        })

        const partySchema = new this.mongoose.Schema({
          id: Number,
          name: String,
          password: { type: String, optional: true },
          users: [String],
          queue: [musicSchema],
          owner: String,
          active: Boolean
        })

        this.models.Party = this.mongoose.model('Party', partySchema)
        this.models.Music = this.mongoose.model('Music', musicSchema)
      })
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
}
