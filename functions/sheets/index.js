import SheetsController from './controllers/sheets.controller';

/**
 * eg. /sheets?id=12HIjX0GX83D8a8Cg0ApQ02K3jG46zyMl78XDd-W6NT0&tab=WA&range=A2:C3
 */
export default async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false; // eslint-disable-line no-param-reassign

  try {
    const queryParams = event.queryStringParameters;
    SheetsController.validate(queryParams);
    const data = await SheetsController.get(queryParams);

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: err.message }),
    };
  }
};
