'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  STATUS_LIST_ENDPOINT:  "'http://localhost:7071/api/statusSiteStateReader'",
  STATUS_REMOVER_ENDPOINT: "'http://localhost:7071/api/statusSiteStateReader'",
  STATUS_REFRESH_ENDPOINT: "'http://localhost:7071/api/statusPoller_http'"

})
