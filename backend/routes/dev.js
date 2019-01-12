// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = (app, express) =>
{
  if (app.options.env !== 'development')
  {
    return;
  }

  express.get('/dev/restart', () => process.exit(10001)); // eslint-disable-line no-process-exit

  express.post('/dev/inspect', (req, res) =>
  {
    res.sendStatus(204);

    console.inspect({
      date: new Date(),
      headers: req.headers,
      body: req.body
    });
  });
};
