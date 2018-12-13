import express from 'express';
import bodyParser from 'body-parser';
import serverless from 'serverless-http';

import middleware from '../common/middleware';
import route from './routes/shipstation-hook.route';

require('body-parser-xml')(bodyParser);

const app = express();
app.use(bodyParser.xml({
  limit: '10mb',
  xmlParseOptions: {
    normalize: true,
    normalizeTags: true,
    explicitArray: false,
  },
}));
app.use(middleware);
app.use('/shipstation-hook', route);

export default serverless(app);
