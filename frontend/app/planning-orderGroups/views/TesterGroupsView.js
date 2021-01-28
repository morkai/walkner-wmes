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

  const CSS = 'planning-orderGroups-tester';

  return View.extend({

    template,

    events: {

      [`mouseover .${CSS}-multi`]: function(e)
      {
        this.$(`.${CSS}-highlighted`).removeClass(`${CSS}-highlighted`);
        this.$(`.${CSS}-multi[data-id="${e.currentTarget.dataset.id}"]`).addClass(`${CSS}-highlighted`);
      },

      [`mouseout .${CSS}-multi`]: function()
      {
        this.$(`.${CSS}-highlighted`).removeClass(`${CSS}-highlighted`);
      }

    },

    initialize: function()
    {
      this.once('afterRender', () =>
      {
        this.listenTo(this.model, 'change:groups', this.render);
      });

      $(window).on(`resize.${this.idPrefix}`, this.resize.bind(this));
    },

    destroy: function()
    {
      $(window).off(`.${this.idPrefix}`);
    },

    getTemplateData: function()
    {
      return {
        groups: this.serializeGroups()
      };
    },

    serializeGroups: function()
    {
      return this.model.get('groups').map(group =>
      {
        return {
          _id: group.orderGroup.id,
          label: group.orderGroup.getLabel(),
          noMatchGroup: group.orderGroup.isNoMatchGroup(),
          orders: group.sapOrders
        };
      }).sort((a, b) =>
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
      const height = window.innerHeight
        - $('.hd').outerHeight()
        - $('.ft').outerHeight()
        - $('.filter-container').outerHeight()
        - 60;

      this.el.style.height = `${height}px`;

      this.$(`.${CSS}-group`).each((i, groupEl) =>
      {
        groupEl.querySelector('h3').style.width = groupEl.getBoundingClientRect().width + 'px';
      });
    }

  });
});
