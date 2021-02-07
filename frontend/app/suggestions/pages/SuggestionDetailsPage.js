// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/pages/DetailsPage',
  'app/core/util/pageActions',
  'app/kaizenOrders/dictionaries',
  '../views/SuggestionDetailsView',
  '../views/AttachmentsView',
  '../views/SuggestionHistoryView',
  '../views/KomView',
  '../views/CoordinateView',
  '../views/AcceptView',
  '../views/CompleteView',
  '../views/VerifyView',
  'app/suggestions/templates/detailsPage'
], function(
  $,
  t,
  user,
  viewport,
  DetailsPage,
  pageActions,
  kaizenDictionaries,
  SuggestionDetailsView,
  AttachmentsView,
  SuggestionHistoryView,
  KomView,
  CoordinateView,
  AcceptView,
  CompleteView,
  VerifyView,
  template
) {
  'use strict';

  return DetailsPage.extend({

    template: template,

    pageClassName: 'page-max-flex',

    baseBreadcrumb: true,
    breadcrumbs: function()
    {
      if (!this.options.standalone)
      {
        return DetailsPage.prototype.breadcrumbs.call(this);
      }

      return [
        this.t('BREADCRUMB:base'),
        this.model.get('rid') + ''
      ];
    },

    localTopics: {
      'suggestions.seen': 'onSeen'
    },

    actions: function()
    {
      var actions = [];
      var model = this.model;

      if (user.isLoggedIn())
      {
        if (model.canKom())
        {
          actions.push({
            id: 'kom',
            icon: 'trophy',
            label: this.t('PAGE_ACTION:kom'),
            callback: this.kom.bind(this)
          });
        }

        if (model.canCoordinate())
        {
          actions.push({
            id: 'coordinate',
            icon: 'gavel',
            label: this.t('PAGE_ACTION:coordinate'),
            callback: this.coordinate.bind(this)
          });
        }
        else if (model.canAccept())
        {
          actions.push({
            id: 'accept',
            icon: 'gavel',
            label: this.t('PAGE_ACTION:accept'),
            callback: this.accept.bind(this)
          });
        }
        else if (model.canComplete())
        {
          actions.push({
            id: 'complete',
            icon: 'gavel',
            label: this.t('PAGE_ACTION:complete'),
            callback: this.complete.bind(this)
          });
        }
        else if (model.canVerify())
        {
          actions.push({
            id: 'verify',
            icon: 'gavel',
            label: this.t('PAGE_ACTION:verify'),
            callback: this.verify.bind(this)
          });
        }

        if (model.isNotSeen())
        {
          actions.push({
            id: 'markAsSeen',
            icon: 'eye',
            label: this.t('PAGE_ACTION:markAsSeen'),
            callback: this.markAsSeen.bind(this)
          });
        }

        var observer = model.get('observer');

        if (observer.role === 'subscriber')
        {
          actions.push({
            id: 'unobserve',
            icon: 'eye-slash',
            label: this.t('PAGE_ACTION:unobserve'),
            callback: this.unobserve.bind(this)
          });
        }
        else if (observer.role === 'viewer')
        {
          actions.push({
            id: 'observe',
            icon: 'eye',
            label: this.t('PAGE_ACTION:observe'),
            callback: this.observe.bind(this)
          });
        }

        if (model.canEdit())
        {
          actions.push(pageActions.edit(model, false));
        }

        if (model.canDelete())
        {
          actions.push(pageActions.delete(model, false));
        }
      }

      actions.push({
        label: this.t('PAGE_ACTION:add'),
        icon: 'plus',
        href: '#suggestions;add'
      });

      return actions;
    },

    initialize: function()
    {
      DetailsPage.prototype.initialize.apply(this, arguments);

      this.setView('#-props', this.detailsView);
      this.setView('#-before', this.beforeView);
      this.setView('#-after', this.afterView);
      this.setView('#-other', this.otherView);
      this.setView('#-history', this.historyView);
    },

    destroy: function()
    {
      DetailsPage.prototype.destroy.call(this);

      kaizenDictionaries.unload();

      $('body').removeClass('suggestions-standalone');
    },

    defineViews: function()
    {
      this.detailsView = new SuggestionDetailsView({model: this.model});
      this.beforeView = new AttachmentsView({model: this.model, kind: 'before'});
      this.afterView = new AttachmentsView({model: this.model, kind: 'after'});
      this.otherView = new AttachmentsView({model: this.model, kind: 'other'});
      this.historyView = new SuggestionHistoryView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch(), kaizenDictionaries.load());
    },

    setUpLayout: function(layout)
    {
      this.listenTo(this.model, 'reset change', function()
      {
        layout.setActions(this.actions, this);
      });
    },

    afterRender: function()
    {
      DetailsPage.prototype.afterRender.call(this);

      kaizenDictionaries.load();

      $('body').toggleClass('suggestions-standalone', !!this.options.standalone);
    },

    markAsSeen: function(e)
    {
      var view = this;
      var btnEl = e.currentTarget.querySelector('.btn');

      btnEl.disabled = true;

      view.socket.emit('suggestions.markAsSeen', {_id: view.model.id}, function(err)
      {
        if (err)
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: view.t('MSG:markAsSeen:failure')
          });

          btnEl.disabled = false;
        }
      });
    },

    observe: function(e)
    {
      var view = this;
      var btnEl = e.currentTarget.querySelector('.btn');

      btnEl.disabled = true;

      view.socket.emit('suggestions.observe', {_id: view.model.id, state: true}, function(err)
      {
        if (err)
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: view.t('MSG:observe:failure')
          });

          btnEl.disabled = false;
        }
      });
    },

    unobserve: function(e)
    {
      var view = this;
      var btnEl = e.currentTarget.querySelector('.btn');

      btnEl.disabled = true;

      view.socket.emit('suggestions.observe', {_id: view.model.id, state: false}, function(err)
      {
        if (err)
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: view.t('MSG:unobserve:failure')
          });

          btnEl.disabled = false;
        }
      });
    },

    onSeen: function(orderId)
    {
      if (orderId === this.model.id)
      {
        this.model.markAsSeen();
      }
    },

    kom: function()
    {
      var dialogView = new KomView({
        model: this.model
      });

      viewport.showDialog(dialogView, this.t('kom:title', {rid: this.model.get('rid')}));
    },

    coordinate: function()
    {
      var dialogView = new CoordinateView({
        model: this.model
      });

      viewport.showDialog(dialogView, this.t('coordinate:title', {rid: this.model.get('rid')}));
    },

    accept: function()
    {
      var dialogView = new AcceptView({
        model: this.model
      });

      viewport.showDialog(dialogView, this.t('accept:title', {rid: this.model.get('rid')}));
    },

    complete: function()
    {
      var dialogView = new CompleteView({
        model: this.model
      });

      viewport.showDialog(dialogView, this.t('complete:title', {rid: this.model.get('rid')}));
    },

    verify: function()
    {
      var dialogView = new VerifyView({
        model: this.model
      });

      viewport.showDialog(dialogView, this.t('verify:title', {rid: this.model.get('rid')}));
    }

  });
});
