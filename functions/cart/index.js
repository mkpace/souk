import express from 'express';
import serverless from 'serverless-http';

import route from './routes/cart.route';

const app = express();
require('../common/config')(app);

app.use('/cart', route);

export default serverless(app);
