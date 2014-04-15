// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/views/ListView',
  './decorateUser'
], function(
  t,
  ListView,
  decorateUser
) {
  'use strict';

  return ListView.extend({

    localTopics: {
      'companies.synced': 'render'
    },

    columns: ['personellId', 'lastName', 'firstName', 'company', 'orgUnit', 'prodFunction'],

    serializeRows: function()
    {
      return this.collection.toJSON().map(decorateUser);
    }

  });
});
