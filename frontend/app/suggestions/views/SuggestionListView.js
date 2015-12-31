// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/views/ListView'
], function(
  _,
  t,
  ListView
) {
  'use strict';

  function prepareTdAttrs(row, className)
  {
    /*jshint validthis:true*/

    var classNames = '';

    if (className)
    {
      classNames += ' ' + className;
    }

    if (row.observer && row.observer.notify && row.observer.changes && row.observer.changes[this.id])
    {
      classNames += ' is-changed';
    }

    return 'class="' + classNames + '"';
  }

  return ListView.extend({

    className: 'suggestions-list is-clickable',

    serializeColumns: function()
    {
      var simple = this.options.simple;
      var columns = [
        {
          id: 'rid',
          className: 'is-min is-number'
        },
        {
          id: 'status',
          tdAttrs: simple ? '' : _.partial(prepareTdAttrs, _, 'is-min'),
          className: simple ? 'is-min' : ''
        },
        {
          id: 'subject',
          tdAttrs: prepareTdAttrs,
          label: t('suggestions', 'PROPERTY:subjectAndDescription')
        }
      ];

      if (!simple)
      {
        columns.push.apply(columns, [
          {id: 'date', tdAttrs: prepareTdAttrs},
          {id: 'categories', tdAttrs: prepareTdAttrs},
          {id: 'productFamily', tdAttrs: prepareTdAttrs},
          {id: 'section', tdAttrs: prepareTdAttrs},
          {id: 'confirmer', tdAttrs: prepareTdAttrs},
          {id: 'owners', label: t('suggestions', 'PROPERTY:owners')}
        ]);
      }

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
            return model.get('howItIs');
          }

          if (this.dataset.id === 'owners')
          {
            return view.serializeOwnersPopoverContent(model);
          }

          return undefined;
        }
      });
    },

    serializeOwnersPopoverContent: function(suggestion)
    {
      var owners = suggestion.get('owners');

      if (owners.length <= 1)
      {
        return undefined;
      }

      var html = '<ul class="suggestions-list-owners">';

      for (var i = 0; i < owners.length; ++i)
      {
        html += '<li>' + owners[i].rendered;
      }

      html += '</ul>';

      return html;
    }

  });
});
