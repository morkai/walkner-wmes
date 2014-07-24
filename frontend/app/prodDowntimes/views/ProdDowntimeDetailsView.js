// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/core/View',
  'app/prodDowntimes/templates/details'
], function(
  _,
  t,
  View,
  detailsTemplate
) {
  'use strict';

  return View.extend({

    template: detailsTemplate,

    remoteTopics: function()
    {
      var remoteTopics = {
        'prodDowntimes.finished.*': function(message)
        {
          if (this.model.id === message._id)
          {
            this.model.set('finishedAt', new Date(message.finishedAt));
          }
        },
        'prodDowntimes.corroborated.*': function(message)
        {
          if (this.model.id === message._id)
          {
            this.model.set(message);
          }
        }
      };

      remoteTopics['prodDowntimes.updated.' + this.model.id] = function(message)
      {
        this.model.set(message);
      };

      return remoteTopics;
    },

    initialize: function()
    {
      this.listenTo(this.model, 'change', _.after(2, this.render.bind(this)));
    },

    serialize: function()
    {
      return {
        model: this.model.serialize()
      };
    }

  });
});
