const moduleAlias = require('module-alias')
const path = require('path')

moduleAlias.addAliases({
  '@shared': path.join(__dirname, 'shared')
})

require('./api/src/index.js')
