// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/View',
  'app/data/orgUnits',
  'app/planning/templates/lines',
  'app/planning/templates/linePopover'
], function(
  _,
  $,
  View,
  orgUnits,
  linesTemplate,
  linePopoverTemplate
) {
  'use strict';

  return View.extend({

    template: linesTemplate,

    events: {},

    initialize: function()
    {
      var resize = _.debounce(this.resize.bind(this), 16);

      this.listenTo(this.plan.settings, 'changed', this.onSettingsChanged);

      $(window).on('resize.' + this.idPrefix, resize);
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
      this.$el.popover('destroy');
    },

    serialize: function()
    {
      var view = this;

      return {
        idPrefix: view.idPrefix,
        lines: view.mrp.lines.map(function(line)
        {
          return {
            _id: line.id,
            workerCount: line.mrpSettings(view.mrp.id).get('workerCount'),
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
    },

    $item: function(id)
    {
      return id ? this.$('.planning-mrp-list-item[data-id="' + id + '"]') : this.$('.planning-mrp-list-item');
    },

    serializePopover: function(lineId)
    {
      var lineUnits = orgUnits.getAllForProdLine(lineId);
      var prodFlow = orgUnits.getByTypeAndId('prodFlow', lineUnits.prodFlow);
      var prodLine = orgUnits.getByTypeAndId('prodLine', lineUnits.prodLine);
      var line = this.mrp.lines.get(lineId);

      return linePopoverTemplate({
        line: {
          _id: lineId,
          division: lineUnits.division ? lineUnits.division : '?',
          prodFlow: prodFlow ? prodFlow.get('name') : '?',
          prodLine: prodLine ? prodLine.get('description') : '?',
          workerCount: line.mrpSettings(this.mrp.id).get('workerCount'),
          activeTime: this.serializeActiveTime(line, true)
        }
      });
    },

    serializeActiveTime: function(line, force)
    {
      var activeFrom = line.settings.get('activeFrom');
      var activeTo = line.settings.get('activeTo');

      return force || activeFrom || activeTo
        ? ((activeFrom || '06:00') + '-' + (activeTo || '06:00'))
        : '';
    },

    onSettingsChanged: function(changedObjects)
    {
      if (changedObjects.mrps[this.mrp.id])
      {
        this.render();
      }
    }

  });
});
