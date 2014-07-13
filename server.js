#!/bin/env node
var express  = require('express');
var app      = express();
var engine   = require('ejs-locals');
var http     = require('http').Server(app);
var io       = require('socket.io')(http);
var users    = ['System'];

app.configure(function () {
    app.engine('ejs', engine);
    app.set('views', __dirname + '/web/views');
    app.set('view engine', 'ejs');
    app.use(express.static(__dirname + '/web/public'));
    app.use(app.router);
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true}));
});

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/chat', function (req, res) {
    res.redirect('/');
});

io.on('connection', function (socket) {
	socket.on('login', function (user) {
		if (users.indexOf(user) >= 0) {
			socket.emit('loginFailure');
		} else {
			socket.user = user;
			users.push(user);
			socket.emit('loginSuccess', user);
			io.emit('updateUsers', users);
			io.emit('newMessage', { user: 'System', message: 'User ' + user + ' has logged in' });
		}
	});

	socket.on('newMessage', function (message) {
		io.emit('newMessage', { user: socket.user, message: message });
	});

	socket.on('disconnect', function () {
		users.splice(users.indexOf(socket.user), 1);
		io.emit('updateUsers', users);
		io.emit('newMessage', { user: 'System', message: 'User ' + user + ' has logged out' });
	});
});

http.listen(3000, function () {
    console.log("Listening on port 3000");
});
