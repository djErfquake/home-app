const Express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const IP = process.env.IP || "127.0.0.1";
const PORT = process.env.PORT || 8080;

let app = Express();
let server = require('http').Server(app);

let socketio = require('./js/socketio.js')(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(Express.static('public'));

let mainPageRouter = require(path.join(__dirname, 'routes', 'mainPage.js'));
let userRouting = require(path.join(__dirname, 'routes', 'mainPage.js'));
app.use('/', mainPageRouter);
app.use('/user', userRouting);

// Set up a URL route
app.get("/heroku", function(req, res) {
 res.send("Heroku Demo!");
});

/*
server.listen(PORT, IP, () => {
  console.log(`Listening on ${IP}:${PORT}`);
});
*/

app.listen(PORT);
console.log(`Listening on ${IP}:${PORT}`);
