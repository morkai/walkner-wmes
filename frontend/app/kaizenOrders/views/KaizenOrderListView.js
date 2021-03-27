// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/views/ListView'
], function(
  t,
  ListView
) {
  'use strict';

  function tdAttrs(row, column)
  {
    return row.observer && row.observer.notify && row.observer.changes && row.observer.changes[column.id]
      ? {className: 'is-changed'}
      : {};
  }

  return ListView.extend({

    className: 'kaizenOrders-list is-clickable is-colored',

    serializeColumns: function()
    {
      var simple = !!this.options.simple;
      var columns = [
        {
          id: 'rid',
          className: 'is-min is-number'
        }
      ];

      if (window.KAIZEN_MULTI)
      {
        columns.push({
          id: 'types',
          className: 'is-min'
        });
      }

      columns.push(
        {
          id: 'status',
          tdAttrs: simple ? {} : tdAttrs,
          className: 'is-min'
        },
        {
          id: 'subject',
          className: simple ? 'has-popover' : 'is-overflow w250 has-popover',
          tdAttrs: tdAttrs,
          label: this.t('PROPERTY:subjectAndDescription')
        }
      );

      if (simple)
      {
        return columns;
      }

      columns.push(
        {id: 'eventDate', className: 'is-min', tdAttrs: tdAttrs},
        {id: 'area', className: 'is-overflow w200', tdAttrs: tdAttrs},
        {id: 'cause', className: 'is-overflow w225', tdAttrs: tdAttrs},
        {id: 'risk', className: 'is-min', tdAttrs: tdAttrs},
        {id: 'nearMissCategory', className: 'is-overflow w200', tdAttrs: tdAttrs}
      );

      if (window.KAIZEN_MULTI)
      {
        columns.push({
          id: 'suggestionCategory',
          className: 'is-overflow w200',
          tdAttrs: tdAttrs
        });
      }

      columns.push(
        {id: 'section', className: 'is-overflow w200', tdAttrs: tdAttrs},
        {id: 'confirmer', className: 'is-min', tdAttrs: tdAttrs},
        {id: 'owners', className: 'is-min has-popover', label: this.t('PROPERTY:nearMissOwners')},
        '-'
      );

      return columns;
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

    afterRender: function()
    {
      ListView.prototype.afterRender.call(this);

      var view = this;

      this.$el.popover({
        selector: '.has-popover',
        container: this.el,
        trigger: 'hover',
        placement: function(popoverEl, sourceEl)
        {
          return sourceEl.dataset.id === 'subject' ? 'auto right' : 'auto left';
        },
        html: true,
        content: function()
        {
          var model = view.collection.get(this.parentNode.dataset.id);

          if (this.dataset.id === 'subject')
          {
            return model.get('description');
          }

          if (this.dataset.id === 'owners')
          {
            return view.serializeOwnersPopoverContent(model);
          }

          return undefined;
        }
      });
    },

    serializeOwnersPopoverContent: function(kaizenOrder)
    {
      var owners = kaizenOrder.get('owners');

      if (owners.length <= 1)
      {
        return undefined;
      }

      var html = '<ul class="kaizenOrders-list-owners">';

      for (var i = 0; i < owners.length; ++i)
      {
        html += '<li>' + owners[i].rendered;
      }

      html += '</ul>';

      return html;
    }

  });
});
