import express from 'express';
import serverless from 'serverless-http';

import route from './routes/catalog.route';

const app = express();
require('../common/config')(app);

app.use('/catalog', route);

export default serverless(app);
