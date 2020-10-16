// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/util/html'
], function(
  _,
  html
) {
  'use strict';

  return function(userInfo, options)
  {
    if (!userInfo)
    {
      return '';
    }

    if (userInfo.userInfo)
    {
      options = userInfo;
      userInfo = options.userInfo;
    }
    else if (!options)
    {
      options = {};
    }

    if (!userInfo)
    {
      return '';
    }

    var label = html.tag(
      'span',
      {
        className: 'userInfo-label',
        title: userInfo.title || ''
      },
      _.escape(userInfo.label)
    );

    var cname = userInfo.cname || userInfo.ip || '';

    if (cname && options.noIp !== true)
    {
      if (cname === '0.0.0.0')
      {
        cname = '';
      }
      else
      {
        cname = ' ' + html.tag(
          'span',
          {className: 'userInfo-cname'},
          '(' + _.escape(cname) + ')'
        );
      }
    }
    else
    {
      cname = '';
    }

    return html.tag(
      'span',
      {
        className: 'userInfo',
        'data-clickable': options.clickable === false ? '0' : '1',
        'data-user-id': userInfo.id || ''
      },
      label + cname
    );
  };
});
