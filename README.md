# Game On! Node.js Room

This project contains a Game On! room implemented in Node.js

## Docker

### Building

```
docker build -t gameon-room-nodejs
```

### Interactive Run

```
docker run -it -p 3000:3000 --env-file=./dockerrc --name gameon-room-nodejs gameon-room-nodejs bash
```

### Daemon Run

```
docker run -d -p 3:9443 --env-file=./dockerrc --name gameon-room-nodejs gameon-room-nodejs
```

### Stop

```
docker stop gameon-room-nodejs ; docker rm gameon-room-nodejs
```

### Restart Daemon

```
docker stop gameon-room-nodejs ; docker rm gameon-room-nodejs; docker run -d -p 5000:3000 --env-file=./dockerrc --name gameon-room-nodejs gameon-room-nodejs
```


