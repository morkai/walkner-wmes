// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/data/clipboard',
  'app/planning/util/contextMenu',
  'app/planning/PlanSapOrder',
  'app/core/templates/userInfo',
  'app/wh/templates/whSet',
  'app/wh/templates/whSetItem',
  'app/planning/templates/lineOrderComments'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  clipboard,
  contextMenu,
  PlanSapOrder,
  userInfoTemplate,
  setTemplate,
  setItemTemplate,
  lineOrderCommentsTemplate
) {
  'use strict';

  return View.extend({

    template: setTemplate,

    dialogClassName: 'wh-set-dialog',

    events: {
      'mousedown .planning-mrp-lineOrders-comment': function(e)
      {
        if (e.button !== 0)
        {
          return;
        }

        var sapOrder = this.plan.sapOrders.get(e.currentTarget.parentNode.dataset.order);

        if (!sapOrder)
        {
          return;
        }

        var comments = sapOrder.get('comments');

        if (!comments.length)
        {
          return;
        }

        this.$(e.currentTarget).popover({
          trigger: 'manual',
          placement: 'left',
          html: true,
          content: lineOrderCommentsTemplate({
            comments: comments.map(function(comment)
            {
              return {
                user: userInfoTemplate({noIp: true, userInfo: comment.user}),
                time: time.toTagData(comment.time).human,
                text: PlanSapOrder.formatCommentWithIcon(comment)
              };
            })
          }),
          template: '<div class="popover planning-mrp-comment-popover">'
          + '<div class="arrow"></div>'
          + '<div class="popover-content"></div>'
          + '</div>'
        }).popover('show');
      },
      'mouseup .planning-mrp-lineOrders-comment': function(e)
      {
        this.$(e.currentTarget).popover('destroy');
      }
    },

    initialize: function()
    {
      var view = this;

      view.listenTo(view.plan.sapOrders, 'reset', view.onOrdersReset);

      view.listenTo(view.whOrders, 'reset', view.onOrdersReset);
      view.listenTo(view.whOrders, 'change', view.onOrderChanged);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        renderItem: setItemTemplate,
        items: this.serializeItems()
      };
    },

    serializeItems: function()
    {
      var view = this;

      return view.whOrders
        .filter(function(whOrder) { return whOrder.get('set') === view.model.set; })
        .map(function(whOrder, i) {return whOrder.serialize(view.plan, i); });
    },

    beforeRender: function()
    {
      clearTimeout(this.timers.render);
    },

    scheduleRender: function()
    {
      clearTimeout(this.timers.render);

      if (!this.plan.isAnythingLoading() && this.isRendered())
      {
        this.timers.render = setTimeout(this.renderIfNotLoading.bind(this), 1);
      }
    },

    renderIfNotLoading: function()
    {
      if (!this.plan.isAnythingLoading())
      {
        this.render();
      }
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
    },

    showMenu: function(e)
    {
      var td = e.currentTarget;
      var tr = td.parentNode;
      var whOrder = this.whOrders.get(tr.dataset.id);
      var menu = [];

      contextMenu.show(this, e.pageY, e.pageX, menu);
    },

    onCommentChange: function(sapOrder)
    {
      if (this.plan.orders.get(sapOrder.id))
      {
        this.$('tbody[data-order="' + sapOrder.id + '"] .planning-mrp-lineOrders-comment').html(
          sapOrder.getCommentWithIcon()
        );
      }
    },

    onOrdersReset: function(orders, options)
    {
      if (!options.reload)
      {
        this.scheduleRender();
      }
    },

    onPsStatusChanged: function(sapOrder)
    {
      var $item = this.$('tbody[data-order="' + sapOrder.id + '"]');

      if ($item.length)
      {
        var psStatus = this.plan.sapOrders.getPsStatus(sapOrder.id);

        $item
          .find('.planning-mrp-list-property-psStatus')
          .attr('title', t('planning', 'orders:psStatus:' + psStatus))
          .attr('data-ps-status', psStatus);
      }
    },

    onOrderChanged: function(whOrder)
    {
      var $item = this.$('tbody[data-id="' + whOrder.id + '"]');

      if (!$item.length)
      {
        return;
      }

      var i = this.whOrders.indexOf(whOrder);

      $item.replaceWith(setItemTemplate({
        item: whOrder.serialize(this.plan, i)
      }));
    }

  });
});
