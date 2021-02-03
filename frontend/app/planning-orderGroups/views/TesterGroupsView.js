// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/View',
  'app/core/util/scrollbarSize',
  'app/planning-orderGroups/templates/tester/groups'
], function(
  $,
  View,
  scrollbarSize,
  template
) {
  'use strict';

  const CN = 'planning-orderGroups-tester';

  return View.extend({

    template,

    classPrefix: CN,

    events: {

      [`mouseover .${CN}-multi`]: function(e)
      {
        this.$(`.${CN}-highlighted`).removeClass(`${CN}-highlighted`);
        this.$(`.${CN}-multi[data-id="${e.currentTarget.dataset.id}"]`).addClass(`${CN}-highlighted`);
      },

      [`mouseout .${CN}-multi`]: function()
      {
        this.$(`.${CN}-highlighted`).removeClass(`${CN}-highlighted`);
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
      this.$id(`groups`).on('scroll', this.scrollHeaders.bind(this));

      this.resize();
    },

    resize: function()
    {
      const height = window.innerHeight
        - $('.hd').outerHeight()
        - $('.ft').outerHeight()
        - $('.filter-container').outerHeight()
        - this.$id(`headers`).outerHeight()
        - 60;

      const $headers = this.$(`.${CN}-header`);

      this.$(`.${CN}-group`).each((i, el) =>
      {
        $headers[i].style.width = el.clientWidth + 'px';
      });

      this.$id(`groups`)[0].style.height = `${height}px`;

      this.scrollHeaders();
    },

    scrollHeaders: function()
    {
      const $headers = this.$id('headers');
      const $groups = this.$id('groups');

      $headers[0].style.marginLeft = `${$groups[0].scrollLeft * -1}px`;
    }

  });
});
