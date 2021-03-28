// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/views/ListView',
  './CoordSectionsView'
], function(
  require,
  _,
  $,
  t,
  ListView,
  CoordSectionsView
) {
  'use strict';

  function prepareTdAttrs(row, column)
  {
    if (row.observer
      && row.observer.notify
      && row.observer.changes
      && row.observer.changes[column.id])
    {
      return {
        className: 'is-changed'
      };
    }

    return {};
  }

  return ListView.extend({

    className: 'suggestions-list is-clickable is-colored',

    events: Object.assign({

      'click td[data-id="opinions"]': function(e)
      {
        var view = this;
        var $td = view.$(e.currentTarget);
        var $tr = $td.parent();
        var model = view.collection.get($tr.attr('data-id'));
        var popover = $td.data('bs.popover');

        if (this.$opinionPopover && this.$opinionPopover[0] !== $td[0])
        {
          this.$opinionPopover.popover('hide');
          this.$opinionPopover = null;
        }

        if (popover)
        {
          popover.toggle();

          this.$opinionPopover = popover.hoverState === 'in' ? $td : null;

          return;
        }

        $td.popover({
          container: this.el,
          trigger: 'manual',
          placement: 'left',
          html: true,
          className: 'suggestions-list-popover-opinions',
          hasContent: function()
          {
            return model.get('coordSections').length > 0;
          },
          title: function()
          {
            return '';
          },
          content: function()
          {
            var coordSectionsView = new CoordSectionsView({
              model: model,
              embedded: true
            });

            coordSectionsView.render();

            return coordSectionsView.$el;
          }
        });

        $td.popover('show');

        $td.modelId = model.id;

        this.$opinionPopover = $td;
      }

    }, ListView.prototype.events),

    initialize: function()
    {
      ListView.prototype.initialize.apply(this, arguments);

      $(document).on('keydown.' + this.idPrefix, this.onDocumentKeyDown.bind(this));
    },

    destroy: function()
    {
      ListView.prototype.destroy.apply(this, arguments);

      $(document).off('.' + this.idPrefix);
    },

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
          className: 'is-min',
          tdAttrs: simple ? '' : prepareTdAttrs
        },
        {
          id: 'subject',
          className: (simple ? '' : 'is-overflow w275') + ' has-popover',
          tdAttrs: simple ? '' : prepareTdAttrs,
          label: this.t('PROPERTY:subjectAndDescription')
        }
      ];

      if (simple)
      {
        return columns;
      }

      var status = this.collection.findRqlTerm('status', ['eq', 'in']);

      if (status)
      {
        status = status.name === 'eq' ? [status.args[1]] : status.args[1];
      }

      columns.push.apply(columns, [
        {id: 'date', className: 'is-min', tdAttrs: prepareTdAttrs},
        {
          id: 'finishedAt',
          className: 'is-min',
          tdAttrs: prepareTdAttrs,
          visible: _.isEmpty(status) || status.includes('finished')
        },
        {id: 'categories', className: 'is-overflow w250 has-popover', tdAttrs: prepareTdAttrs},
        {id: 'productFamily', className: 'is-overflow w150', tdAttrs: prepareTdAttrs},
        {id: 'section', className: 'is-overflow w150', tdAttrs: prepareTdAttrs},
        {id: 'confirmer', className: 'is-min', tdAttrs: prepareTdAttrs},
        {id: 'owners', className: 'is-min has-popover'},
        {id: 'opinions', className: 'text-nowrap'}
      ]);

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

      if (!this.options.simple)
      {
        this.setUpPopover();
      }

      if (this.$opinionPopover)
      {
        var modelId = this.$opinionPopover.modelId;
        var model = this.collection.get(modelId);

        if (model)
        {
          this.$('.list-item[data-id="' + modelId + '"] > td[data-id="opinions"]').click();
        }
      }
    },

    setUpPopover: function()
    {
      var view = this;
      var dictionaries = require('app/kaizenOrders/dictionaries');

      view.$el.popover({
        selector: '.has-popover',
        container: this.el,
        trigger: 'hover',
        placement: function(popoverEl, sourceEl)
        {
          return sourceEl.dataset.id === 'owners' ? 'auto left' : 'auto right';
        },
        html: true,
        className: 'suggestions-list-popover',
        hasContent: function()
        {
          var column = this.dataset.id;

          if (column === 'subject')
          {
            return true;
          }

          var model = view.collection.get(this.parentNode.dataset.id);

          if (column === 'categories' || column === 'owners')
          {
            return model.get(column).length > 1;
          }

          return false;
        },
        title: function()
        {
          return '';
        },
        content: function()
        {
          var model = view.collection.get(this.parentNode.dataset.id);
          var column = this.dataset.id;

          if (column === 'subject')
          {
            return model.get('howItIs');
          }

          if (column === 'categories')
          {
            return view.serializePopoverList(model.get(column).map(function(id)
            {
              return dictionaries.categories.getLabel(id);
            }));
          }

          if (column === 'owners')
          {
            return view.serializePopoverList(model.get(column).map(function(user) { return user.rendered; }));
          }

          return undefined;
        }
      });
    },

    serializePopoverList: function(list)
    {
      if (list.length <= 1)
      {
        return undefined;
      }

      var html = '<ul>';

      for (var i = 0; i < list.length; ++i)
      {
        html += '<li>' + list[i];
      }

      html += '</ul>';

      return html;
    },

    isNotClickable: function(e)
    {
      var column = this.$(e.target).closest('td').attr('data-id');

      if (column === 'opinions')
      {
        return true;
      }

      return ListView.prototype.isNotClickable.apply(this, arguments);
    },

    onDocumentKeyDown: function(e)
    {
      if (this.$opinionPopover && e.key === 'Escape')
      {
        this.$opinionPopover.popover('hide');
      }
    },

    onModelEdited: function(message)
    {
      var model = this.collection.get(message.model._id);

      if (model && this.$opinionPopover && this.$opinionPopover.modelId === model.id)
      {
        model.set(message.model);

        this.render();
      }
      else
      {
        this.refreshCollection();
      }
    }

  });
});
