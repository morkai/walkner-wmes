// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'autolinker',
  'app/i18n'
], function(
  _,
  Autolinker,
  t
) {
  'use strict';

  var AUTOLINK_ID_RE = /(.)??(#[0-9]+|[0-9]{15}|0*[0-9]{12}|[0-9]{9}|[A-Z]{3}[0-9]{3}[A-Z]{1})(.)??/g;

  var autolinker = null;

  function createAutolinker()
  {
    autolinker = new Autolinker({
      urls: {
        schemeMatches: true,
        wwwMatches: true,
        tldMatches: true
      },
      email: true,
      phone: false,
      mention: false,
      hashtag: false,
      stripPrefix: true,
      stripTrailingSlash: true,
      newWindow: true,
      truncate: {
        length: 0,
        location: 'end'
      },
      className: '',
      replaceFn: function(match)
      {
        var tag = match.buildTag();

        if (match.getType() === 'url' && match.getUrl().indexOf(window.location.host) !== -1)
        {
          var parts = tag.innerHTML.split('?');

          if (parts.length > 1 && parts[1].length)
          {
            tag.innerHTML = parts[0] + '?&hellip;';
          }

          delete tag.attrs.rel;
        }
        else if (tag.innerHTML.length >= 60)
        {
          tag.innerHTML = tag.innerHTML.substring(0, 50) + '&hellip;';
        }

        return tag;
      }
    });
  }

  function autolinkText(text)
  {
    if (!autolinker)
    {
      createAutolinker();
    }

    return autolinker.link(text);
  }

  return {
    autolinkText: autolinkText,
    autolinkMessage: function(text, options)
    {
      text = (text || '').trim().replace(/\n{3,}/, '\n\n');

      text = autolinkText(_.escape(text))
        .replace(/👤/g, '<i class="fa fa-user"></i>');

      text = text.replace(AUTOLINK_ID_RE, function(match, prefix, id, suffix)
      {
        var type;

        if (prefix === '/')
        {
          return match;
        }

        if (prefix === undefined)
        {
          prefix = '';
        }

        if (suffix === undefined)
        {
          suffix = '';
        }

        id = id.replace(/^0+/, '');

        if (/^#[0-9]+$/.test(id) && id.length < 9)
        {
          type = 'entry';
          id = id.substring(1);
          prefix += '#';
        }
        else if (id.length === 15)
        {
          type = 'document';
        }
        else if (id.length === 9)
        {
          type = 'order';
        }
        else
        {
          type = 'product';
        }

        if (!type)
        {
          return match;
        }

        var nlsDomain = options && options.nlsDomain;
        var nlsProp = 'autolink:' + type;
        var title = nlsDomain && t.has(nlsDomain, nlsProp) ? t(nlsDomain, nlsProp) : t('core', nlsProp);
console.log({type, nlsDomain, nlsProp, title});
        return prefix
          + '<a class="autolink"'
          + ' title="' + title + '"'
          + ' data-type="' + type + '"'
          + ' data-id="' + id.toUpperCase() + '">'
          + id + '</a>' + suffix;
      });

      return text;
    }
  };
});
