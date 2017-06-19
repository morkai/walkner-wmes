// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  'app/data/orgUnits',
  '../FteMasterEntry',
  '../views/FteMasterEntryDetailsView',
  './FteLeaderEntryDetailsPage'
], function(
  _,
  t,
  user,
  viewport,
  bindLoadingMessage,
  pageActions,
  View,
  orgUnits,
  FteMasterEntry,
  FteMasterEntryDetailsView,
  FteLeaderEntryDetailsPage
) {
  'use strict';

  return FteLeaderEntryDetailsPage.extend({

    modelType: 'fteMaster',

    pageId: 'fteMasterEntryDetails',

    breadcrumbs: [
      {
        label: t.bound('fte', 'BREADCRUMBS:master:browse'),
        href: '#fte/master'
      },
      t.bound('fte', 'BREADCRUMBS:details')
    ],

    createModel: function()
    {
      return new FteMasterEntry({_id: this.options.modelId});
    },

    createView: function()
    {
      return new FteMasterEntryDetailsView({model: this.model});
    }

  });
});
