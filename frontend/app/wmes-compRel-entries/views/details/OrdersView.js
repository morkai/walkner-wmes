// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/viewport',
  'app/core/View',
  'app/core/views/DialogView',
  'app/core/util/pageActions',
  'app/data/localStorage',
  'app/wmes-compRel-entries/Entry',
  './ReleaseOrderView',
  './RemoveOrdersView',
  'app/wmes-compRel-entries/templates/details/orders',
  'app/wmes-compRel-entries/templates/details/removeOrder'
], function(
  _,
  viewport,
  View,
  DialogView,
  pageActions,
  localStorage,
  Entry,
  ReleaseOrderView,
  RemoveOrdersView,
  template,
  removeOrderTemplate
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'click .btn[data-action="invalidOnly"]': function(e)
      {
        e.currentTarget.classList.toggle('active');

        this.invalidOnly = !this.invalidOnly;

        if (this.invalidOnly)
        {
          localStorage.setItem('WMES_COMP_REL_INVALID_ONLY', '1');
        }
        else
        {
          localStorage.removeItem('WMES_COMP_REL_INVALID_ONLY');
        }

        this.toggleInvalidOnly();
      },

      'click .btn[data-action="add"]': function()
      {
        this.showReleaseOrderDialog();
      },

      'click .btn[data-action="removeOne"]': function(e)
      {
        this.showRemoveOrderDialog(e.currentTarget.dataset.id);
      },

      'click .btn[data-action="removeMany"]': function()
      {
        this.showRemoveOrdersDialog();
      },

      'click .btn[data-action="export"]': function(e)
      {
        e.currentTarget.disabled = true;

        pageActions.exportXlsx('/compRel/entries;export.xlsx?_id=' + this.model.id + '&mode=orders');

        this.timers.enableExport = setTimeout(function() { e.currentTarget.disabled = false; }, 3000);
      },

      'click a[target="_blank"]': function(e)
      {
        e.target.style.cursor = 'wait';

        var req = this.ajax({
          type: 'HEAD',
          url: e.target.href.replace('#', '/')
        });

        req.fail(function()
        {
          e.target.parentNode.textContent = e.target.textContent;
        });

        req.done(function()
        {
          window.open(e.target.href, '_blank');
        });

        return false;
      }

    },

    initialize: function()
    {
      var view = this;
      var entry = view.model;

      view.invalidOnly = localStorage.getItem('WMES_COMP_REL_INVALID_ONLY') === '1';

      view.once('afterRender', function()
      {
        view.listenTo(entry, 'change:orders', view.render);
        view.listenTo(entry, 'change:status', view.toggleButtons);
        view.listenTo(entry, 'change:valid', view.toggleValid);
      });
    },

    getTemplateData: function()
    {
      return {
        invalidOnly: this.invalidOnly,
        valid: this.model.get('valid'),
        orders: this.model.serializeOrders(),
        canRelease: Entry.can.releaseOrder(this.model),
        canRemove: Entry.can.removeOrder(this.model)
      };
    },

    toggleButtons: function()
    {
      this.$('.can-release').toggleClass('hidden', !Entry.can.releaseOrder(this.model));
      this.$('.can-remove').toggleClass('hidden', !Entry.can.removeOrder(this.model));
    },

    toggleValid: function()
    {
      this.$el
        .removeClass('panel-default panel-danger')
        .addClass('panel-' + (this.model.get('valid') ? 'default' : 'danger'));
    },

    toggleInvalidOnly: function()
    {
      this.$('tbody').find('.default').toggleClass('hidden', this.invalidOnly);
    },

    showReleaseOrderDialog: function()
    {
      var dialogView = new ReleaseOrderView({
        model: this.model
      });

      viewport.showDialog(dialogView, this.t('orders:title'));
    },

    showRemoveOrdersDialog: function()
    {
      var dialogView = new RemoveOrdersView({
        model: this.model
      });

      viewport.showDialog(dialogView, this.t('orders:removeMany:title'));
    },

    showRemoveOrderDialog: function(id)
    {
      var order = this.model.get('orders').find(function(o) { return o._id === id; });
      var dialogView = new DialogView({
        nlsDomain: this.model.getNlsDomain(),
        template: removeOrderTemplate,
        model: {
          orderNo: order.orderNo
        }
      });

      viewport.showDialog(dialogView, this.t('orders:removeOne:title'));

      this.listenTo(dialogView, 'answered', function(answer)
      {
        if (answer === 'yes')
        {
          this.removeOrder(id);
        }
      });
    },

    removeOrder: function(id)
    {
      var view = this;

      viewport.msg.saving();

      var req = view.ajax({
        method: 'POST',
        url: '/compRel/entries/' + view.model.id + ';release-order',
        data: JSON.stringify({
          remove: {
            _id: id
          }
        })
      });

      req.fail(function()
      {
        viewport.msg.savingFailed();
      });

      req.done(function()
      {
        viewport.msg.saved();
        viewport.closeDialog();
      });
    }

  });
});
