import express from 'express';
import serverless from 'serverless-http';

import route from './routes/store.route';

const app = express();
require('../common/config')(app);

app.use('/store', route);

export default serverless(app);
