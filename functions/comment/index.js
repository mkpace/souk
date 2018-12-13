import express from 'express';
import serverless from 'serverless-http';

import route from './routes/comment.route';

const app = express();
require('../common/config')(app);

app.use('/comment', route);

export default serverless(app);
