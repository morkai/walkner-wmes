// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/views/ListView',
  'app/data/orgUnits',
  'app/data/views/renderOrgUnitPath'
], function(
  t,
  viewport,
  ListView,
  orgUnits,
  renderOrgUnitPath
) {
  'use strict';

  return ListView.extend({

    className: 'is-colored',

    remoteTopics: {
      'isaEvents.saved': 'refreshCollection'
    },

    columns: [
      {id: 'line', className: 'is-min', label: t.bound('isa', 'events:line'), noData: ''},
      {id: 'time', className: 'is-min', label: t.bound('isa', 'events:time')},
      {id: 'user', className: 'is-min', label: t.bound('isa', 'events:user')},
      {id: 'action', label: t.bound('isa', 'events:action')}
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
