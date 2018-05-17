// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/broker',
  'app/planning/templates/contextMenu'
], function(
  _,
  $,
  t,
  broker,
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

        broker.publish('planning.contextMenu.hidden');
      }
    },

    show: function(view, top, left, options)
    {
      var hideMenu = this.hide.bind(this, view);
      var showMenu = this.show.bind(this, view, top, left, options);
      var menu;

      if (options.menu)
      {
        menu = options.menu;
      }
      else
      {
        options = {menu: options};
        menu = options.menu;
      }

      hideMenu();

      var $menu = $(template({
        top: top,
        icons: _.some(menu, function(item) { return !!item.icon; }),
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
        var el = e.currentTarget;

        if (el.classList.contains('disabled'))
        {
          return;
        }

        var action = el.dataset.action;
        var item = menu[action];

        $menu.find('a').addClass('disabled');

        e.contextMenu = {
          hide: true,
          action: action,
          item: item,
          view: view,
          top: top,
          left: left,
          menu: menu,
          restore: showMenu
        };

        if (item && item.handler)
        {
          item.handler(e);
        }

        if (e.contextMenu.hide)
        {
          hideMenu();
        }
        else
        {
          $menu.find(el).find('.fa').attr('class', 'fa fa-spinner fa-spin');
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
        .one('mousedown.contextMenu.' + view.idPrefix, function(e)
        {
          if (!options.hideFilter || options.hideFilter(e))
          {
            hideMenu();
          }
        })
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

      broker.publish('planning.contextMenu.shown');
    },

    actions: {

      sapOrder: function(orderNo)
      {
        return {
          icon: 'fa-file-o',
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
          icon: 'fa-comment-o',
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
