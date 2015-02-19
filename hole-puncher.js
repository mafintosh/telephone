#!/usr/bin/env node

var dgram = require('dgram')
var minimist = require('minimist')
var string2compact = require('string2compact')

var argv = minimist(process.argv)
var sock = dgram.createSocket('udp4')

if (argv.help) {
  console.log('Usage: telephone-hole-puncher [options]')
  console.log('')
  console.log('  --port, -p  [23232]')
  console.log()
  process.exit()
}

var pairs = {}
var timeouts = {}

var PING = new Buffer([0])

sock.on('error', function (err) {
  console.log('error: %s', err.message)
})

sock.on('message', function (message, rinfo) {
  var id = rinfo.address + ':' + rinfo.port

  if (message.length === 1 && message[0] === 0) {
    Object.keys(pairs).some(function (ch) {
      var clear = function () {
        delete pairs[ch]
      }

      if (pairs[ch][id]) {
        clearTimeout(timeouts[ch])
        timeouts[ch] = setTimeout(clear, 10 * 1000)
        sock.send(PING, 0, PING.length, rinfo.port, rinfo.address)
        return true
      }
    })
    return
  }

  var channel = message.toString()

  console.log('remembering %s (%s) for a while', id, channel)

  if (!pairs[channel]) pairs[channel] = {}
  pairs[channel][id] = id

  var clear = function () {
    delete pairs[channel]
  }

  clearTimeout(timeouts[channel])
  timeouts[channel] = setTimeout(clear, 10 * 1000)

  var buf = string2compact(Object.keys(pairs[channel]).slice(0, 100))
  sock.send(buf, 0, buf.length, rinfo.port, rinfo.address)
})

sock.bind(argv.port || 23232, function () {
  console.log('hole puncher bound to %d', sock.address().port)
})
