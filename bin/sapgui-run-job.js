'use strict';

const request = require('request');
const frontend = require('../config/production/wmes-frontend').sapGui;
const sapGui = require('../config/production/wmes-sapgui').sapGui;

const jobId = process.argv[2];
const job = sapGui.jobs.find(job => job.key === jobId || (!job.key && job.name === jobId));

request({
  method: 'POST',
  url: frontend.remoteUrl + 'sapGui/jobs;run',
  json: true,
  body: {
    job: {
      ...job,
      schedule: undefined,
      scriptTimeout: 60 * 60 * 1000,
      repeatOnFailure: 0,
      waitForResult: false
    },
    secretKey: frontend.secretKey
  }
}, (err, res, body) =>
{
  if (err)
  {
    return console.error(err.message);
  }

  console.log(res.statusCode);
  console.log(body);
});
