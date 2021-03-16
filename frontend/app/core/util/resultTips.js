// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/broker',
  'app/viewport',
  './scrollbarSize',
  './html'
], function(
  $,
  t,
  broker,
  viewport,
  scrollbarSize,
  html
) {
  'use strict';

  var tips = {};
  var count = 0;
  var id = 0;

  broker.subscribe('router.executing', function()
  {
    hideAll(true);
  });

  function hideAll(immediate)
  {
    if (count === 0)
    {
      return;
    }

    Object.keys(tips).forEach(function(id)
    {
      hide(id, immediate);
    });
  }

  function hide(id, immediate)
  {
    var tip = tips[id];

    if (!tip)
    {
      return;
    }

    var $tip = $('#' + id);

    $tip.stop(true, false);

    if (immediate)
    {
      $tip.remove();
    }
    else
    {
      $tip.fadeOut('fast', function()
      {
        $tip.remove();
      });
    }

    clearTimeout(tip.hideTimer);

    delete tips[id];

    count -= 1;

    if (count === 0)
    {
      window.removeEventListener('scroll', onWindowScroll);
      window.removeEventListener('resize', onWindowResize);
      viewport.$dialog[0].removeEventListener('scroll', onWindowScroll);
    }
  }

  function show(options)
  {
    if (!options.text)
    {
      return;
    }

    id += 1;
    count += 1;

    var top = options.top || options.y || options.clientY || 0;
    var left = options.left || options.x || options.clientX || 0;
    var event = options.event || options.e;
    var target = options.el || options.currentTarget || options.target;
    var attrs = {
      id: 'resultTip' + id,
      className: ['resultTip', options.type || 'success'].concat(options.className || []),
      style: options.style
    };
    var code = html.tag('div', attrs, options.text || '???');
    var $el = $(code);

    $el.appendTo(document.body);

    if (event)
    {
      if (!top)
      {
        top = event.clientY;
      }

      if (!left)
      {
        left = event.clientX;
      }
    }

    var elRect = $el[0].getBoundingClientRect();

    if (target && (!top || !left))
    {
      var targetRect = target.getBoundingClientRect();

      if (!top)
      {
        top = targetRect.top + targetRect.height + 5;
      }

      if (!left)
      {
        left = targetRect.left;

        if (elRect.width > targetRect.width)
        {
          left -= (elRect.width - targetRect.width) / 2;
        }
        else
        {
          left += (targetRect.width - elRect.width) / 2;
        }
      }
    }

    if (options.offsetTop)
    {
      top += options.offsetTop;
    }

    if (options.offsetLeft)
    {
      left += options.offsetLeft;
    }

    if (top + elRect.height + scrollbarSize.height >= window.innerHeight)
    {
      top = window.innerHeight - elRect.height - scrollbarSize.height - 5;
    }

    if (left + elRect.width + scrollbarSize.width >= window.innerWidth)
    {
      left = window.innerWidth - elRect.width - scrollbarSize.width - 5;
    }

    $el[0].style.display = 'none';
    $el[0].style.top = top + 'px';
    $el[0].style.left = left + 'px';

    if (options.animate === false)
    {
      $el[0].style.display = '';
    }
    else
    {
      $el.fadeIn('fast');
    }

    tips[attrs.id] = {
      id: attrs.id,
      hideTimer: setTimeout(hide, options.time || 1500, attrs.id, false)
    };

    if (count === 1)
    {
      window.addEventListener('scroll', onWindowScroll, {passive: true});
      window.addEventListener('resize', onWindowResize, {passive: true});
      viewport.$dialog[0].addEventListener('scroll', onWindowScroll, {passive: true});
    }
  }

  function onWindowScroll()
  {
    hideAll(true);
  }

  function onWindowResize()
  {
    hideAll(true);
  }

  return {
    show: show,
    showCopied: function(options)
    {
      show(Object.assign({
        type: 'success',
        text: t('core', 'resultTips:copied'),
        time: 1000
      }, options));
    }
  };
});
