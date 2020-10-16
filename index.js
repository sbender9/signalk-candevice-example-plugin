const util = require('util')
const SimpleCan = require('@canboat/canboatjs').SimpleCan

module.exports = function(app) {
  var plugin = {}
  var unsubscribes = []

  plugin.id = "signalk-candevice-example-plugin"
  plugin.name = "Candevice Example"
  plugin.description = "Candevice Example"

  plugin.schema = function() {
    return {
      type: "object",
      properties: {
        candevice: {
          title: "Serial Port",
          type: "string",
          default: 'can0'
        }
      }
    }
  }

  plugin.start = function(options) {
    try {
      this.simpleCan = SimpleCan({
        canDevice: options.candevice,
        preferredAddress: 35,
        disableDefaultTransmitPGNs: true,
        transmitPGNs: []
        addressClaim: {
          "Unique Number": 139725,
          "Manufacturer Code": 'Fusion Electronics',
          "Device Function": 130,
          "Device Class": 'Entertainment',
          "Device Instance Lower": 0,
          "Device Instance Upper": 0,
          "System Instance": 0,
          "Industry Group": 'Marine'
        },
        productInfo: {
          "NMEA 2000 Version": 1300,
          "Product Code": 667,
          "Model ID": "MS-UD650",
          "Software Version Code": "1.0",
          "Model Version": "1.0",
          "Model Serial Code": "123456",
          "Certification Level": 0,
          "Load Equivalency": 1
        }
      })
      this.simpleCan.start()
      app.setPluginStatus(`Connected to ${options.candevice}`)


      app.on('N2KAnalyzerOut', (n2k) => {
        if ( n2k.pgn === 59904
             && n2k.dst === this.simpleCan.candevice.address
             && n2k.fields.PGN === 130580
           ) {
          this.simpleCan.sendPGN({
            pgn:130580,
            dst: n2k.src,
            'Power': 'Yes',
            'Default Setting': 0,
            'Tuner Regions': 1,
            'Max favorites':0
          })
        }
      })
    } catch ( err ) {
      app.error(err)
      app.setPluginError(err.message)
    }
  }

  plugin.stop = function() {
  }

  return plugin
}
