// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/core/View',
  'app/core/util/onModelDeleted',
  'app/hourlyPlans/templates/entry'
], function(
  _,
  View,
  onModelDeleted,
  entryTemplate
) {
  'use strict';

  return View.extend({

    template: entryTemplate,

    remoteTopics: function()
    {
      var topics = {};

      topics['hourlyPlans.updated.' + this.model.id] =
        this.model.handleUpdateMessage.bind(this.model);
      topics['hourlyPlans.deleted'] = this.onModelDeleted.bind(this);

      return topics;
    },

    serialize: function()
    {
      return _.extend(this.model.serialize(), {
        editable: false
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

    onModelDeleted: function(message)
    {
      onModelDeleted(this.broker, this.model, message);
    }

  });
});
