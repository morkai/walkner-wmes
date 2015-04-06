// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/core/View',
  'app/core/util/onModelDeleted',
  'app/fte/templates/leaderEntry',
  '../util/fractions'
], function(
  _,
  View,
  onModelDeleted,
  leaderEntryTemplate,
  fractionsUtil
) {
  'use strict';

  return View.extend({

    template: leaderEntryTemplate,

    initialize: function()
    {
      this.scheduleModelReload = _.throttle(this.model.fetch.bind(this.model), 3000, true);
    },

    remoteTopics: function()
    {
      var topics = {};

      topics['fte.leader.updated.' + this.model.id] = 'onModelUpdated';
      topics['fte.leader.deleted'] = 'onModelDeleted';

      return topics;
    },

    serialize: function()
    {
      return _.extend(this.model.serializeWithTotals(), {
        editable: false,
        round: fractionsUtil.round
      });
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change', this.render);
    },

    onModelUpdated: function(message)
    {
      this.scheduleModelReload(message);
    },

    onModelDeleted: function(message)
    {
      onModelDeleted(this.broker, this.model, message);
    }

  });
});
