// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/data/localStorage'
], function(
  _,
  t,
  localStorage
) {
  'use strict';

  function i18n(nlsDomain, key)
  {
    return t.bound(t.has(nlsDomain, key) ? nlsDomain : 'core', key);
  }

  return function createPageBreadcrumbs(page, breadcrumbs)
  {
    var modelOrCollection = page.modelProperty ? page[page.modelProperty] : (page.model || page.collection);
    var nlsDomain = modelOrCollection.getNlsDomain();

    if (!Array.isArray(breadcrumbs))
    {
      breadcrumbs = [];
    }
    else
    {
      breadcrumbs = breadcrumbs.map(function(breadcrumb)
      {
        if (typeof breadcrumb === 'string')
        {
          return {
            label: breadcrumb[0] === ':' ? i18n(nlsDomain, 'BREADCRUMB' + breadcrumb) : breadcrumb
          };
        }

        if (typeof breadcrumb.label === 'string' && breadcrumb.label[0] === ':')
        {
          breadcrumb.label = i18n(nlsDomain, 'BREADCRUMB' + breadcrumb.label);
        }

        return breadcrumb;
      });
    }

    if (page.browseBreadcrumb !== false)
    {
      var href = breadcrumbs.length ? modelOrCollection.genClientUrl('base') : null;

      if (href)
      {
        var baseUrl = window.location.origin + window.location.pathname + href;
        var recentUrl = _.find(JSON.parse(localStorage.getItem('WMES_RECENT_LOCATIONS') || '[]'), function(recent)
        {
          if (recent.href.indexOf(baseUrl) !== 0)
          {
            return false;
          }

          var c = recent.href.charAt(baseUrl.length);

          return c === '' || c === '?';
        });

        if (recentUrl)
        {
          var query = recentUrl.href.split('?')[1];

          if (query)
          {
            if (href.indexOf('?') === -1)
            {
              href += '?' + query;
            }
            else
            {
              href += '&' + query;
            }
          }
        }
      }

      breadcrumbs.unshift({
        label: i18n(nlsDomain, _.result(page, 'browseBreadcrumb') || 'BREADCRUMB:browse'),
        href: href
      });
    }

    if (page.baseBreadcrumb === true)
    {
      breadcrumbs.unshift(i18n(nlsDomain, 'BREADCRUMB:base'));
    }
    else if (page.baseBreadcrumb)
    {
      var baseBreadcrumbs = _.result(page, 'baseBreadcrumb');

      if (Array.isArray(baseBreadcrumbs))
      {
        breadcrumbs.unshift.apply(breadcrumbs, baseBreadcrumbs);
      }
      else
      {
        breadcrumbs.unshift({
          label: i18n(nlsDomain, 'BREADCRUMB:base'),
          href: String(baseBreadcrumbs)
        });
      }
    }

    return breadcrumbs;
  };
});
