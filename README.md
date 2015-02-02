# telephone

Like that Lada Gaga song except it's p2p chat over udp.
I mainly implemented this to showcase udp hole punching

```
npm install -g telephone
```

## Usage

On two machines connected to the internet using a somewhat sane router configuration run

```
telephone --hole-puncher dev.mathiasbuus:23232 --channel my-channel
```

The above example uses the hole puncher running on my test digital ocean machine.
This machine is only used for the initial handshake. All other traffic is running completely p2p.

To run your own hole puncher run

```
telephone-hole-puncher
```

For more options run

```
telephone --help
telephone-hole-puncher --help
```

## License

MIT
