// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n'
], function(
  _,
  t
) {
  'use strict';

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
            label: breadcrumb[0] === ':' ? t.bound(nlsDomain, 'BREADCRUMBS' + breadcrumb) : breadcrumb
          };
        }

        if (typeof breadcrumb.label === 'string' && breadcrumb.label[0] === ':')
        {
          breadcrumb.label = t.bound(nlsDomain, 'BREADCRUMBS' + breadcrumb.label);
        }

        return breadcrumb;
      });
    }

    if (page.browseBreadcrumb !== false)
    {
      breadcrumbs.unshift({
        label: t.bound(nlsDomain, _.result(page, 'browseBreadcrumb') || 'BREADCRUMBS:browse'),
        href: breadcrumbs.length ? modelOrCollection.genClientUrl('base') : null
      });
    }

    if (page.baseBreadcrumb === true)
    {
      breadcrumbs.unshift(t.bound(nlsDomain, 'BREADCRUMBS:base'));
    }
    else if (page.baseBreadcrumb)
    {
      breadcrumbs.unshift({
        label: t.bound(nlsDomain, 'BREADCRUMBS:base'),
        href: String(_.result(page, 'baseBreadcrumb'))
      });
    }

    return breadcrumbs;
  };
});
