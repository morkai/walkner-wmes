// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/planning/templates/contextMenu'
], function(
  $,
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
        .one('mousedown', function(e)
        {
          hideMenu();

          document.elementFromPoint(e.clientX, e.clientY).click();
        });

      $menu.data('backdrop', $backdrop);

      $(window).one('scroll.contextMenu.' + view.idPrefix, hideMenu);
      $(document.body)
        .one('mousedown.contextMenu.' + view.idPrefix, hideMenu)
        .append($backdrop)
        .append($menu);

      if (left + $menu.outerWidth() >= document.body.clientWidth)
      {
        left -= (left + $menu.outerWidth()) - document.body.clientWidth + 5;
      }

      $menu.css('left', left + 'px');

      view.$contextMenu = $menu;

      view.broker.publish('planning.contextMenu.shown');
    }

  };
});
