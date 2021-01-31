# Lost-Shapes
The journey of two circles trying to fill the emptiness within.


# Setup
```
composer install
npm install
cp .env.example .env
// edit .env if needed // redis pw etc
```

iFf you use nginx as the webserver, you can proxy the websocket request through nginx. Use this in your nginx config:

```
location ~* socket\.io\/ {
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-NginX-Proxy true;
		proxy_pass http://localhost:8040;
		proxy_redirect off;
		proxy_http_version 1.1;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "upgrade";
}
```

If you dont use the proxy then you need to edit the "resources/js/app.js" file at lines 398 and 399.

```javascript
socket = io.connect("ws://localhost:8040", { reconnect: true, transports: ['websocket'], forceNew: true });
//socket = io.connect({ reconnect: true, transports: ['websocket'], forceNew: true });
```

In "websocket/server.js" the port 8040 is in use. If you can't have this port open then change it to whatever works for you and edit "resources/js/app.js" at line 398.

```javascript
socket = io.connect("ws://localhost:NEWPORT", { reconnect: true, transports: ['websocket'], forceNew: true });
```

When you update "resources/js/app.js", you need to run "npm run prod" for the updates to go live.

// Websocket Start
```
node websocket/server.js
```

The websocket server needs to run if you want to play in multiplayer. Port 8040 (or changed port) needs to be free.