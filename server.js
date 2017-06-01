var express = require('express'),
	app = express(),
	server, command, con,
	config = {},
	bodyParser = require('body-parser'),
	mysql = require('mysql');

config.host='127.0.0.1';
config.port= '3306';
config.user='anon';
config.password='passwordforanon';
config.database='mydb';
var connection = mysql.createConnection(config);

app.use(express.static(__dirname));

app.use(bodyParser.json());

app.post('/mysql', function(req, res){
	command = req.body.command
	console.dir (command);
	connection.query(command, function(error, result, fields){
		res.send(result);
		console.log(result);
	});
});

app.get('/admin', function(req, res){
	res.render('admin.pug');
});

app.get('/', function(req, res){
	res.render('index.pug');
});

server = app.listen(3000, function(){
	console.log('Listening on port 3000');
});