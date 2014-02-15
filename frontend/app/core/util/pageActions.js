define([
  'underscore',
  'app/i18n',
  '../views/ActionFormView'
], function(
  _,
  t,
  ActionFormView
) {
  'use strict';

  function getTotalCount(collection)
  {
    if (collection.paginationData)
    {
      return collection.paginationData.get('totalCount');
    }

    return collection.length;
  }

  return {
    add: function(collection, privilege)
    {
      return {
        label: t.bound(collection.getNlsDomain(), 'PAGE_ACTION:add'),
        icon: 'plus',
        href: collection.genClientUrl('add'),
        privileges: privilege || (collection.getPrivilegePrefix() + ':MANAGE')
      };
    },
    edit: function(model, privilege)
    {
      return {
        label: t.bound(model.getNlsDomain(), 'PAGE_ACTION:edit'),
        icon: 'edit',
        href: model.genClientUrl('edit'),
        privileges: privilege || (model.getPrivilegePrefix() + ':MANAGE')
      };
    },
    delete: function(model, privilege)
    {
      return {
        label: t.bound(model.getNlsDomain(), 'PAGE_ACTION:delete'),
        icon: 'times',
        href: model.genClientUrl('delete'),
        privileges: privilege || (model.getPrivilegePrefix() + ':MANAGE'),
        callback: function(e)
        {
          if (e.button === 0)
          {
            e.preventDefault();

            ActionFormView.showDeleteDialog({model: model});
          }
        }
      };
    },
    export: function(layout, page, collection, privilege)
    {
      page.listenTo(collection, 'sync', function()
      {
        var totalCount = getTotalCount(collection);
        var $export = layout.$('.page-actions .export')
          .attr('href', _.result(collection, 'url') + ';export?' + collection.rqlQuery)
          .toggleClass('disabled', !totalCount)
          .removeClass('btn-default btn-warning');

        if (totalCount >= 10000)
        {
          $export.removeClass('btn-default').addClass('btn-warning');
        }
        else
        {
          $export.removeClass('btn-warning').addClass('btn-default');
        }
      });

      return {
        label: t.bound(collection.getNlsDomain(), 'PAGE_ACTION:export'),
        icon: 'download',
        type: getTotalCount(collection) >= 10000 ? 'warning' : 'default',
        href: _.result(collection, 'url') + ';export?' + collection.rqlQuery,
        privileges: privilege || (collection.getPrivilegePrefix() + ':VIEW'),
        className: 'export' + (collection.length ? '' : ' disabled')
      };
    }
  };
});
