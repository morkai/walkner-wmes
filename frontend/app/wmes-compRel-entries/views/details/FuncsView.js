// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/viewport',
  'app/core/View',
  'app/core/views/DialogView',
  'app/wmes-compRel-entries/Entry',
  './AcceptView',
  './AddUserView',
  './AddFuncView',
  'app/wmes-compRel-entries/templates/details/funcs',
  'app/wmes-compRel-entries/templates/details/notify'
], function(
  $,
  viewport,
  View,
  DialogView,
  Entry,
  AcceptView,
  AddUserView,
  AddFuncView,
  template,
  notifyTemplate
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'click .compRel-details-accept': function(e)
      {
        this.showAcceptDialog(this.resolveFuncId(e));
      },

      'click [data-action="addUser"]': function(e)
      {
        this.showAddUserDialog(this.resolveFuncId(e));
      },

      'click [data-action="addFunc"]': function()
      {
        this.showAddFuncDialog();
      },

      'click [data-action="notify"]': function()
      {
        this.showNotifyDialog();
      }

    },

    initialize: function()
    {
      this.once('afterRender', function()
      {
        this.listenTo(this.model, 'change:funcs', this.render);
      });

      $(window).on('resize.' + this.idPrefix, this.onWindowResize.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    getTemplateData: function()
    {
      return {
        canAddUser: Entry.can.addUser(this.model),
        funcs: this.model.serializeFuncs()
      };
    },

    afterRender: function()
    {
      this.toggleOverflowX();
    },

    showAcceptDialog: function(funcId)
    {
      var dialogView = new AcceptView({
        model: {
          entry: this.model,
          func: this.model.getFunc(funcId)
        }
      });

      viewport.showDialog(dialogView, this.t('accept:title'));
    },

    showAddUserDialog: function(funcId)
    {
      var dialogView = new AddUserView({
        model: {
          entry: this.model,
          func: this.model.getFunc(funcId)
        }
      });

      viewport.showDialog(dialogView, this.t('addUser:title'));
    },

    showAddFuncDialog: function()
    {
      var dialogView = new AddFuncView({
        model: this.model
      });

      viewport.showDialog(dialogView, this.t('addFunc:title'));
    },

    showNotifyDialog: function()
    {
      var dialogView = new DialogView({
        template: notifyTemplate,
        nlsDomain: this.model.getNlsDomain()
      });

      viewport.showDialog(dialogView, this.t('notify:title'));

      this.listenTo(dialogView, 'answered', function(answer)
      {
        if (answer === 'yes')
        {
          this.notify();
        }
      });
    },

    notify: function()
    {
      var view = this;

      viewport.msg.saving();

      var req = view.ajax({
        method: 'POST',
        url: '/compRel/entries/' + view.model.id + ';notify',
        data: JSON.stringify({})
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
    },

    toggleOverflowX: function()
    {
      this.$('.compRel-details-funcs').css(
        'overflow-x',
        (this.$el.outerWidth() + 50) < window.innerWidth ? 'visible' : ''
      );
    },

    resolveFuncId: function(e)
    {
      return this.$(e.target).closest('.compRel-details-func')[0].dataset.id;
    },

    onWindowResize: function()
    {
      this.toggleOverflowX();
    }

  });
});
