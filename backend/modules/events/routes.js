// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setUpEventRoutes(app, eventsModule)
{
  var express = app[eventsModule.config.expressId];
  var auth = app[eventsModule.config.userId].auth;
  var Event = app[eventsModule.config.mongooseId].model('Event');

  var canView = auth('EVENTS:VIEW');

  express.get('/events', canView, express.crud.browseRoute.bind(null, app, Event));

  express.get('/events/types', canView, fetchTypesRoute);

  /**
   * @private
   * @param {object} req
   * @param {object} res
   */
  function fetchTypesRoute(req, res)
  {
    var types = Object.keys(eventsModule.types);

    types.sort();

    res.send(types);
  }
};
