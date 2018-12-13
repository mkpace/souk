import AWS from 'aws-sdk';
import path from 'path';

/**
 * references
 * https://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/es-indexing.html
 * https://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/es-searching.html
 */
export default class ElasticController {
  constructor({
    region, // eg. us-west-2
    endpoint,
    index, // eg. customers
    doctype, // eg. customer
  }) {
    this.esDomain = {
      region,
      endpoint,
      index,
      doctype,
    };
    this.endpoint = new AWS.Endpoint(this.esDomain.endpoint);
    this.creds = new AWS.EnvironmentCredentials('AWS');
  }

  /**
   * Post the given document to Elasticsearch
   */
  static async postToES(doc) {
    const req = new AWS.HttpRequest(this.endpoint);

    // form request
    req.method = 'POST';
    req.path = path.join('/', this.esDomain.index, this.esDomain.doctype);
    req.region = this.esDomain.region;
    req.body = doc;
    req.headers['presigned-expires'] = false;
    req.headers.Host = this.endpoint.host;

    // Sign the request (Sigv4)
    const signer = new AWS.Signers.V4(req, 'es'); // es: service code
    signer.addAuthorization(this.creds, new Date());

    // Post document to ElasticSearch
    try {
      await new Promise((resolve, reject) => {
        const send = new AWS.NodeHttpClient();

        send.handleRequest(req, null, (httpResp) => {
          httpResp.on('end', () => {
            resolve();
          });
        }, (err) => {
          reject(err);
        });
      });
    } catch (err) {
      throw err;
    }
  }
}
