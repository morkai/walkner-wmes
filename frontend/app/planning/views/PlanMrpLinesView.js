// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/user',
  'app/core/View',
  'app/core/views/DialogView',
  'app/data/orgUnits',
  '../util/contextMenu',
  './PlanLineSettingsDialogView',
  './PlanMrpLinesEditDialogView',
  'app/planning/templates/lines',
  'app/planning/templates/linePopover',
  'app/planning/templates/lineRemoveDialog'
], function(
  _,
  $,
  t,
  viewport,
  user,
  View,
  DialogView,
  orgUnits,
  contextMenu,
  PlanLineSettingsDialogView,
  PlanMrpLinesEditDialogView,
  linesTemplate,
  linePopoverTemplate,
  lineRemoveDialogTemplate
) {
  'use strict';

  return View.extend({

    template: linesTemplate,

    events: {
      'contextmenu .is-line': function(e)
      {
        this.showMenu(e);

        return false;
      },
      'click #-edit': function()
      {
        this.$id('edit').blur();

        this.showEditDialog();

        return false;
      }
    },

    localTopics: {
      'planning.windowResized': 'resize',
      'planning.escapePressed': 'hideMenu'
    },

    initialize: function()
    {
      this.listenTo(this.plan.settings, 'changed', this.onSettingsChanged);
    },

    destroy: function()
    {
      this.hideMenu();

      this.$el.popover('destroy');
    },

    serialize: function()
    {
      var view = this;

      return {
        idPrefix: view.idPrefix,
        showEditButton: view.plan.canEditSettings(),
        lines: view.mrp.lines.map(function(line)
        {
          var lineMrpSettings = line.mrpSettings(view.mrp.id);

          return {
            _id: line.id,
            workerCount: lineMrpSettings ? lineMrpSettings.get('workerCount') : '?',
            customTimes: view.serializeActiveTime(line, false)
          };
        })
      };
    },

    afterRender: function()
    {
      var view = this;

      view.$id('list').on('scroll', function(e)
      {
        view.$id('scrollIndicator').toggleClass('hidden', e.target.scrollLeft <= 40);
      });

      view.resize();

      this.$el.popover({
        container: this.el,
        selector: '.planning-mrp-list-item',
        trigger: 'hover',
        placement: 'top',
        html: true,
        content: function() { return view.serializePopover(this.dataset.id); },
        template: '<div class="popover planning-mrp-popover">'
          + '<div class="arrow"></div>'
          + '<div class="popover-content"></div>'
          + '</div>'
      });
    },

    resize: function()
    {
      var $edit = this.$id('edit');
      var $scrollIndicator = this.$id('scrollIndicator');
      var pos = $edit.position();

      $scrollIndicator.css({
        top: (pos.top + 1) + 'px',
        left: ($edit.outerWidth() + pos.left) + 'px'
      });

      contextMenu.hide(this);
    },

    $item: function(id)
    {
      return id ? this.$('.planning-mrp-list-item[data-id="' + id + '"]') : this.$('.planning-mrp-list-item');
    },

    serializePopover: function(lineId)
    {
      var line = this.mrp.lines.get(lineId);

      if (!line)
      {
        return null;
      }

      var lineUnits = orgUnits.getAllForProdLine(lineId);
      var prodFlow = orgUnits.getByTypeAndId('prodFlow', lineUnits.prodFlow);
      var prodLine = orgUnits.getByTypeAndId('prodLine', lineUnits.prodLine);
      var lineMrpSettings = line.mrpSettings(this.mrp.id);

      return linePopoverTemplate({
        line: {
          _id: lineId,
          division: lineUnits.division ? lineUnits.division : '?',
          prodFlow: prodFlow ? prodFlow.get('name') : '?',
          prodLine: prodLine ? prodLine.get('description') : '?',
          workerCount: lineMrpSettings ? lineMrpSettings.get('workerCount') : '?',
          activeTime: this.serializeActiveTime(line, true)
        }
      });
    },

    serializeActiveTime: function(line, force)
    {
      if (!line.settings)
      {
        return '';
      }

      var activeFrom = line.settings.get('activeFrom');
      var activeTo = line.settings.get('activeTo');

      return force || activeFrom || activeTo
        ? ((activeFrom || '06:00') + '-' + (activeTo || '06:00'))
        : '';
    },

    showEditDialog: function()
    {
      var dialogView = new PlanMrpLinesEditDialogView({
        plan: this.plan,
        mrp: this.mrp
      });

      viewport.showDialog(dialogView, t('planning', 'lines:edit:title'));
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
    },

    showMenu: function(e)
    {
      if (!this.plan.canEditSettings())
      {
        return;
      }

      var line = this.mrp.lines.get(this.$(e.currentTarget).attr('data-id'));

      contextMenu.show(this, e.pageY, e.pageX, [
        {
          label: t('planning', 'lines:menu:settings'),
          handler: this.handleSettingsAction.bind(this, line)
        },
        {
          label: t('planning', 'lines:menu:remove'),
          handler: this.handleRemoveAction.bind(this, line)
        }
      ]);
    },

    handleSettingsAction: function(line)
    {
      var dialogView = new PlanLineSettingsDialogView({
        plan: this.plan,
        mrp: this.mrp,
        line: line
      });

      viewport.showDialog(dialogView, t('planning', 'lines:menu:settings:title'));
    },

    handleRemoveAction: function(line)
    {
      var view = this;
      var dialogView = new DialogView({
        autoHide: false,
        template: lineRemoveDialogTemplate,
        model: {
          plan: view.plan.getLabel(),
          mrp: view.mrp.getLabel(),
          line: line.getLabel()
        }
      });

      view.listenTo(dialogView, 'answered', function()
      {
        var lineSettings = view.plan.settings.lines.get(line.id);

        lineSettings.set('mrpPriority', _.without(lineSettings.get('mrpPriority'), view.mrp.id));

        var req = view.promised(view.plan.settings.save());

        req.done(dialogView.closeDialog);
        req.fail(function()
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: t('planning', 'lines:menu:remove:failure')
          });

          view.plan.settings.trigger('errored');

          dialogView.enableAnswers();
        });
      });

      viewport.showDialog(dialogView, t('planning', 'lines:menu:remove:title'));
    },

    onSettingsChanged: function(changedObjects)
    {
      if (changedObjects.lines.any && changedObjects.mrps[this.mrp.id])
      {
        this.render();
      }
    }

  });
});
