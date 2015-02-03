#!/usr/bin/env node

var minimist = require('minimist')
var compact2string = require('compact2string')
var dgram = require('dgram')
var os = require('os')

var argv = minimist(process.argv.slice(2), {alias: {'hole-puncher': 'h', channel: 'c', name: 'n'}})
var me = argv.name || os.hostname()
var hp = argv.h || 'dev.mathiasbuus.eu:23232'
var channel = new Buffer(argv.channel || 'broadcast')

if (argv.help) {
  console.log('Usage: telephone [options]')
  console.log('')
  console.log('  --hole-puncher, -h  [%s]', hp)
  console.log('  --name, -n          [%s]', os.hostname())
  console.log('  --channel, -c       [%s]', channel.toString())
  console.log()
  process.exit()
}

var sock = dgram.createSocket('udp4')
var peers = []

var PING = new Buffer([0])

var ping = function() {
  sock.send(PING, 0, PING.length, hp.split(':')[1] || 23232, hp.split(':')[0])
}

sock.once('message', function (message, rinfo) {
  if (message.length === 1 && message[0] === 0) return // ping
  setInterval(ping, 5000)

  // quick'n'dirty - first message is from the hole puncher

  peers = compact2string.multi(message).slice(0, -1)

  console.log('found %d peer(s) in channel: %s', peers.length, channel.toString())
  console.log('write a message and press <enter> to send')

  process.stdin.emit('data', new Buffer('(connected)'))
  sock.on('message', function (message, rinfo) {
    if (message.length === 1 && message[0] === 0) return // ping
    if (peers.indexOf(rinfo.address + ':' + rinfo.port) === -1) peers.push(rinfo.address + ':' + rinfo.port)
    console.log('[%s:%d] %s', rinfo.address, rinfo.port, message.toString().trim())
  })
})

process.stdin.on('data', function (data) {
  data = Buffer.concat([new Buffer(me + ': '), data])
  peers.forEach(function (peer) {
    sock.send(data, 0, data.length, Number(peer.split(':')[1]), peer.split(':')[0])
  })
})

sock.send(channel, 0, channel.length, hp.split(':')[1] || 23232, hp.split(':')[0])
