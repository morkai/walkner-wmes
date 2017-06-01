// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/broker',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/views/DialogView',
  'app/data/prodFunctions',
  './WatchFormView',
  './AddMrpFormView',
  './EditMrpFormView',
  'app/mor/templates/mor',
  'app/mor/templates/removeWatch',
  'app/mor/templates/removeMrp',
  'app/mor/templates/userPopover'
], function(
  _,
  $,
  broker,
  t,
  user,
  viewport,
  View,
  DialogView,
  prodFunctions,
  WatchFormView,
  AddMrpFormView,
  EditMrpFormView,
  template,
  removeWatchTemplate,
  removeMrpTemplate,
  userPopoverTemplate
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'mor-dialog',

    events: {
      'click h3': function(e)
      {
        if (e.target.tagName === 'I' || e.target.tagName === 'SPAN')
        {
          var $section = this.$(e.target).closest('.mor-section').toggleClass('is-collapsed');

          this.model.toggleSection($section[0].dataset.sectionId, $section.hasClass('is-collapsed'));
        }
      },
      'click .mor-user': function(e)
      {
        this.toggleUserPopover(this.$(e.currentTarget));
      },
      'click .btn[data-action]': function(e)
      {
        var $el = this.$(e.currentTarget);
        var action = $el[0].dataset.action;
        var params = [];

        switch (action)
        {
          case 'removeWatch':
            params.push($el.closest('[data-user-id]')[0].dataset.userId);
            break;

          case 'editWatch':
            params.push($el.closest('[data-user-id]')[0].dataset.userId);
            break;

          case 'addMrp':
            params.push($el.closest('[data-division-id]')[0].dataset.divisionId);
            break;

          case 'removeMrp':
            params.push(
              $el.closest('[data-division-id]')[0].dataset.divisionId,
              $el.closest('[data-mrp-id]')[0].dataset.mrpId
            );
            break;

          case 'editMrp':
            params.push(
              $el.closest('[data-division-id]')[0].dataset.divisionId,
              $el.closest('[data-mrp-id]')[0].dataset.mrpId,
              $el.closest('[data-prod-function-id]')[0].dataset.prodFunctionId
            );
            break;
        }

        e.currentTarget.blur();
        e.preventDefault();
        e.stopPropagation();

        if (!this.redirectIfNeeded(action, params))
        {
          this[action].apply(this, params);
        }
      },
      'mouseenter tr[data-mrp-id]': function(e)
      {
        this.$(e.currentTarget).closest('tbody').find('.mor-is-common').addClass('mor-table-highlight');
      },
      'mouseleave tr[data-mrp-id]': function(e)
      {
        this.$(e.currentTarget).closest('tbody').find('.mor-is-common').removeClass('mor-table-highlight');
      }
    },

    initialize: function()
    {
      this.$userPopover = null;

      this.model.subscribe(this.pubsub);

      $(window)
        .on('keydown.' + this.idPrefix, this.onKeyDown.bind(this))
        .on('keyup.' + this.idPrefix, this.onKeyUp.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      this.hideUserPopover();
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        editable: this.options.editable !== false,
        canManage: user.isAllowedTo('MOR:MANAGE'),
        isManager: user.isAllowedTo('FN:manager'),
        watchCollapsed: !!this.model.collapsedSections.WATCH,
        prodFunctions: this.model.serializeProdFunctions(),
        watch: this.model.serializeWatch(),
        divisions: this.model.serializeDivisions()
      };
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change', this.render);
    },

    afterRender: function()
    {
      this.listenTo(this.model, 'change', this.render);
    },

    redirectIfNeeded: function(action, params)
    {
      if (!viewport.currentDialog)
      {
        return false;
      }

      broker.subscribe('viewport.dialog.hidden').setLimit(1).on('message', function()
      {
        broker.subscribe('viewport.page.shown').setLimit(1).on('message', function()
        {
          if (viewport.currentPage.pageId === 'mor')
          {
            viewport.currentPage.view[action].apply(viewport.currentPage.view, params);
          }
        });

        broker.publish('router.navigate', {
          url: '/mor',
          trigger: true,
          replace: false
        });
      });

      viewport.closeAllDialogs();

      return true;
    },

    addWatch: function()
    {
      viewport.showDialog(
        new WatchFormView({
          model: {
            nlsSuffix: 'add',
            mor: this.model,
            selected: null
          }
        }),
        t('mor', 'watchForm:title:add')
      );
    },

    removeWatch: function(userId)
    {
      var dialogView = new DialogView({
        template: removeWatchTemplate,
        autoHide: false,
        model: {
          user: this.model.users.get(userId).getLabel()
        }
      });

      this.listenTo(dialogView, 'answered', function()
      {
        this.model.removeWatch({user: userId})
          .fail(function()
          {
            viewport.msg.show({
              type: 'error',
              time: 3000,
              text: t('mor', 'removeWatch:failure')
            });
          })
          .done(function() { viewport.closeDialog(); })
          .always(function() { dialogView.enableAnswers(); });
      });

      viewport.showDialog(dialogView, t('mor', 'removeWatch:title'));
    },

    editWatch: function(userId)
    {
      viewport.showDialog(
        new WatchFormView({
          model: {
            nlsSuffix: 'edit',
            mor: this.model,
            selected: _.findWhere(this.model.get('watch'), {user: userId})
          }
        }),
        t('mor', 'watchForm:title:edit')
      );
    },

    addMrp: function(divisionId)
    {
      viewport.showDialog(
        new AddMrpFormView({
          model: {
            mor: this.model,
            divisionId: divisionId
          }
        }),
        t('mor', 'addMrp:title')
      );
    },

    removeMrp: function(divisionId, mrpId)
    {
      var dialogView = new DialogView({
        template: removeMrpTemplate,
        autoHide: false,
        model: {
          division: divisionId,
          mrp: mrpId
        }
      });

      this.listenTo(dialogView, 'answered', function()
      {
        this.model.removeMrp({division: divisionId, mrp: mrpId})
          .fail(function()
          {
            viewport.msg.show({
              type: 'error',
              time: 3000,
              text: t('mor', 'removeMrp:failure')
            });
          })
          .done(function() { viewport.closeDialog(); })
          .always(function() { dialogView.enableAnswers(); });
      });

      viewport.showDialog(dialogView, t('mor', 'removeMrp:title'));
    },

    editMrp: function(divisionId, mrpId, prodFunctionId)
    {
      viewport.showDialog(
        new EditMrpFormView({
          model: {
            mor: this.model,
            divisionId: divisionId,
            mrpId: this.model.isCommonProdFunction(prodFunctionId) ? null : mrpId,
            prodFunctionId: prodFunctionId
          }
        }),
        t('mor', 'editMrp:title')
      );
    },

    toggleUserPopover: function($user)
    {
      if (this.$userPopover)
      {
        if (this.$userPopover[0] === $user[0])
        {
          this.hideUserPopover();
        }
        else
        {
          this.hideUserPopover();
          this.showUserPopover($user);
        }
      }
      else
      {
        this.showUserPopover($user);
      }
    },

    hideUserPopover: function()
    {
      if (this.$userPopover)
      {
        this.$userPopover.popover('destroy');
        this.$userPopover = null;
      }
    },

    showUserPopover: function($user)
    {
      if (this.$userPopover)
      {
        return;
      }

      var user = this.model.users.get($user[0].dataset.userId);

      this.$userPopover = $user.popover({
        placement: 'auto right',
        trigger: 'manual',
        container: 'body',
        html: true,
        title: user.getLabel(),
        content: this.getUserPopoverContent(user),
      }).popover('show');
    },

    getUserPopoverContent: function(user)
    {
      var prodFunction = prodFunctions.get(user.get('prodFunction'));

      return userPopoverTemplate({
        editable: this.options.editable !== false,
        user: {
          name: user.getLabel(),
          prodFunction: prodFunction ? prodFunction.getLabel() : '',
          email: user.get('email'),
          mobile: user.getMobile()
        }
      });
    },

    onKeyDown: function(e)
    {
      if (e.keyCode === 17 && this.options.editable !== false)
      {
        this.$el.addClass('is-editing');
      }

      if (e.keyCode === 27)
      {
        this.hideUserPopover();
      }
    },

    onKeyUp: function(e)
    {
      if (e.keyCode === 17)
      {
        this.$el.removeClass('is-editing');
      }
    }

  });
});
