// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/core/views/DetailsView',
  '../dictionaries',
  'app/opinionSurveys/templates/details'
], function(
  _,
  DetailsView,
  dictionaries,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    events: _.extend({

    }, DetailsView.prototype.events),

    afterRender: function()
    {
      DetailsView.prototype.afterRender.call(this);
    }

  });
});
