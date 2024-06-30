const http = require("http");
const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer({});
const servers = ["http://localhost:3001", "http://localhost:3002"];
let currentServer = 0;
const serverStatus = [true, true]; // Track server health

// Health check function
function checkServerHealth(index, url) {
  http
    .get(url, (res) => {
      serverStatus[index] = res.statusCode === 200;
    })
    .on("error", () => {
      serverStatus[index] = false;
    });
}

// Periodically check server health
setInterval(() => {
  servers.forEach((url, index) => checkServerHealth(index, url));
}, 5000);

const server = http.createServer((req, res) => {
  let tried = 0;

  // Find a healthy server
  while (!serverStatus[currentServer] && tried < servers.length) {
    currentServer = (currentServer + 1) % servers.length;
    tried++;
  }

  if (serverStatus[currentServer]) {
    proxy.web(req, res, { target: servers[currentServer] }, (err) => {
      res.writeHead(502, { "Content-Type": "text/plain" });
      res.end("Bad Gateway");
    });
    currentServer = (currentServer + 1) % servers.length;
  } else {
    res.writeHead(503, { "Content-Type": "text/plain" });
    res.end("Service Unavailable");
  }
});

server.listen(3000, () => {
  console.log("Load balancer running on port 3000");
});
