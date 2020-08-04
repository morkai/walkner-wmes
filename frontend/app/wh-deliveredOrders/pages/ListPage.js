// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/FilteredListPage',
  'app/core/util/bindLoadingMessage',
  'app/wh-lines/WhLineCollection',
  '../views/FilterView',
  '../views/ListView'
], function(
  FilteredListPage,
  bindLoadingMessage,
  WhLineCollection,
  FilterView,
  ListView
) {
  'use strict';

  return FilteredListPage.extend({

    baseBreadcrumb: '#wh/pickup/0d',

    pageClassName: 'page-max-flex',

    FilterView: FilterView,

    ListView: ListView,

    actions: function()
    {
      return [{
        label: this.t('PAGE_ACTION:redirReasons'),
        privileges: ['WH:MANAGE'],
        href: '#wh/redirReasons'
      }];
    },

    remoteTopics: function()
    {
      var topics = {};

      topics[this.lines.getTopicPrefix() + '.updated'] = 'onLineUpdated';

      return topics;
    },

    defineModels: function()
    {
      FilteredListPage.prototype.defineModels.apply(this, arguments);

      this.lines = bindLoadingMessage(new WhLineCollection(), this);
    },

    getFilterViewOptions: function()
    {
      return Object.assign(FilteredListPage.prototype.getFilterViewOptions.apply(this, arguments), {
        lines: this.lines
      });
    },

    load: function(when)
    {
      return when(
        this.lines.fetch({reset: true}),
        this.collection.fetch({reset: true})
      );
    },

    onLineUpdated: function(message)
    {
      this.lines.handleUpdate(message);
    }

  });
});
