/* eslint-disable no-var,quotes,no-unused-vars */
/* global ObjectId,db,print,printjson,load */

'use strict';

function log()
{
  for (let i = 0; i < arguments.length; ++i)
  {
    const arg = arguments[i];

    if (typeof arg === 'string')
    {
      print(arg);
    }
    else
    {
      printjson(arg);
    }
  }
}

var console = {
  log: log,
  error: log
};
