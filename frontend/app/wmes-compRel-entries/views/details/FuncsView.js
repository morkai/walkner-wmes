// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/viewport',
  'app/core/View',
  'app/wmes-compRel-entries/Entry',
  './AcceptView',
  './AddUserView',
  'app/wmes-compRel-entries/templates/details/funcs'
], function(
  $,
  viewport,
  View,
  Entry,
  AcceptView,
  AddUserView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'click .compRel-details-accept': function(e)
      {
        this.showAcceptDialog(this.$(e.target).closest('.compRel-details-func')[0].dataset.id);
      },

      'click [data-action="addUser"]': function(e)
      {
        this.showAddUserDialog(this.$(e.target).closest('.compRel-details-func')[0].dataset.id);
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
        addUser: Entry.can.addUser(this.model),
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

    toggleOverflowX: function()
    {
      this.$('.compRel-details-funcs').css(
        'overflow-x',
        (this.$el.outerWidth() + 50) < window.innerWidth ? 'visible' : ''
      );
    },

    onWindowResize: function()
    {
      this.toggleOverflowX();
    }

  });
});
