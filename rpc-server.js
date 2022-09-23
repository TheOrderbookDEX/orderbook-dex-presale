require('ts-node').register({ compilerOptions: { module: 'commonjs' } });
require('./rpc-server.ts').startRPCServer();
