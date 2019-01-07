// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/broker',
  'app/user',
  'app/core/View',
  '../Entry',
  './AddFormView',
  'app/wmes-fap-entries/templates/navbar'
], function(
  $,
  broker,
  user,
  View,
  Entry,
  AddFormView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click #-add': function()
      {
        var view = this;

        if (view.$('.fap-addForm').length)
        {
          return view.hideAddForm();
        }

        clearTimeout(view.timers.resetNewEntry);
        view.timers.resetNewEntry = null;

        view.toggleAddForm(true);

        var addFormView = new AddFormView({
          model: view.model
        });

        view.listenTo(addFormView, 'cancel', view.hideAddForm);

        view.setView('#-addForm', addFormView).render();
      }
    },

    initialize: function()
    {
      var view = this;

      view.model = new Entry();

      view.listenTo(view.model, 'sync', function()
      {
        view.hideAddForm();

        view.timers.resetModel = setTimeout(view.resetEntry.bind(view), 1);
      });

      $(window).on('keydown.' + view.idPrefix, view.onKeyDown.bind(view));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    getTemplateData: function()
    {
      return {
        browseEntriesLinks: [
          {label: 'all', rql: ''},
          {label: 'open', rql: '&status=in=(pending,started)'},
          {label: 'pending', rql: '&status=in=(pending)'},
          {label: 'started', rql: '&status=in=(started)'},
          {label: 'finished', rql: '&status=in=(finished)'},
          {label: 'analysis', rql: '&analysisNeed=true&analysisDone=false'}
        ]
      };
    },

    afterRender: function()
    {
      if (!user.isLoggedIn())
      {
        this.$el.addClass('hidden');
      }
      else if (this.$('.fap-addForm').length)
      {
        this.toggleAddForm(true);
      }
    },

    toggleAddForm: function(show)
    {
      var $icon = this.$id('add').find('.fa');

      this.$el.toggleClass('fap-navbar-adding', show);
      this.$id('menu').prop('disabled', show);

      if (show)
      {
        $icon.removeClass('fa-plus').addClass('fa-times');
      }
      else
      {
        $icon.removeClass('fa-times').addClass('fa-plus');
      }
    },

    hideAddForm: function()
    {
      var view = this;

      if (view.$('.fap-addForm').length)
      {
        view.removeView('#-addForm');
        view.toggleAddForm(false);

        view.timers.resetNewEntry = setTimeout(function() { view.model.clear(); }, 5 * 60 * 1000);
      }
    },

    resetEntry: function()
    {
      var entry = this.model;

      delete entry.focusedInput;
      delete entry.uploadQueue;
      delete entry.uploading;
      delete entry.uploadedFiles;
      delete entry.validatedOrder;

      entry.clear();
    },

    onKeyDown: function(e)
    {
      if (e.originalEvent.key === 'Escape')
      {
        this.hideAddForm();
      }
    }

  }, {

    setUp: function()
    {
      if (window.MODULES && window.MODULES.indexOf('wmes-fap') === -1)
      {
        return;
      }

      var NavbarBtnView = this;

      broker.subscribe('navbar.rendered', function(message)
      {
        var navbarView = message.view;

        if (navbarView.$el.find('.fap-navbar').length)
        {
          return;
        }

        var navbarBtnView = new NavbarBtnView();

        navbarView.insertView('.navbar-collapse', navbarBtnView).render();
      });
    }

  });
});
