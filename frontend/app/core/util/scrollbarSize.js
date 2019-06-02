// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([

], function(

) {
  'use strict';

  var outer = document.createElement('div');
  var inner = document.createElement('div');

  outer.style.position = 'absolute';
  outer.style.top = '-9999px';
  outer.style.width = '100px';
  outer.style.height = '100px';
  outer.style.overflow = 'scroll';

  inner.style.width = '200px';
  inner.style.height = '200px';

  outer.appendChild(inner);
  document.body.appendChild(outer);

  var scrollbarWidth = outer.offsetWidth - outer.clientWidth;
  var scrollbarHeight = outer.offsetHeight - outer.clientHeight;

  document.body.removeChild(outer);

  return {
    width: scrollbarWidth,
    height: scrollbarHeight
  };
});
