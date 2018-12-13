import GoogleSheets from '../lib/google-sheets';

export default class SheetsController {
  /**
   * Validate query parameters
   */
  static validate(params) {
    if (!params.id) {
      throw new Error('Sheet id missing');
    }

    if (!params.tab) {
      throw new Error('Tab name missing');
    }

    if (!params.range) {
      throw new Error('Range missing');
    }

    return true;
  }

  /**
   * Get sheet data
   */
  static async get(params) {
    const gSheets = new GoogleSheets();

    try {
      const res = await gSheets.getSheetData(params);

      return res;
    } catch (err) {
      throw err;
    }
  }
}
