// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/views/ListView',
  'app/behaviorObsCards/templates/detailsRow'
], function(
  _,
  t,
  ListView,
  detailsRowTemplate
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    events: _.assign({

      'click .behaviorObsCards-list-expander': function(e)
      {
        var tdEl = e.currentTarget;

        if (tdEl.classList.contains('is-enabled'))
        {
          this.toggleDetails(tdEl.parentNode.dataset.id, tdEl.dataset.id);
        }

        return false;
      },

      'click .is-filter': function(e)
      {
        this.trigger('showFilter', e.currentTarget.dataset.columnId);
      }

    }, ListView.prototype.events),

    serializeColumns: function()
    {
      if (this.options.simple)
      {
        return [
          {id: 'rid', className: 'is-min is-number'},
          {id: 'date', className: 'is-min'},
          {id: 'section', className: 'is-min'},
          {id: 'line'}
        ];
      }

      var textDecorator = function(columnId, value)
      {
        return '<span class="behaviorObsCards-list-text">' + value + '</span>';
      };
      var textAttrs = function(row, column)
      {
        return {
          className: [
            'behaviorObsCards-list-expander',
            'is-' + (row[column.id] ? 'enabled' : 'disabled')
          ]
        };
      };

      return [
        {id: 'rid', className: 'is-min is-number', thClassName: 'is-filter'},
        {id: 'date', className: 'is-min', thClassName: 'is-filter'},
        {id: 'observer', className: 'is-min', thClassName: 'is-filter'},
        {id: 'section', className: 'is-min', thClassName: 'is-filter'},
        {id: 'line', className: 'is-min', thClassName: 'is-filter'},
        {id: 'position', className: 'is-min', tdDecorator: textDecorator},
        {id: 'observation', tdAttrs: textAttrs, tdDecorator: textDecorator},
        {id: 'risk', tdAttrs: textAttrs, tdDecorator: textDecorator},
        {id: 'hardBehavior', thClassName: 'is-filter', tdAttrs: textAttrs, tdDecorator: textDecorator},
        {id: 'hardCondition', thClassName: 'is-filter', tdAttrs: textAttrs, tdDecorator: textDecorator}
      ];
    },

    serializeActions: function()
    {
      var collection = this.collection;

      return this.options.simple ? null : function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model)];

        if (model.canEdit())
        {
          actions.push(ListView.actions.edit(model));
        }

        if (model.canDelete())
        {
          actions.push(ListView.actions.delete(model));
        }

        return actions;
      };
    },

    toggleDetails: function(rowId, columnId)
    {
      var $rowToExpand = this.$('.list-item[data-id="' + rowId + '"]');
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
      var property = columnId === 'observation'
        ? 'observations'
        : columnId === 'risk'
          ? 'risks'
          : 'difficulties';
      var templateData = {
        columnId: columnId,
        model: {}
      };

      templateData.model[property] = model.get(property);

      var $detailsRow = this.renderPartial(detailsRowTemplate, templateData);

      $detailsRow.insertAfter($rowToExpand);
      $rowToExpand.addClass('is-expanded').attr('data-expanded-column-id', columnId);
    }

  });
});
