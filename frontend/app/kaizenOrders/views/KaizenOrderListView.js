// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/views/ListView'
], function(
  t,
  ListView
) {
  'use strict';

  function prepareTdAttrs(row)
  {
    /*jshint validthis:true*/

    return row.observer.notify && row.observer.changes && row.observer.changes[this.id] ? 'class="is-changed"' : '';
  }

  return ListView.extend({

    className: 'kaizenOrders-list is-clickable',

    serializeColumns: function()
    {
      var columns = [{id: 'rid', className: 'is-min is-number'}];

      if (window.KAIZEN_MULTI)
      {
        columns.push('types');
      }

      columns.push(
        {id: 'status', tdAttrs: prepareTdAttrs},
        {id: 'subject', tdAttrs: prepareTdAttrs, label: t('kaizenOrders', 'PROPERTY:subjectAndDescription')},
        {id: 'eventDate', tdAttrs: prepareTdAttrs},
        {id: 'area', tdAttrs: prepareTdAttrs},
        {id: 'cause', tdAttrs: prepareTdAttrs},
        {id: 'risk', tdAttrs: prepareTdAttrs},
        {id: 'nearMissCategory', tdAttrs: prepareTdAttrs}
      );

      if (window.KAIZEN_MULTI)
      {
        columns.push({id: 'suggestionCategory', tdAttrs: prepareTdAttrs});
      }

      columns.push(
        {id: 'section', tdAttrs: prepareTdAttrs},
        {id: 'confirmer', tdAttrs: prepareTdAttrs},
        {id: 'owners', label: t('kaizenOrders', 'PROPERTY:nearMissOwners')}
      );

      return columns;
    },

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
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
        selector: '.list-item > td',
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
