// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/views/ListView',
  'app/wmes-ct-balancing/templates/orderPopover',
  'app/wmes-ct-balancing/templates/commentEditor'
], function(
  _,
  $,
  time,
  user,
  viewport,
  ListView,
  orderPopoverTemplate,
  commentEditorTemplate
) {
  'use strict';

  return ListView.extend({

    className: function()
    {
      return 'ct-balancing-list ' + (user.isAllowedTo('PROD_DATA:MANAGE') ? 'is-editable' : '');
    },

    remoteTopics: {
      'ct.balancing.pces.updated': function(message)
      {
        var view = this;

        if (message.deleted)
        {
          message.deleted.forEach(deleted =>
          {
            var model = view.collection.get(deleted._id);

            if (model)
            {
              view.collection.remove(model);
            }
          });
        }

        if (message.updated)
        {
          message.updated.forEach(update =>
          {
            var model = view.collection.get(update._id);

            if (model)
            {
              model.set(update);
            }
          });
        }

        if (message.added)
        {
          if (this.commenting)
          {
            this.needsRefresh = true;
          }
          else
          {
            this.refreshCollectionIfNeeded(message.added);
          }
        }
      }
    },

    events: Object.assign({

      'click td[data-id="comment"]': function(e)
      {
        if (user.isAllowedTo('PROD_DATA:MANAGE', 'FN:*process-engineer*'))
        {
          this.showCommentEditor(this.$(e.currentTarget).closest('.list-item')[0].dataset.id);
        }
      }

    }, ListView.prototype.events),

    serializeColumns: function()
    {
      return [
        {id: 'order', className: 'is-min'},
        {id: 'line', className: 'is-min'},
        {id: 'station', className: 'is-min is-number', label: this.t('PROPERTY:station:short')},
        {id: 'startedAt', className: 'is-min'},
        {id: 'd', className: 'is-min text-right'},
        {id: 'stt', className: 'is-min text-right'},
        {id: 'comment'}
      ];
    },

    serializeActions: function()
    {
      return null;
    },

    initialize: function()
    {
      ListView.prototype.initialize.apply(this, arguments);

      this.commenting = false;
      this.needsRefresh = false;

      this.listenTo(this.collection, 'sync', function()
      {
        this.needsRefresh = false;

        this.hideEditor(false);
      });

      this.once('afterRender', function()
      {
        this.listenTo(this.collection, 'change:comment', this.onCommentChange);
        this.listenTo(this.collection, 'remove', this.onPceRemove);
      });

      $(window)
        .on('keydown.' + this.idPrefix, this.onWindowKeyDown.bind(this))
        .on('resize.' + this.idPrefix, this.onWindowResize.bind(this));
    },

    destroy: function()
    {
      ListView.prototype.destroy.apply(this, arguments);

      $(window).off('.' + this.idPrefix);
    },

    afterRender: function()
    {
      var view = this;

      ListView.prototype.afterRender.apply(view, arguments);

      view.$el.popover({
        container: view.el,
        selector: 'td[data-id]',
        trigger: 'hover',
        placement: 'right',
        html: true,
        css: {
          maxWidth: '350px'
        },
        hasContent: function()
        {
          return this.dataset.id === 'order';
        },
        content: function()
        {
          var pce = view.collection.get(this.parentNode.dataset.id);

          if (this.dataset.id === 'order')
          {
            var order = pce.get('order');

            return view.renderPartialHtml(orderPopoverTemplate, {
              order: {
                _id: order._id,
                nc12: order.nc12,
                name: _.escape(order.name),
                mrp: order.mrp,
                qty: order.qty,
                workerCount: order.workerCount,
                sapTaktTime: time.toString(order.sapTaktTime, false, false)
              }
            });
          }
        }
      });
    },

    refreshCollectionIfNeeded: function(added)
    {
      var productFilter = this.collection.getProductFilter();

      added = added.filter(function(pce)
      {
        return pce.order._id === productFilter || pce.order.nc12 === productFilter;
      });

      if (!added.length)
      {
        return;
      }

      this.trigger('added');

      if (this.collection.length + added.length <= this.collection.rqlQuery.limit)
      {
        this.collection.add(added, {at: 0});
        this.render();
      }
      else
      {
        this.refreshCollection();
      }
    },

    onCommentChange: function(model)
    {
      this.$cell(model.id, 'comment').text(model.get('comment'));
    },

    onPceRemove: function(model)
    {
      if (this.$editor && this.$editor.data('id') === model.id)
      {
        this.hideEditor(true);
      }

      this.$row(model.id).remove();
    },

    showCommentEditor: function(id)
    {
      var view = this;
      var model = view.collection.get(id);

      if (!model)
      {
        view.hideEditor(false);

        return;
      }

      if (view.$editor && (view.$editor.data('id') !== id || view.$editor.data('prop', 'comment')))
      {
        this.hideEditor();
      }

      view.$editor = view.renderPartial(commentEditorTemplate, {
        comment: model.get('comment')
      });

      view.$editor.data('id', id).data('prop', 'comment');

      view.$editor.find('.form-control').on('keyup', function(e)
      {
        if (e.ctrlKey && e.key === 'Enter')
        {
          view.$editor.find('.btn-primary').click();
        }
      });

      view.$editor.on('submit', function()
      {
        var newComment = view.$editor.find('.form-control').val();

        if (newComment.replace(/[^A-Z0-9]+/ig, '') === model.get('comment').replace(/[^A-Z0-9]+/ig, ''))
        {
          view.hideEditor(true);

          return false;
        }

        viewport.msg.saving();

        var req = model.save({comment: newComment}, {wait: true});

        req.fail(function()
        {
          viewport.msg.savingFailed();
        });

        req.done(function()
        {
          viewport.msg.saved();

          view.hideEditor(true);
        });

        return false;
      });

      view.positionEditor();

      view.$editor.appendTo('body').find('.form-control').focus();
    },

    positionEditor: function()
    {
      if (!this.$editor)
      {
        return;
      }

      var $cell = this.$cell(this.$editor.data('id'), this.$editor.data('prop'));
      var pos = $cell.position();

      this.$editor.css({
        top: (pos.top + 5) + 'px',
        left: (pos.left + 5) + 'px',
        width: ($cell.outerWidth() - 10) + 'px'
      });
    },

    hideEditor: function(refresh)
    {
      if (this.$editor)
      {
        this.$editor.remove();
        this.$editor = null;
      }

      if (refresh !== false && this.needsRefresh)
      {
        this.refreshCollectionNow();
      }
    },

    onWindowKeyDown: function(e)
    {
      if (e.key === 'Escape')
      {
        this.hideEditor(true);
      }
    },

    onWindowResize: function()
    {
      this.positionEditor();
    }

  });
});
