import express from 'express';
import serverless from 'serverless-http';

import route from './routes/shipping.route';

const app = express();
require('../common/config')(app);

app.use('/shipping', route);

export default serverless(app);
