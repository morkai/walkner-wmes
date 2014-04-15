// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/data/views/renderOrgUnitPath',
  'app/core/views/ListView',
  './decorateProdFlow'
], function(
  renderOrgUnitPath,
  ListView,
  decorateProdFlow
) {
  'use strict';

  return ListView.extend({

    columns: ['subdivision', 'mrpControllers', 'name'],

    serializeRows: function()
    {
      return this.collection.map(function(prodFlow)
      {
        return decorateProdFlow(prodFlow, true);
      });
    }

  });
});
