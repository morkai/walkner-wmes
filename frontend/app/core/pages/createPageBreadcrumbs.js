// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n'
], function(
  _,
  t
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
            label: breadcrumb[0] === ':' ? i18n(nlsDomain, 'BREADCRUMBS' + breadcrumb) : breadcrumb
          };
        }

        if (typeof breadcrumb.label === 'string' && breadcrumb.label[0] === ':')
        {
          breadcrumb.label = i18n(nlsDomain, 'BREADCRUMBS' + breadcrumb.label);
        }

        return breadcrumb;
      });
    }

    if (page.browseBreadcrumb !== false)
    {
      breadcrumbs.unshift({
        label: i18n(nlsDomain, _.result(page, 'browseBreadcrumb') || 'BREADCRUMBS:browse'),
        href: breadcrumbs.length ? modelOrCollection.genClientUrl('base') : null
      });
    }

    if (page.baseBreadcrumb === true)
    {
      breadcrumbs.unshift(i18n(nlsDomain, 'BREADCRUMBS:base'));
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
          label: i18n(nlsDomain, 'BREADCRUMBS:base'),
          href: String(baseBreadcrumbs)
        });
      }
    }

    return breadcrumbs;
  };
});
