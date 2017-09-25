define(function()
{
  'use strict';

  return function scrollIntoView(itemEl)
  {
    var listEl = itemEl.parentElement;

    if (listEl.scrollWidth > listEl.offsetWidth)
    {
      listEl.scrollLeft = itemEl.offsetLeft - listEl.clientWidth / 2;
    }
  };
});
