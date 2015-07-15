// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var twilio = require('twilio');

module.exports = function setUpTwilioRoutes(app, twilioModule)
{
  var express = app[twilioModule.config.expressId];
  var mongoose = app[twilioModule.config.mongooseId];
  var TwilioRequest = mongoose.model('TwilioRequest');
  var TwilioResponse = mongoose.model('TwilioResponse');

  express.options('/twilio', function(req, res)
  {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
  });

  express.post('/twilio', function(req, res, next)
  {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    var body = req.body;

    if (!_.isObject(body)
      || !_.isFunction(twilioModule[body.operation])
      || !_.isObject(body.options))
    {
      return next(express.createHttpError('INVALID_INPUT'), 400);
    }

    if (twilioModule.config.secretKey !== null && body.secretKey !== twilioModule.config.secretKey)
    {
      return next(express.createHttpError('INVALID_SECRET_KEY', 401));
    }

    twilioModule[body.operation](body.options, function(err)
    {
      if (err)
      {
        twilioModule.error("Failed to [%s]: %s\n%s", body.operation, err.message, JSON.stringify(body.options));

        return next(err);
      }

      twilioModule.debug("Executed operation [%s]: %s", body.operation, JSON.stringify(body.options));

      res.sendStatus(204);
    });
  });

  express.get('/twilio/:id', function(req, res, next)
  {
    TwilioRequest.findById(req.params.id).exec(function(err, twilioRequest)
    {
      if (err)
      {
        return next(err);
      }

      if (!twilioRequest)
      {
        return next(express.createHttpError('NOT_FOUND', 400));
      }

      var twimlResponse = new twilio.TwimlResponse();

      twilioRequest.buildTwiml(twimlResponse);

      res.type('text/xml');
      res.send(twimlResponse.toString());

      TwilioRequest.updateStatus(twilioRequest._id, 'requested', function(err)
      {
        if (err)
        {
          twilioModule.error(
            "Failed to update a status of request [%s] to [requested]: %s", twilioRequest._id, err.message
          );
        }
      });
    });
  });

  express.post('/twilio/:id', twilio.webhook(twilioModule.config.authToken), function(req, res, next)
  {
    if (req.body.CallStatus)
    {
      TwilioRequest.updateStatus(req.params.id, req.body.CallStatus, function(err)
      {
        if (err)
        {
          twilioModule.error(
            "Failed to update a status of request [%s] to [%s]: %s", req.params.id, req.body.CallStatus, err.message
          );
        }
      });
    }

    var twilioResponse = new TwilioResponse({
      request: req.params.id,
      createdAt: new Date(),
      payload: req.body
    });

    twilioResponse.save(function(err)
    {
      if (err)
      {
        twilioModule.error("Failed to save a response to request [%s]: %s", req.params.id, err.message);
      }
    });
  });
};
