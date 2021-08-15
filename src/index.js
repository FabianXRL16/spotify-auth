require('dotenv').config()

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SCOPES = 'user-read-private user-read-email';
const PORT = 8080;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

const http = require("http");
const fs = require('fs')
const url = require('url');
const fetch = require('node-fetch');

const SPOTIFY_LOGIN_URL = 'https://accounts.spotify.com/authorize' +
'?response_type=code' +
'&client_id=' + CLIENT_ID +
'&scope=' + encodeURIComponent(SCOPES)  +
'&redirect_uri=' + encodeURIComponent(REDIRECT_URI)


const router = {
  '/': function(req, res) {
    fs.createReadStream('./src/views/index.html').pipe(res);

  },
  '/login': function(req, res) {
    res.writeHead(302, {
      location: SPOTIFY_LOGIN_URL,
    });
    res.end();

  },
  '/callback' : async function(req, res) {
    const query = url.parse(req.url,true).query
    const code = query.code || null;

    const responseText = await fetch(`https://accounts.spotify.com/api/token`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
      },
      body: `grant_type=authorization_code&code=${code}&redirect_uri=${REDIRECT_URI}`,
    });
    const response = await responseText.json()
    
    console.log('response',response);
    res.writeHead(302, {
      location: '/dashboard?'+'auth='+JSON.stringify(response),
    });
    res.end();
  },
  '/dashboard': async function(req, res) {
    fs.createReadStream('./src/views/dashboard.html').pipe(res);
  }
  
}

const server = http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/html charset=utf-8"});

  const path = request.url.split('?')[0];
  const route = router[path]

  if(!route) {
    response.writeHead(404, {"Content-Type": "text/html charset=utf-8"});
    response.write("<h1>No hay</h1>");
    response.end();
    return 
  }
  
  return route(request, response);
})


server.listen(PORT)
console.log('Escuando al '+ PORT);
