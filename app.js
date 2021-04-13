const http = require("http");
const PORT = 8080;
const exp = require("express");
const mor = require("morgan");
// a function which handles requests and sends response
// const requestHandler = function (request, response) {
//     //   response.end(`Requested Path: ${request.url}\nRequest Method: ${request.method}`  );
//     if (request.url === "/") {
//     response.end("Welcome");
//     }
//     else if (request.url === "/urls") {
//         response.end("www.lighthouselabs.ca\nwww.google.com");
//       } else {
//         response.statusCode = 404;
//         response.end("404 Page Not Found");
//       }
// };
// const server = http.createServer(requestHandler);

const server = http.createServer((request, response) => {
    if (request.url === "/") {
      response.end("Welcome");
    } else if (request.url === "/urls") {
      response.end("www.lighthouselabs.ca\nwww.google.com");
    } else {
      response.statusCode = 404;
      response.end("404 Page Not Found");
    }
  });
  
server.listen(PORT, () => {
  console.log(`Server listening on: http://localhost:${PORT}`);
});

