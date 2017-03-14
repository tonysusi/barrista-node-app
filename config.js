var dev = {
  appAddress : 'localhost',
  socketPort: '3003',
  socketHost : '127.0.0.1',
  env : global.process.env.NODE_ENV || 'dev'
};

var live = {
//  appAddress : 'coffee.fcb.com',
  appAddress : 'localhost',
  socketPort: '3003',
  socketHost : '127.0.0.1',
  env : global.process.env.NODE_ENV || 'live'
};

exports.Config = global.process.env.NODE_ENV === 'live' ? live : dev;