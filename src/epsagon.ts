import * as epsagon from 'epsagon'

epsagon.init({
  token: process.env.EPSAGON_TOKEN,
  appName: 'breakdown',
  metadataOnly: false,
})

export default epsagon
