// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/views/ListView',
  'app/data/orgUnits',
  'app/orgUnits/util/renderOrgUnitPath'
], function(
  t,
  viewport,
  ListView,
  orgUnits,
  renderOrgUnitPath
) {
  'use strict';

  t = t.forDomain('isa');

  return ListView.extend({

    className: 'is-colored',

    remoteTopics: {
      'isaRequests.**': 'refreshCollection'
    },

    columns: [
      {id: 'line', label: t.bound('requests:line'), className: 'is-min'},
      {id: 'type', label: t.bound('requests:type'), className: 'is-min'},
      {id: 'status', label: t.bound('requests:status'), className: 'is-min'},
      {id: 'requestedAt', label: t.bound('requests:requestedAt'), className: 'is-min'},
      {id: 'requester', label: t.bound('requests:requester'), className: 'is-min'},
      {id: 'respondedAt', label: t.bound('requests:respondedAt'), className: 'is-min'},
      {id: 'responder', label: t.bound('requests:responder'), className: 'is-min'},
      {id: 'finishedAt', label: t.bound('requests:finishedAt'), className: 'is-min'},
      {id: 'finisher', label: t.bound('requests:finisher'), className: 'is-min'},
      {id: 'duration', label: t.bound('requests:duration')}
    ],

    serializeActions: function()
    {
      return null;
    },

    afterRender: function()
    {
      ListView.prototype.afterRender.call(this);

      var view = this;

      this.$('.list-item > td[data-id="line"]')
        .popover({
          container: this.el,
          trigger: 'hover',
          placement: 'auto right',
          html: true,
          content: function()
          {
            var path = renderOrgUnitPath(
              orgUnits.getByTypeAndId('prodLine', view.$(this).text().trim()),
              false,
              false
            );

            return path ? path.split(' \\ ').join('<br>\\ ') : '?';
          }
        });
    }

  });
});
