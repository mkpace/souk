import express from 'express';
import serverless from 'serverless-http';

import route from './routes/email.route';

const app = express();
require('../common/config')(app);

app.use('/email', route);

export default serverless(app);
