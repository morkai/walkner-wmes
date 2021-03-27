// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/broker',
  'app/i18n',
  'app/user',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/core/views/DialogView',
  'app/data/prodFunctions',
  './SectionFormView',
  './WatchFormView',
  './MrpFormView',
  './EditProdFunctionFormView',
  'app/mor/templates/mor',
  'app/mor/templates/removeSection',
  'app/mor/templates/removeWatch',
  'app/mor/templates/removeMrp',
  'app/mor/templates/userPopover'
], function(
  _,
  $,
  broker,
  t,
  user,
  time,
  viewport,
  View,
  DialogView,
  prodFunctions,
  SectionFormView,
  WatchFormView,
  MrpFormView,
  EditProdFunctionFormView,
  template,
  removeSectionTemplate,
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

        return false;
      },
      'click .btn[data-action]': function(e)
      {
        var $el = this.$(e.currentTarget);
        var action = $el[0].dataset.action;
        var params = [];
        var param = function(prop)
        {
          return $el.closest('[data-' + prop + ']').attr('data-' + prop);
        };

        switch (action)
        {
          case 'addSection':
            params.push();
            break;

          case 'removeSection':
            params.push(param('section-id'));
            break;

          case 'editSection':
            params.push(param('section-id'));
            break;

          case 'addWatch':
            params.push(param('section-id'));
            break;

          case 'removeWatch':
            params.push(param('section-id'), param('user-id'));
            break;

          case 'editWatch':
            params.push(param('section-id'), param('user-id'));
            break;

          case 'addMrp':
            params.push(param('section-id'));
            break;

          case 'removeMrp':
            params.push(param('section-id'), param('mrp-id'));
            break;

          case 'editMrp':
            params.push(param('section-id'), param('mrp-id'));
            break;

          case 'editProdFunction':
            params.push(param('section-id'), param('mrp-id'), param('prod-function-id'));
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
        this.$(e.currentTarget).closest('tbody').find('.mor-is-common').addClass('mor-mrps-highlight');
      },
      'mouseleave tr[data-mrp-id]': function(e)
      {
        this.$(e.currentTarget).closest('tbody').find('.mor-is-common').removeClass('mor-mrps-highlight');
      },
      'dragenter .mor-section': function(e)
      {
        this.hoveredSectionId = e.currentTarget.dataset.sectionId;
      },
      'click #-editMode': function()
      {
        viewport.closeDialog();

        this.broker.publish('router.navigate', {
          url: '/mor?edit=1',
          trigger: true,
          replace: false
        });
      }
    },

    initialize: function()
    {
      this.editing = String(!!this.options.editing);
      this.$userPopover = null;
      this.$dndIndicator = null;
      this.draggedSectionId = null;
      this.hoveredSectionId = null;
      this.week = time.getMoment().startOf('week');

      this.model.subscribe(this.pubsub);

      this.listenTo(this.model, 'update:presence', this.onPresenceUpdated);

      $(window)
        .on('click.' + this.idPrefix, this.onClick.bind(this))
        .on('keydown.' + this.idPrefix, this.onKeyDown.bind(this));

      $(document)
        .on('dragstart.' + this.idPrefix, this.onDragStart.bind(this))
        .on('dragend.' + this.idPrefix, this.onDragEnd.bind(this))
        .on('dragenter.' + this.idPrefix, this.onDragEnter.bind(this))
        .on('dragover.' + this.idPrefix, this.onDragOver.bind(this))
        .on('drop.' + this.idPrefix, this.onDrop.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
      $(document).off('.' + this.idPrefix);

      this.hideUserPopover();

      this.$id('jumpList').remove();
    },

    serialize: function()
    {
      var prodFunctions = this.serializeProdFunctions();
      var isManager = user.isAllowedTo('FN:manager');
      var canManage = user.isAllowedTo('MOR:MANAGE');
      var canManageUsers = user.isAllowedTo('MOR:MANAGE:USERS');

      return {
        idPrefix: this.idPrefix,
        draggable: this.editing,
        editModeVisible: this.options.editable !== false
          && viewport.currentDialog === this
          && (isManager || canManage || canManageUsers),
        linkEmails: this.options.editable !== false,
        sectionActionsVisible: canManage,
        watchActionsVisible: isManager || canManage,
        mrpActionsVisible: canManage,
        sections: this.serializeSections(prodFunctions),
        prodFunctions: prodFunctions
      };
    },

    serializeSections: function(prodFunctions)
    {
      return (this.model.get('sections') || []).map(this.serializeSection.bind(this, prodFunctions));
    },

    serializeSection: function(prodFunctions, morSection)
    {
      if (morSection.prodFunctions.length)
      {
        prodFunctions = this.serializeProdFunctions(morSection.prodFunctions);
      }

      var mor = this.model;
      var viewWatch = this.serializeWatches(morSection);
      var viewMrps = this.serializeMrps(prodFunctions, morSection);
      var watchDaysVisible = _.some(viewWatch, function(d) { return d.user.days !== ''; });

      if (watchDaysVisible)
      {
        var week = this.week;

        viewWatch.forEach(function(d)
        {
          if (d.user.days === '')
          {
            d.user.days = week.day(1).format('ddd') + '-' + week.day(7).format('ddd');
          }
        });
      }

      return {
        _id: morSection._id,
        collapsed: mor.isSectionCollapsed(morSection._id),
        label: morSection.name,
        addWatchVisible: morSection.watchEnabled,
        watchVisible: morSection.watchEnabled && viewWatch.length > 0,
        watchDaysVisible: watchDaysVisible,
        watchHoursVisible: _.some(viewWatch, function(d) { return d.user.hours !== ''; }),
        watch: viewWatch,
        mrpsVisible: morSection.mrpsEnabled
          && (viewMrps.length > 0 || (this.options.editable !== false && user.isAllowedTo('MOR:MANAGE'))),
        mrpColumnVisible: true,
        mrps: viewMrps,
        prodFunctions: prodFunctions
      };
    },

    serializeWatches: function(morSection)
    {
      var mor = this.model;

      return morSection.watch
        .filter(function(d) { return !!mor.users.get(d.user); })
        .sort(function(a, b)
        {
          a = mor.users.get(a.user);
          b = mor.users.get(b.user);

          if (a.get('prodFunction') === b.get('prodFunction'))
          {
            return a.getLabel().localeCompare(b.getLabel());
          }

          if (a.get('prodFunction') === 'manager')
          {
            return -1;
          }

          if (b.get('prodFunction') === 'manager')
          {
            return 1;
          }

          return a.getLabel().localeCompare(b.getLabel());
        })
        .map(this.serializeWatch, this);
    },

    serializeWatch: function(morWatch)
    {
      return {
        user: this.serializeUser(morWatch, morWatch.user, -1)
      };
    },

    serializeMrps: function(prodFunctions, morSection)
    {
      var commonProdFunctions = {};

      morSection.commonProdFunctions.forEach(function(prodFunction)
      {
        commonProdFunctions[prodFunction._id] = prodFunction.users;
      });

      _.forEach(this.model.get('globalProdFunctions'), function(prodFunction)
      {
        commonProdFunctions[prodFunction._id] = prodFunction.users;
      });

      return morSection.mrps
        .sort(function(a, b) { return a._id.localeCompare(b._id); })
        .map(this.serializeMrp.bind(this, prodFunctions, commonProdFunctions, morSection.mrps.length));
    },

    serializeMrp: function(prodFunctions, commonProdFunctions, mrpCount, morMrp, i)
    {
      return {
        _id: morMrp._id,
        name: /^[A-Za-z0-9]/.test(morMrp._id) ? morMrp._id : '',
        description: morMrp.description,
        prodFunctions: this.serializeMrpProdFunctions(
          prodFunctions,
          morMrp.prodFunctions,
          i === 0 ? commonProdFunctions : {},
          i === 0,
          mrpCount
        )
      };
    },

    serializeMrpProdFunctions: function(prodFunctions, morProdFunctions, commonProdFunctions, first, mrpCount)
    {
      var view = this;
      var map = {};

      morProdFunctions.forEach(function(d) { map[d._id] = d; });

      return prodFunctions.map(function(prodFunction)
      {
        var morProdFunction = map[prodFunction._id] || {
          _id: prodFunction._id,
          users: []
        };
        var users = (commonProdFunctions[prodFunction._id] || morProdFunction.users).map(function(userId, i)
        {
          var user = view.serializeUser(null, userId, i);

          if (!prodFunction.ordered)
          {
            user.no = '';
          }

          return user;
        });

        if (!prodFunction.ordered)
        {
          users.sort(function(a, b) { return a.label.localeCompare(b.label); });
        }

        return {
          _id: prodFunction._id,
          common: prodFunction.common || prodFunction.global,
          users: users,
          rowspan: (prodFunction.common || prodFunction.global) && first ? mrpCount : 1
        };
      }).filter(function(viewProdFunction)
      {
        return first || !viewProdFunction.common;
      });
    },

    serializeUser: function(availability, userId, i)
    {
      var user = this.model.users.get(userId);
      var days = '';
      var hours = '';

      if (availability)
      {
        if (availability.days.length)
        {
          days = this.formatDayRange(availability.days);
        }

        if (availability.from && availability.to && availability.from !== availability.to)
        {
          hours = availability.from + '-' + availability.to;
        }
      }

      if (!user)
      {
        return {
          _id: userId,
          no: (i + 1) + '. ',
          label: userId,
          prodFunction: '?',
          email: '?',
          mobile: '?',
          presence: false,
          days: days,
          hours: hours
        };
      }

      var prodFunction = prodFunctions.get(user.get('prodFunction'));

      return {
        _id: user.id,
        no: (i + 1) + '. ',
        label: user.getLabel(),
        prodFunction: prodFunction ? prodFunction.getLabel() : '?',
        email: user.get('email') || '?',
        mobile: user.getMobile() || '?',
        presence: user.get('presence'),
        days: days,
        hours: hours
      };
    },

    formatDayRange: function(days)
    {
      var ranges = [];

      for (var i = 0; i < days.length; ++i)
      {
        var day = days[i];

        if (i === 0)
        {
          ranges.push([day, day]);

          continue;
        }

        var lastRange = ranges[ranges.length - 1];

        if (day - lastRange[1] === 1)
        {
          lastRange[1] += 1;

          continue;
        }

        ranges.push([day, day]);
      }

      var week = this.week;

      return ranges.map(function(r)
      {
        var from = week.day(r[0]).format('ddd');

        if (r[0] === r[1])
        {
          return from;
        }

        return from + '-' + week.day(r[1]).format('ddd');
      }).join(', ');
    },

    serializeProdFunctions: function(allProdFunctions)
    {
      var settings = this.model.get('settings') || {};
      var globalProdFunctions = settings.globalProdFunctions || [];
      var commonProdFunctions = settings.commonProdFunctions || [];
      var orderedProdFunctions = settings.orderedProdFunctions || [];

      if (!allProdFunctions)
      {
        allProdFunctions = settings.prodFunctions || [];
      }

      return _.map(allProdFunctions, function(prodFunctionId)
      {
        var prodFunction = prodFunctions.get(prodFunctionId);

        return {
          _id: prodFunction ? prodFunction.id : prodFunctionId,
          label: prodFunction ? prodFunction.getLabel() : prodFunctionId,
          global: _.contains(globalProdFunctions, prodFunctionId),
          common: _.contains(commonProdFunctions, prodFunctionId),
          ordered: _.contains(orderedProdFunctions, prodFunctionId)
        };
      });
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change update', this.render);

      this.$id('jumpList').remove();
    },

    afterRender: function()
    {
      this.listenTo(this.model, 'change update', this.render);

      this.$id('jumpList').on('click', 'a', this.onJumpListClick.bind(this));

      if (viewport.currentDialog === this)
      {
        this.$id('jumpList').addClass('hidden mor-jumpList-modal');
      }
    },

    onDialogShown: function()
    {
      this.$id('jumpList').appendTo(document.body).removeClass('hidden');
    },

    onJumpListClick: function(e)
    {
      var isModal = this.$id('jumpList').hasClass('mor-jumpList-modal');
      var sectionId = e.currentTarget.dataset.sectionId;
      var $section = this.$('.mor-section[data-section-id="' + sectionId + '"]');

      if (this.model.isSectionCollapsed(sectionId))
      {
        $section.find('.mor-section-name').click();
      }

      var y = 0;

      if (isModal)
      {
        y = $section.position().top + 30;
      }
      else
      {
        y = $section.offset().top - 14;

        var $navbar = $('.navbar-fixed-top');

        if ($navbar.length)
        {
          y -= $navbar.outerHeight();
        }
      }

      $(isModal ? '.modal' : 'html, body').stop(true, false).animate({scrollTop: y});

      return false;
    },

    toggleEditing: function(editing)
    {
      this.editing = String(editing);

      this.$('[draggable]').attr('draggable', this.editing);
    },

    onDragStart: function(e)
    {
      if (!e.target.draggable
        || !e.target.classList.contains('mor-section-name')
        || !user.isAllowedTo('MOR:MANAGE'))
      {
        return;
      }

      e.originalEvent.dataTransfer.dropEffect = 'move';

      this.draggedSectionId = this.$(e.target).closest('[data-section-id]').attr('data-section-id');
      this.hoveredSectionId = this.draggedSectionId;
      this.$dndIndicator = $('<hr class="mor-dnd-indicator">');

      this.positionDndIndicator(e);

      this.$dndIndicator.appendTo(document.body);
    },

    onDragEnter: function(e)
    {
      if (this.draggedSectionId)
      {
        e.preventDefault();
      }
    },

    onDragEnd: function()
    {
      if (this.$dndIndicator)
      {
        this.$dndIndicator.remove();
        this.$dndIndicator = null;
      }

      this.draggedSectionId = null;
    },

    onDragOver: function(e)
    {
      if (!this.draggedSectionId || !this.hoveredSectionId)
      {
        return;
      }

      e.preventDefault();

      this.positionDndIndicator(e);
    },

    onDrop: function()
    {
      if (!this.draggedSectionId)
      {
        return;
      }

      var params = {
        source: this.draggedSectionId,
        target: this.hoveredSectionId,
        position: this.$dndIndicator.attr('data-position')
      };

      this.draggedSectionId = null;
      this.hoveredSectionId = null;

      setTimeout(this.model.moveSection.bind(this.model, params), 1);
    },

    positionDndIndicator: function(e)
    {
      var $section = this.$('.mor-section[data-section-id="' + this.hoveredSectionId + '"]');
      var mouseY = e.originalEvent.pageY;
      var top = $section.offset().top;
      var height = $section.outerHeight(true);
      var position = 'before';

      if (mouseY > top + height / 2)
      {
        position = 'after';

        var $next = $section.next();

        if ($next.length)
        {
          top = $next.offset().top;
        }
        else
        {
          top += height + 8;
        }
      }
      else if (!$section.prev().length)
      {
        top -= 10;
      }

      this.$dndIndicator.css('top', top + 'px').attr('data-position', position);
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

    addSection: function()
    {
      viewport.showDialog(
        new SectionFormView({
          model: {
            nlsSuffix: 'add',
            mor: this.model,
            section: null
          }
        }),
        t('mor', 'sectionForm:title:add')
      );
    },

    removeSection: function(sectionId)
    {
      var dialogView = new DialogView({
        template: removeSectionTemplate,
        autoHide: false,
        model: {
          section: this.model.getSection(sectionId).name
        }
      });

      this.listenTo(dialogView, 'answered', function()
      {
        this.model.removeSection({section: sectionId})
          .fail(function()
          {
            viewport.msg.show({
              type: 'error',
              time: 3000,
              text: t('mor', 'removeSection:failure')
            });
          })
          .done(function() { viewport.closeDialog(); })
          .always(function() { dialogView.enableAnswers(); });
      });

      viewport.showDialog(dialogView, t('mor', 'removeSection:title'));
    },

    editSection: function(sectionId)
    {
      viewport.showDialog(
        new SectionFormView({
          model: {
            nlsSuffix: 'edit',
            mor: this.model,
            section: this.model.getSection(sectionId)
          }
        }),
        t('mor', 'sectionForm:title:edit')
      );
    },

    addWatch: function(sectionId)
    {
      viewport.showDialog(
        new WatchFormView({
          model: {
            mode: 'add',
            mor: this.model,
            section: this.model.getSection(sectionId),
            watch: null
          }
        }),
        t('mor', 'watchForm:title:add')
      );
    },

    removeWatch: function(sectionId, userId)
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
        this.model.removeWatch({section: sectionId, user: userId})
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

    editWatch: function(sectionId, userId)
    {
      viewport.showDialog(
        new WatchFormView({
          model: {
            mode: 'edit',
            mor: this.model,
            section: this.model.getSection(sectionId),
            watch: this.model.getWatch(sectionId, userId)
          }
        }),
        t('mor', 'watchForm:title:edit')
      );
    },

    addMrp: function(sectionId)
    {
      viewport.showDialog(
        new MrpFormView({
          model: {
            mode: 'add',
            mor: this.model,
            section: this.model.getSection(sectionId),
            mrp: null
          }
        }),
        t('mor', 'mrpForm:title:add')
      );
    },

    removeMrp: function(sectionId, mrpId)
    {
      var dialogView = new DialogView({
        template: removeMrpTemplate,
        autoHide: false,
        model: {
          section: this.model.getSection(sectionId).name,
          mrp: mrpId
        }
      });

      this.listenTo(dialogView, 'answered', function()
      {
        this.model.removeMrp({section: sectionId, mrp: mrpId})
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

    editMrp: function(sectionId, mrpId)
    {
      viewport.showDialog(
        new MrpFormView({
          model: {
            mode: 'edit',
            mor: this.model,
            section: this.model.getSection(sectionId),
            mrp: this.model.getMrp(sectionId, mrpId)
          }
        }),
        t('mor', 'mrpForm:title:edit')
      );
    },

    editProdFunction: function(sectionId, mrpId, prodFunctionId)
    {
      viewport.showDialog(
        new EditProdFunctionFormView({
          model: {
            mor: this.model,
            section: this.model.getSection(sectionId),
            mrp: this.model.getMrp(sectionId, mrpId),
            prodFunction: prodFunctions.get(prodFunctionId)
          }
        }),
        t('mor', 'editProdFunction:title')
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

      if (!user)
      {
        return;
      }

      this.$userPopover = $user.popover({
        placement: 'right',
        trigger: 'manual',
        html: true,
        title: user.getLabel(),
        content: this.getUserPopoverContent(user)
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

    onClick: function(e)
    {
      if (!$(e.target).closest('.popover').length)
      {
        this.hideUserPopover();
      }
    },

    onKeyDown: function(e)
    {
      if (e.keyCode === 27)
      {
        this.hideUserPopover();
      }
    },

    onPresenceUpdated: function(changes)
    {
      var view = this;

      _.forEach(changes, function(presence, userId)
      {
        view.$('.mor-user-presence[data-user-id="' + userId + '"]')
          .removeClass('mor-user-present mor-user-notPresent')
          .addClass('mor-user-' + (presence ? 'present' : 'notPresent'));
      });
    }

  });
});
