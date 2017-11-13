// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/views/ListView',
  'app/behaviorObsCards/templates/detailsRow'
], function(
  _,
  $,
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
      var textAttrs = function(row)
      {
        return 'class="behaviorObsCards-list-expander is-' + (row[this.id] ? 'enabled' : 'disabled') + '"';
      };

      return [
        {id: 'rid', className: 'is-min is-number'},
        {id: 'date', className: 'is-min'},
        {id: 'observer', className: 'is-min'},
        {id: 'section', className: 'is-min'},
        {id: 'line', className: 'is-min'},
        {id: 'position', className: 'is-min'},
        {id: 'observation', tdAttrs: textAttrs, tdDecorator: textDecorator},
        {id: 'risk', tdAttrs: textAttrs, tdDecorator: textDecorator},
        {id: 'hardBehavior', tdAttrs: textAttrs, tdDecorator: textDecorator},
        {id: 'hardCondition', tdAttrs: textAttrs, tdDecorator: textDecorator}
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
        idPrefix: this.idPrefix,
        columnId: columnId,
        model: {}
      };

      templateData.model[property] = model.get(property);

      var $detailsRow = $(detailsRowTemplate(templateData));

      $detailsRow.insertAfter($rowToExpand);
      $rowToExpand.addClass('is-expanded').attr('data-expanded-column-id', columnId);
    }

  });
});
