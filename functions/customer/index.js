import express from 'express';
import serverless from 'serverless-http';

import route from './routes/customer.route';

const app = express();
require('../common/config')(app);

app.use('/customer', route);

export default serverless(app);
