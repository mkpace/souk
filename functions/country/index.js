import express from 'express';
import serverless from 'serverless-http';

import route from './routes/country.route';

const app = express();
require('../common/config')(app);

app.use('/country', route);

export default serverless(app);
