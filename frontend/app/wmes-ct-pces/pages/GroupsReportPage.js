// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/wmes-ct-lines/LineCollection',
  '../GroupsReport',
  '../views/groupsReport/FilterView',
  '../views/groupsReport/GroupView',
  'app/wmes-ct-pces/templates/groupsReport/page'
], function(
  _,
  t,
  View,
  bindLoadingMessage,
  LineCollection,
  Report,
  FilterView,
  GroupView,
  template
) {
  'use strict';

  return View.extend({

    pageClassName: 'page-max-flex',

    layoutName: 'page',

    template: template,

    breadcrumbs: function()
    {
      return [
        {href: '#ct', label: this.t('BREADCRUMBS:base')},
        this.t('BREADCRUMBS:reports:groups')
      ];
    },

    actions: function()
    {
      return [
        {
          label: this.t('PAGE_ACTION:orderGroups'),
          href: '#ct/orderGroups'
        }
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.model, this);
      this.lines = bindLoadingMessage(new LineCollection(null, {rqlQuery: 'select(_id)&limit(0)'}), this);

      this.setView('#-filter', new FilterView({
        model: this.model,
        lines: this.lines
      }));

      this.listenTo(this.model, 'filtered', this.onFiltered);

      this.listenToOnce(this, 'afterRender', function()
      {
        this.listenTo(this.model.groups, 'reset', function() { this.renderGroups(true); });
      });
    },

    load: function(when)
    {
      return when(
        this.lines.fetch({reset: true}),
        this.model.fetch()
      );
    },

    onFiltered: function()
    {
      this.promised(this.model.fetch());

      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl(),
        trigger: false,
        replace: true
      });
    },

    beforeRender: function()
    {
      this.renderGroups(false);
    },

    renderGroups: function(render)
    {
      var page = this;

      page.removeView('#-groups');

      page.model.groups.forEach(function(group)
      {
        var groupView = new GroupView({
          model: page.model,
          group: group
        });

        page.insertView('#-groups', groupView);

        if (render)
        {
          groupView.render();
        }
      });
    }

  });
});
