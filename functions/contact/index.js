import express from 'express';
import serverless from 'serverless-http';

import route from './routes/contact.route';

const app = express();
require('../common/config')(app);

app.use('/contact', route);

export default serverless(app);
