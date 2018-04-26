// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/user',
  'app/data/divisions',
  'app/orgUnits/util/renderOrgUnitPath',
  'app/core/views/ListView',
  'app/core/util/html2pdf',
  'app/printers/views/PrinterPickerView',
  'app/hourlyPlans/templates/printableEntry'
], function(
  _,
  time,
  t,
  user,
  divisions,
  renderOrgUnitPath,
  ListView,
  html2pdf,
  PrinterPickerView,
  printableEntryTemplate
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    remoteTopics: {
      'hourlyPlans.created': 'refreshCollection',
      'hourlyPlans.deleted': 'onModelDeleted'
    },

    events: _.assign({

      'click .action-print': function(e)
      {
        var model = this.collection.get(this.$(e.currentTarget).closest('tr').attr('data-id'));

        e.listAction = {
          view: this,
          tag: 'hourlyPlans'
        };

        PrinterPickerView.listAction(e, function(printer)
        {
          model.fetch().done(function()
          {
            html2pdf(printableEntryTemplate(model.serializeToPrint()), printer);
          });
        });
      }

    }, ListView.prototype.events),

    serializeColumns: function()
    {
      return [
        {id: 'division', className: 'is-min', label: t('core', 'ORG_UNIT:division')},
        {id: 'date', className: 'is-min', label: t('hourlyPlans', 'property:date')},
        {id: 'shift', label: t('hourlyPlans', 'property:shift')}
      ];
    },

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [
          ListView.actions.viewDetails(model),
          {
            id: 'print',
            icon: 'print',
            label: t('core', 'LIST:ACTION:print')
          }
        ];

        if (model.isEditable(user))
        {
          actions.push(
            ListView.actions.edit(model),
            ListView.actions.delete(model)
          );
        }

        return actions;
      };
    },

    serializeRows: function()
    {
      return this.collection.map(function(model)
      {
        var division = divisions.get(model.get('division'));
        var row = model.toJSON();

        row.division = division ? renderOrgUnitPath(division, false, false) : '?';
        row.date = time.format(row.date, 'LL');
        row.shift = t('core', 'SHIFT:' + row.shift);

        return row;
      });
    }
  });
});
