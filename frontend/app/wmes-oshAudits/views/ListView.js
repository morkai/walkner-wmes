// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/views/ListView',
  'app/wmes-oshAudits/templates/detailsRow'
], function(
  _,
  t,
  ListView,
  detailsRowTemplate
) {
  'use strict';

  return ListView.extend({

    className: 'is-colored is-clickable',

    events: Object.assign({

      'click .oshAudits-list-expander': function(e)
      {
        var tdEl = e.currentTarget;

        if (tdEl.classList.contains('is-enabled'))
        {
          this.toggleDetails(tdEl.parentNode.dataset.id, tdEl.dataset.id);
        }

        return false;
      }

    }, ListView.prototype.events),

    serializeColumns: function()
    {
      const tdAttrs = row =>
      {
        return {
          className: 'oshAudits-list-expander ' + (row.anyNok ? 'is-enabled' : '')
        };
      };

      return [
        {id: 'rid', className: 'is-min is-number'},
        {id: 'status', className: 'is-min'},
        {id: 'date', className: 'is-min'},
        {id: 'auditor', className: 'is-min'},
        {id: 'section', className: 'is-min'},
        {id: 'categories', className: 'is-overflow w400', tdAttrs},
        {id: 'nok', tdAttrs}
      ];
    },

    toggleDetails: function(rowId, columnId)
    {
      var $rowToExpand = this.$(`.list-item[data-id="${rowId}"]`);
      var $expandedRow = this.$('.is-expanded');

      this.collapseDetails($expandedRow);

      if ($rowToExpand[0] !== $expandedRow[0] || $expandedRow.attr('data-expanded-column-id') !== columnId)
      {
        this.expandDetails($rowToExpand, columnId);
      }
    },

    collapseDetails: function($row)
    {
      $row.removeClass('is-expanded').next().remove();
    },

    expandDetails: function($rowToExpand, columnId)
    {
      var model = this.collection.get($rowToExpand.attr('data-id'));
      var property = 'results';
      var templateData = {
        columnId: columnId,
        model: {}
      };

      templateData.model[property] = model.serializeDetails()[property];

      var $detailsRow = this.renderPartial(detailsRowTemplate, templateData);

      $detailsRow.insertAfter($rowToExpand);
      $rowToExpand.addClass('is-expanded').attr('data-expanded-column-id', columnId);
    }

  });
});
