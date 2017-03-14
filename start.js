  var forever = require('forever-monitor');

  var child = new (forever.Monitor)('server.js', {
    max: 99999,
    silent: true,
		minUptime: 1000,
		spinSleepTime: 1000,
    //
    // Log files and associated logging options for this instance
    //
//    'logFile': 'logs/log.txt', // Path to log output from forever process (when daemonized)
//    'outFile': 'logs/out.txt', // Path to log output from child stdout
//    'errFile': 'logs/err.txt', // Path to log output from child stderr
    args: []
    
  });

  child.on('exit', function () {
    console.log('server.js has exited after 3 restarts');
  });


child.on('watch:restart', function(info) {
    console.error('Restaring script because ' + info.file + ' changed');
});

child.on('restart', function() {
    console.error('Forever restarting script for ' + child.times + ' time');
});

child.on('exit:code', function(code) {
    console.error('Forever detected script exited with code ' + code);
});


child.start();
