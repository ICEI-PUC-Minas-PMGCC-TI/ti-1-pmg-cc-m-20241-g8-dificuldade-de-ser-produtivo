const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('./db/db.json');
const cors = require('cors');

const middlewares = jsonServer.defaults({ readOnly: false });

server.use(cors());
server.use(middlewares);
server.use(router);
server.listen(3000, () =>
{
    console.log('Running!');
});