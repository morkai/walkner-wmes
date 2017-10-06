// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/data/orgUnits',
  'app/planning/templates/lines',
  'app/planning/templates/linePopover',
  'app/planning/templates/contextMenu'
], function(
  _,
  $,
  t,
  View,
  orgUnits,
  linesTemplate,
  linePopoverTemplate,
  contextMenuTemplate
) {
  'use strict';

  return View.extend({

    template: linesTemplate,

    events: {
      'contextmenu .is-line': function(e)
      {
        this.showMenu(e);

        return false;
      }
    },

    localTopics: {
      'planning.windowResized': 'resize',
      'planning.escapePressed': 'hideMenu'
    },

    initialize: function()
    {
      this.hideMenu = this.hideMenu.bind(this);

      this.$menu = null;

      this.listenTo(this.plan.settings, 'changed', this.onSettingsChanged);
    },

    destroy: function()
    {
      this.hideMenu();
      this.$el.popover('destroy');

      $(document.body).off('.' + this.idPrefix);
    },

    serialize: function()
    {
      var view = this;

      return {
        idPrefix: view.idPrefix,
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

      this.hideMenu();
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

    hideMenu: function()
    {
      var $menu = this.$menu;

      if ($menu)
      {
        $(window).off('.menu.' + this.idPrefix);
        $(document.body).off('.menu.' + this.idPrefix);

        $menu.fadeOut('fast', function() { $menu.remove(); });

        this.$menu = null;
      }
    },

    showMenu: function(e)
    {
      var view = this;

      if (!view.plan.isEditable())
      {
        return;
      }

      view.hideMenu();

      var line = view.mrp.lines.get(view.$(e.currentTarget).attr('data-id'));

      view.$menu = $(contextMenuTemplate({
        header: t('planning', 'lines:menu:header', {line: line.id}),
        prefix: 'lines',
        actions: ['settings', 'remove']
      }));

      view.$menu.css({
        top: e.pageY + 'px',
        left: e.pageX + 'px'
      });

      view.$menu.on('mousedown', function(e)
      {
        if (e.which !== 1)
        {
          return false;
        }

        e.stopPropagation();
      });
      view.$menu.on('mouseup', function(e)
      {
        if (e.which !== 1)
        {
          return false;
        }
      });
      view.$menu.on('contextmenu', false);
      view.$menu.on('click', 'a[data-action]', this.onMenuClick.bind(this));

      $(window).one('scroll.menu.' + this.idPrefix, view.hideMenu);
      $(document.body).one('mousedown.menu.' + this.idPrefix, view.hideMenu);

      view.$menu.appendTo(document.body);
    },

    onMenuClick: function(e)
    {
      this.hideMenu();

      return false;
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
