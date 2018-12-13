import express from 'express';
import serverless from 'serverless-http';

import route from './routes/tax.route';

const app = express();
require('../common/config')(app);

app.use('/tax', route);

export default serverless(app);
