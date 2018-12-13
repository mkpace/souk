const CONVERGE_RESPONSE_CODES = [
  {
    message: 'APPROVAL',
    definition: 'Approved',
  },
  {
    message: 'APPROBAT',
    definition: 'Approved (French)',
  },
  {
    message: 'PARTIAL APPROVAL',
    definition: 'Approved for a Partial Amount',
  },
  {
    message: 'DECLINE CVV2',
    definition: 'Do not honor due to CVV2 mismatch\failure',
  },
  {
    message: 'PICK UP CARD',
    definition: 'Pick up card',
  },
  {
    message: 'AMOUNT ERROR',
    definition: 'Tran Amount Error',
  },
  {
    message: 'AMT OVER SVC LMT',
    definition: 'Amount is more than established service limit',
  },
  {
    message: 'APPL TYPE ERROR',
    definition: 'Call for Assistance',
  },
  {
    message: 'CANNOT CONVERT',
    definition: 'Check is ok, but cannot be converted. Do Not Honor',
  },
  {
    message: 'DECLINED',
    definition: 'Do Not Honor',
  },
  {
    message: 'DECLINED T4',
    definition: 'Do Not Honor. Failed negative check, unpaid items',
  },
  {
    message: 'DECLINED-HELP 9999',
    definition: 'System Error',
  },
  {
    message: 'DUP CHECK NBR',
    definition: 'Duplicate Check Number',
  },
  {
    message: 'EXPIRED CARD',
    definition: 'Expired Card',
  },
  {
    message: 'INCORRECT PIN',
    definition: 'Invalid PIN',
  },
  {
    message: 'INVALID CARD',
    definition: 'Invalid Card',
  },
  {
    message: 'INVALID CAVV',
    definition: 'Invalid Cardholder Authentication Verification Value',
  },
  {
    message: 'INVALID TERM ID',
    definition: 'Invalid Terminal ID',
  },
  {
    message: 'INVLD R/T NBR',
    definition: 'Invalid Routing/Transit Number',
  },
  {
    message: 'INVLD TERM ID 1',
    definition: 'Invalid Merchant Number',
  },
  {
    message: 'INVLD TERM ID 2',
    definition: 'Invalid SE Number (AMEX Only)',
  },
  {
    message: 'INVLD VOID DATA',
    definition: 'Invalid Data Submitted for Void Transaction',
  },
  {
    message: 'MAX MONTHLY VOL',
    definition: 'The maximum monthly volume has been reached',
  },
  {
    message: 'MICR ERROR',
    definition: 'MICR Read Error',
  },
  {
    message: 'MUST SETTLE MMDD',
    definition: 'Must settle, open batch is over 7 days old (Best Practice is to settle within 24 hours. Batch will be Auto Settled after 10 days)',
  },
  {
    message: 'NETWORK ERROR',
    definition: 'General System Error',
  },
  {
    message: 'PLEASE RETRY',
    definition: 'Please Retry/Reenter Transaction',
  },
  {
    message: 'RECORD NOT FOUND',
    definition: 'Record not on the network',
  },
  {
    message: 'REQ. EXCEEDS BAL.',
    definition: 'Req. exceeds balance',
  },
  {
    message: 'SEQ ERR PLS CALL',
    definition: 'Call for Assistance',
  },
  {
    message: 'SERV NOT ALLOWED',
    definition: 'Invalid request',
  },
  {
    message: 'TOO MANY CHECKS',
    definition: 'Too Many Checks (Over Limit)',
  },
  {
    message: 'CALL AUTH. CENTER',
    definition: 'Refer to Issuer',
  },
  {
    message: 'SUCCESS',
    definition: 'For successfully added, updated, deleted recurring or installment transactions',
  },
  {
    message: 'ERROR',
    definition: 'For recurring or installment transactions that failed to be added, deleted or updated',
  },
  {
    message: 'ALREADY ACTIVE',
    definition: 'Card already active',
  },
  {
    message: 'Message MAX REACHED',
    definition: 'Definition Cannot load the amount specified',
  },
  {
    message: 'NON RELOADABLE',
    definition: 'The card cannot be reloaded',
  },
  {
    message: 'TRAN NOT ALLOWED',
    definition: 'Transaction type not allowed',
  },
  {
    message: 'INVLD TRAN TYPE',
    definition: 'Transaction type not on server',
  },
  {
    message: 'CARD NOT ACTIVE',
    definition: 'The Gift Card is not activated',
  },
  {
    message: 'DUPLICATE TRAN',
    definition: 'Duplicate transaction',
  },
  {
    message: 'INVALID BATCH ID',
    definition: 'Batch ID is not on the server',
  },
  {
    message: 'INVALID TENDER',
    definition: 'Tender types is not on the server',
  },
];

module.exports = CONVERGE_RESPONSE_CODES;
