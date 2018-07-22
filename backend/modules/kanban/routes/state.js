// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fresh = require('fresh');

module.exports = function stateRoute(app, module, req, res, next)
{
  module.getState((err, state) =>
  {
    if (err)
    {
      return next(err);
    }

    const headers = {
      'content-type': 'application/json',
      'last-modified': state.updatedAt.toUTCString(),
      'etag': `"${state.updatedAt.getTime().toString(36)}"`,
      'cache-control': 'private, must-revalidate'
    };

    res.set(headers);

    if (fresh(req.headers, headers))
    {
      return res.sendStatus(304);
    }

    res.json(state.json);
  });
};
