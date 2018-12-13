import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';

const CREDENTIALS = './functions/sheets/lib/config/credentials.json';
const SECRET = './functions/sheets/lib/config/client_secret.json';

export default class GoogleSheets {
  getSheetData(params) {
    const self = this;

    return new Promise((resolve, reject) => {
      // load client secrets from a local file
      fs.readFile(SECRET, (fileErr, content) => {
        if (fileErr) {
          return reject(fileErr);
        }

        // authorize a client with credentials, then call the Google Sheets API.
        self._authorize(JSON.parse(content), (tokenErr, auth) => {
          if (tokenErr) {
            return reject(tokenErr);
          }

          self._getSheetData(auth, params, (sheetErr, res) => {
            if (sheetErr) {
              return reject(sheetErr);
            }

            resolve(res);
          });
        });
      });
    });
  }

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  _authorize(credentials, callback) {
    const self = this;
    const {
      client_secret, // eslint-disable-line camelcase
      client_id, // eslint-disable-line camelcase
      redirect_uris, // eslint-disable-line camelcase
    } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(CREDENTIALS, (err, token) => {
      if (err) {
        return self._getNewToken(oAuth2Client, callback);
      }

      oAuth2Client.setCredentials(JSON.parse(token));
      callback(null, oAuth2Client);
    });
  }

  /**
   * Get new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  _getNewToken(oAuth2Client, callback) { // eslint-disable-line class-methods-use-this
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();

      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          return callback(err);
        }

        oAuth2Client.setCredentials(token);

        // Store the token to disk for later program executions
        fs.writeFileSync(CREDENTIALS, JSON.stringify(token));

        callback(null, oAuth2Client);
      });
    });
  }

  _getSheetData(auth, params, callback) { // eslint-disable-line class-methods-use-this
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.values.get({
      spreadsheetId: params.id,
      range: `${params.tab}!${params.range}`,
    }, (err, response) => {
      if (err) {
        callback(err);
      }

      callback(null, response.data.values);
    });
  }
}
