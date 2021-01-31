# Lost-Shapes
The journey of two circles trying to fill the emptiness within.


# Setup
composer install
npm install
cp .env.example .env
// edit .env if needed // redis pw etc

//if you use nginx as webserver, you can proxy the websocket request through nginx.
//use this in your nginx config for this

# Requests for socket.io are passed on to Node on port
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

if you dont use the proxy then you need to edit the "resources/js/app.js" file at line 398 and 399.

socket = io.connect("ws://localhost:8040", { reconnect: true, transports: ['websocket'], forceNew: true });
//socket = io.connect({ reconnect: true, transports: ['websocket'], forceNew: true });

in the file "websocket/server.js" is the port 8040 in use. if you cant have the port open then change it to whatever works for you.
and edit file "resources/js/app.js" file at line 398

socket = io.connect("ws://localhost:NEWPORT", { reconnect: true, transports: ['websocket'], forceNew: true });

when you update "resources/js/app.js", you need to run "npm run prod" for the updates so go life.

// Websocket Start
node websocket/server.js

the websocket server needs to run if you want to play in multiplayer. Port 8040 if not changes needs to be free