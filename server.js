// require express
var express = require("express");
// path module -- try to figure out where and why we use this
var path = require("path");
// create the express app
var app = express();
// static content
app.use(express.static(path.join(__dirname, "./static")));
// setting up ejs and our views folder
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
  res.render("index");
})

var server = app.listen(8000,function(){
  console.log("listening on port 8000");
})

var io = require('socket.io').listen(server);

var users = {}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


io.sockets.on('connection', function (socket){
  console.log("WE ARE USING SOCKETS!");
  console.log(socket.id);
  id = socket.id;
  var user =
    {
    totalMS: 0,
    shots: 0,
    average: 0,
    id: id,
    mx: 50,
    my: 50
  };

  users[id] = user;

  socket.on("user_shot", function (data){
    console.log('BUTTON WAS PRESSSED')
    users[socket.id].totalMS += data.delay;
    users[socket.id].shots += 1;
    console.log(users[socket.id].totalMS / users[socket.id].shots);
    io.emit('server_response', {response: "hi"});
    console.log(users);
  })

  socket.on("mouse_position", function(data){

    if (users[socket.id]){
      users[socket.id].mx = data.x;
      users[socket.id].my = data.y;
    }
  })

  socket.on('disconnect', function (){
    console.log("This should be a socket id");
    console.log(socket.id);
    user = users[socket.id];
    io.emit("quitter", user)
    delete users[socket.id];
  })

})

setInterval(function(){
  x = getRandomInt(20,800);
  y =  getRandomInt(20,800);
  io.emit("new_target", {x: x, y: y});
}, 10000);

setInterval(function(){
  io.emit("game_status", users);
}, 15);

setInterval(function(){
  io.emit("score_update", users);
}, 15);
