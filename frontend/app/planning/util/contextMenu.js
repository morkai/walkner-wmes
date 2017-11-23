// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/planning/templates/contextMenu'
], function(
  $,
  t,
  template
) {
  'use strict';

  return {

    hide: function(view)
    {
      var $menu = view.$contextMenu;

      if ($menu)
      {
        $(window).off('.contextMenu.' + view.idPrefix);
        $(document.body).off('.contextMenu.' + view.idPrefix);

        $menu.fadeOut('fast', function() { $menu.remove(); });
        $menu.data('backdrop').remove();
        $menu.removeData('backdrop');

        view.$contextMenu = null;

        view.broker.publish('planning.contextMenu.hidden');
      }
    },

    show: function(view, top, left, menu)
    {
      var hideMenu = this.hide.bind(this, view);

      hideMenu();

      var $menu = $(template({
        top: top,
        menu: menu.map(function(item)
        {
          if (item === '-')
          {
            return {type: 'divider'};
          }

          if (typeof item === 'string')
          {
            return {type: 'header', label: item};
          }

          return item;
        })
      }));

      $menu.on('mousedown', function(e)
      {
        if (e.which !== 1)
        {
          return false;
        }

        e.stopPropagation();
      });
      $menu.on('mouseup', function(e)
      {
        if (e.which !== 1)
        {
          return false;
        }
      });
      $menu.on('contextmenu', false);
      $menu.on('click', 'a[data-action]', function(e)
      {
        var item = menu[e.currentTarget.dataset.action];

        hideMenu();

        if (item && item.handler)
        {
          item.handler();
        }
      });

      var $backdrop = $('<div></div>')
        .css({
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        })
        .one('mousedown', hideMenu);

      $menu.data('backdrop', $backdrop);

      $(window)
        .one('scroll.contextMenu.' + view.idPrefix, hideMenu)
        .one('resize.contextMenu.' + view.idPrefix, hideMenu);
      $(document.body)
        .one('mousedown.contextMenu.' + view.idPrefix, hideMenu)
        .append($backdrop)
        .append($menu);

      var width = $menu.outerWidth();
      var height = $menu.outerHeight();

      if (left + width >= document.body.clientWidth)
      {
        left -= (left + width) - document.body.clientWidth + 5;
      }

      var maxHeight = window.innerHeight + window.pageYOffset;

      if (top + height >= maxHeight)
      {
        top -= (top + height) - maxHeight + 5;
      }

      $menu.css({
        top: top + 'px',
        left: left + 'px'
      });

      view.$contextMenu = $menu;

      view.broker.publish('planning.contextMenu.shown');
    },

    actions: {

      sapOrder: function(orderNo)
      {
        return {
          label: t.bound('planning', 'orders:menu:sapOrder'),
          handler: function()
          {
            window.open('/#orders/' + orderNo);
          }
        };
      },

      comment: function(orderNo)
      {
        return {
          label: t('planning', 'orders:menu:comment'),
          handler: function()
          {
            var width = Math.min(window.screen.availWidth - 200, 1400);
            var height = Math.min(window.screen.availHeight - 160, 800);
            var left = window.screen.availWidth - width - 80;

            var win = window.open(
              '/?hd=0#orders/' + orderNo,
              'WMES_PLANNING_COMMENT',
              'top=80,left=' + left + ',width=' + width + ',height=' + height
            );

            win.onPageShown = function()
            {
              win.focus();
              win.document.querySelector('textarea[name="comment"]').focus();

              setTimeout(function() { win.scrollTo(0, win.document.body.scrollHeight); }, 1);
            };
          }
        };
      }

    }

  };
});
