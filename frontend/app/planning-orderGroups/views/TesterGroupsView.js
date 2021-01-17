// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/View',
  'app/planning-orderGroups/templates/tester/groups'
], function(
  $,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.once('afterRender', function()
      {
        this.listenTo(this.model, 'change:groups', this.render);
      });

      $(window).on('resize.' + this.idPrefix, this.resize.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    getTemplateData: function()
    {
      return {
        groups: this.serializeGroups()
      };
    },

    serializeGroups: function()
    {
      return this.model.get('groups').map(function(group)
      {
        return {
          _id: group.orderGroup.id,
          label: group.orderGroup.getLabel(),
          noMatchGroup: group.orderGroup.isNoMatchGroup(),
          orders: group.sapOrders.map(function(sapOrder)
          {
            return sapOrder.attributes;
          })
        };
      }).sort(function(a, b)
      {
        if (a.noMatchGroup)
        {
          return -1;
        }

        if (a.noMatchGroup)
        {
          return 1;
        }

        return a.label.localeCompare(b.label);
      });
    },

    afterRender: function()
    {
      this.resize();
    },

    resize: function()
    {
      var height = window.innerHeight
        - $('.hd').outerHeight()
        - $('.ft').outerHeight()
        - $('.filter-container').outerHeight()
        - 60;

      this.el.style.height = height + 'px';
    }

  });
});
