// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/core/views/PrintableListView',
  'app/fte/templates/printableMasterEntryList',
  '../util/fractions'
], function(
  _,
  PrintableListView,
  printableMasterEntryListTemplate,
  fractionsUtil
) {
  'use strict';

  return PrintableListView.extend({

    template: printableMasterEntryListTemplate,

    serialize: function()
    {
      return _.extend(this.model.serializeWithTotals(), {
        round: fractionsUtil.round
      });
    },

    afterRender: function()
    {
      // Overrides the default behaviour...
    }

  });
});
