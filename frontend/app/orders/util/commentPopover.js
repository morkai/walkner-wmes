// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/broker',
  'app/viewport',
  'app/orders/templates/commentPopover',
  'css!app/orders/assets/commentPopover.css'
], function(
  _,
  $,
  t,
  broker,
  viewport,
  template
) {
  'use strict';

  return {

    isVisible: function(view)
    {
      return !!view.$commentPopover;
    },

    hide: function(view, animate)
    {
      var $commentPopover = view.$commentPopover;

      if ($commentPopover)
      {
        $(document.body).click();

        broker.publish('orders.commentPopover.hiding', {$menu: $commentPopover});

        var options = $commentPopover.data('options');

        $(window).off('.commentPopover.' + view.idPrefix);
        $(document.body).off('.commentPopover.' + view.idPrefix);

        $commentPopover.data('backdrop').remove();
        $commentPopover.removeData('backdrop');
        $commentPopover.removeData('options');

        if (options.animate === false || animate === false)
        {
          $commentPopover.remove();
        }
        else
        {
          $commentPopover.fadeOut('fast', function() { $commentPopover.remove(); });
        }

        view.$commentPopover = null;

        broker.publish('orders.commentPopover.hidden');
      }
    },

    show: function(view, orderNo, top, left, options)
    {
      if (!options)
      {
        options = {};
      }

      var hide = this.hide.bind(this, view);

      hide(false);

      var $popover = $(template({
        className: options.className || '',
        top: top
      }));

      $popover.on('mousedown', function(e)
      {
        if (e.which !== 1)
        {
          return false;
        }

        e.stopPropagation();
      });
      $popover.on('mouseup', function(e)
      {
        if (e.which !== 1)
        {
          return false;
        }
      });
      $popover.on('contextmenu', false);
      $popover.on('submit', function()
      {
        var comment = $popover.find('.form-control').val().trim();

        if (!comment.length)
        {
          hide();

          return false;
        }

        if (!comment.replace(/[^0-9a-zA-Z]+/g, '').length)
        {
          $popover.find('.form-control').val('').focus();

          return false;
        }

        viewport.msg.saving();

        var $submit = $popover.find('.btn-primary').prop('disabled', true);

        var req = view.ajax({
          method: 'POST',
          url: '/orders/' + orderNo,
          data: JSON.stringify({
            comment: comment,
            source: options.source || 'other'
          })
        });

        req.fail(function()
        {
          viewport.msg.savingFailed();
          $submit.prop('disabled', false);
        });

        req.done(function()
        {
          viewport.msg.saved();
          hide();
        });

        return false;
      });
      $popover.find('.btn-link').on('click', hide);
      $popover.find('.form-control').on('keyup', function(e)
      {
        if (e.ctrlKey && e.key === 'Enter')
        {
          $popover.find('.btn-primary').click();

          return false;
        }
      });

      var $backdrop = $('<div class="planning-menu-backdrop"></div>').one('mousedown', hide);

      $popover.data('backdrop', $backdrop);
      $popover.data('options', options);

      $(window)
        .on('keydown.commentPopover.' + view.idPrefix, function(e)
        {
          if (e.key === 'Escape')
          {
            hide();

            return false;
          }
        });
      $(document.body)
        .one('mousedown.commentPopover.' + view.idPrefix, function(e)
        {
          if (!options.hideFilter || options.hideFilter(e))
          {
            hide();
          }
        })
        .append($backdrop)
        .append($popover);

      view.$commentPopover = $popover;

      this.position(view, top, left);

      if (options.autoFocus !== false)
      {
        $popover.find('textarea').focus();
      }

      broker.publish('orders.commentPopover.shown', {$menu: $popover});
    },

    position: function(view, top, left)
    {
      if (!view.$commentPopover)
      {
        return;
      }

      var $menu = view.$commentPopover;
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

      _.assign($menu.data('options'), {
        top: top,
        left: left
      });
    }

  };
});
