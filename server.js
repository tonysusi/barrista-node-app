/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
/*global require  */
/*global __dirname */


// server.js

// BASE SETUP
// ==============================================

var compression = require('compression');

var express = require('express');
var app = express();

var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var path = require('path');
var logger = require('morgan');
var router = express.Router();

var site  = require('./config').Config;

var ua = require('universal-analytics');
var visitor = ua('UA-63157626-1').debug();

console.log('site', site);

//var nodemailer = require("nodemailer");
//var email   = require("./node_modules/emailjs/email");

var rooms = {
		"cr1": {
            "name": "Changing Room 1",
            "short": "CR1",
            "link": "cr1"
		},
        "cr2": {
            "name": "Changing Room 2",
            "short": "CR2",
            "link": "cr2"
		},
        "cr3": {
            "name": "Changing Room 3",
            "short": "CR3",
            "link": "cr3"
		},
        "the-lounge": {
            "name": "The Lounge",
            "short": "Lounge",
            "link": "the-lounge"
		},
        "cr5": {
            "name": "Changing Room 5",
            "short": "CR5",
            "link": "cr5"
		},
        "cr6": {
            "name": "Changing Room 6",
            "short": "CR6",
            "link": "cr6"
		},
        "brick-main": {
            "name": "Brick Building Main Room",
            "short": "Brick Main",
            "link": "brick-main"
		},
        "brick-boardroom": {
            "name": "Brick Building Boardroom",
            "short": "Brick Boardroom",
            "link": "brick-boardroom"
		}
    };

var drinksArray = ['Flat White', 'Cappuccino', 'Latte', 'Long Black', 'Mocha', 'Tea', 'Water', 'Other'];
var milkArray = ['Black', 'White', 'Soy', 'Trim'];
var teaArray = ['English Breakfast', 'Earl Grey', 'Peppermint', 'Green', 'Fruity'];
var sugarArray = ['None', 'One', 'Two', 'Sachet'];


// compress all requests
app.use(compression());

/*
// JADE SETUP
// ==============================================

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
*/

// PUG SETUP
// ==============================================

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');



// SETUP NODEMAILER
// ==============================================

// create reusable transporter object using SMTP transport 
//var transport = nodemailer.createTransport("SMTP", {
//    service: "Gmail",
//    auth: {
//        user: 'tonysjunk@gmail.com',
//        pass: 'gmailrocks'
//    }
//});

/*
var transport = nodemailer.createTransport({
    host: "mail.orcon.net.nz", // hostname
    secureConnection: false, // use SSL
    port: 25, // port for secure SMTP
    auth: {
        user: "fhelg",
        pass: "uberwa1d"
    }
});
*/

//var transport = nodemailer.createTransport("SMTP", {
//    host: "mail.orcon.net.nz", // hostname
//    secureConnection: false, // use SSL
//    port: 25, // port for secure SMTP
//    auth: {
//        user: "fhelg",
//        pass: "uberwa1d"
//    }
//});
 

//var emailServer  = email.server.connect({
//   user:    "fhelg", 
//   password:"uberwa1d", 
//   host:    "mail.orcon.net.nz",
//   ssl:false,
//   port: 25
//});

/* sends back to correct room*/
function goToRoom(req, res) {
    var roomExists = false;
	var selectedRoom, roomLink;
  
	for (var room in rooms) {
		if (room === req.params.name) {
			roomExists = true;
			selectedRoom = rooms[room].name;
            roomLink = rooms[room].link;
		}
	}
	
	if (roomExists) {
        res.render('order', {title : selectedRoom, drinks : drinksArray, rooms: rooms, roomLink: roomLink, slug : 'order', site: site});
        visitor.pageview('/' + roomLink, 'http://' + site.appAddress + ':3003', 'Barrista - Coffee App - ' + selectedRoom).send();
	} else {
        res.render('room', { title : 'Room', rooms: rooms, roomLink: 'room', slug : 'room', site: site });
        visitor.pageview('/', 'http://' + site.appAddress + ':3003', 'Barrista - Coffee App').send();
	}

}

// ROUTES
// ==============================================
// we'll create our routes here
app.set('views', path.join(__dirname, 'views'));
app.use(logger('dev'));

app.use(router);
app.use(express.static(__dirname + '/common'));


// sample route with a route the way we're used to seeing it
router.get('/kitchen', function (req, res) {
//    visitor.pageview('/kitchen', 'http://' + site.appAddress + ':3003', 'FCB Coffee App - Kitchen').send();
    res.render('kitchen', { title : 'Kitchen', slug : 'kitchen', site: site, rooms: rooms });
});

// sample route with a route the way we're used to seeing it
router.get('/', function (req, res) {
    goToRoom(req, res);
});

// route with parameters (http://localhost:3003/room/:name)
router.get('/room/:name', function(req, res) {
  goToRoom(req, res);
});


//router.post('/room/:name', function(req, res) {
////  console.log('/room');
//  //console.log(req);
//  console.log('drinkOrder',req.query.drinkOrder);
//  goToRoom(req, res);
//});


router.get('/send', function(req, res) {
   
		var mailOptions={
      to : req.query.to,
      from : req.query.from,
			bcc: req.query.bcc,
      subject : req.query.subject,
      text : req.query.text,
      generateTextFromHTML: true,
      html : req.query.html
    };

    transport.sendMail(mailOptions, function(error, response) {
      if (error) {
        console.log(error);
        res.end("error");
      }else{
        console.log("Message sent: " + response);
        res.end("sent");
      }
    });
  

  
  // send the message and get a callback with an error or details of the message that was sent
//  emailServer.send({
//     text:    req.query.text, 
//     from:    req.query.from, 
//     to:      req.query.to,
//     cc:      "Coffee Dev <tony.susi@fcb.com>",
//     subject:  req.query.subject
//  }, function(err, message) { console.log(err || message); });
  
  
  
});


// apply the routes to our application
app.use('/', router);

app.get('*', function(req, res) {
	res.status(404).send('This page does not exist');
});


// GOOGLE ANALYTICS SETUP
// ==============================================



// START THE SERVER
// ==============================================
server.listen(3003);
console.log('Application Started on http://'+site.appAddress+':3003');


// SOCKET.IO SETUP
// ==============================================

io.sockets.on('connection',function(socket) {    
  console.log("connection made");
  
  //EMIT object to all
  io.emit('start', {rooms: rooms, drinks: drinksArray, tea: teaArray, milk: milkArray, sugar: sugarArray});
  
  socket.on('order', function(order) {
    io.emit('order', order);
    console.log('order', order);
  });

  socket.on('orderUp', function(data) {
    io.emit('orderUp', data);
    console.log('orderUp', data);
  });
  
	socket.on('analytics', function(data) {
// 		visitor.event(data.Category, data.Action, data.Label).send();
		console.log(data.Category, data.Action, data.Label);
  });


//  for (var room in rooms) {
//    var roomLink = rooms[room].link;
//    
////    console.log('SERVER: roomLink',roomLink);
//    
//    socket.on(roomLink, function(msg) {
//      io.emit(roomLink, msg);
//      console.log('roomLink',roomLink,'msg',msg);
//    });
//  }
  
});


