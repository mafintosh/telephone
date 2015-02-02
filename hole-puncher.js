#!/usr/bin/env node

var dgram = require('dgram')
var minimist = require('minimist')
var string2compact = require('string2compact')

var argv = minimist(process.argv)
var sock = dgram.createSocket('udp4')

if (argv.help) {
  console.log('Usage: walkie-talkie-hole-puncher [options]')
  console.log('')
  console.log('  --port, -p  [23232]')
  console.log()
  process.exit()
}

var pairs = {}
var timeouts = {}

sock.on('error', function (err) {
  console.log('error: %s', err.message)
})

sock.on('message', function (message, rinfo) {
  var channel = message.toString()

  var id = rinfo.address + ':' + rinfo.port

  console.log('remembering %s (%s) for a while', id, channel)

  if (!pairs[channel]) pairs[channel] = {}
  pairs[channel][id] = id

  var clear = function() {
    delete pairs[channel]
  }

  clearTimeout(timeouts[id])
  timeouts[id] = setTimeout(clear, 60 * 1000)

  var buf = string2compact(Object.keys(pairs[channel]))
  sock.send(buf, 0, buf.length, rinfo.port, rinfo.address)
})

sock.bind(argv.port || 23232, function() {
  console.log('hole puncher bound to %d', sock.address().port)
})
