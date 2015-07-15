// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');

module.exports = function setupTwilioRequestModel(app, mongoose)
{
  var twilioRequestSchema = mongoose.Schema({
    _id: String,
    operation: String,
    options: {},
    status: String,
    createdAt: Date,
    updatedAt: Date
  }, {
    id: false
  });

  twilioRequestSchema.statics.updateStatus = function(id, newStatus, done)
  {
    this.update({_id: id}, {$set: {status: newStatus, updatedAt: new Date()}}, done || function() {});
  };

  /**
   * @param {TwimlResponse} res
   * @returns {TwimlResponse}
   */
  twilioRequestSchema.methods.buildTwiml = function(res)
  {
    if (this.operation === 'say')
    {
      addSayResponse(this.options, res);
    }

    return res;
  };

  mongoose.model('TwilioRequest', twilioRequestSchema);

  function addSayResponse(options, res)
  {
    res.say(options.message || 'Hello!', _.pick(options, ['voice', 'language', 'loop']));
  }
};
