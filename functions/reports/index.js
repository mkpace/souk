import express from 'express';
import serverless from 'serverless-http';

import route from './routes/reports.route';

const app = express();
require('../common/config')(app);

app.use('/reports', route);

export default serverless(app);
