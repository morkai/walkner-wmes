define([
  'app/i18n',
  '../views/ActionFormView'
], function(
  t,
  ActionFormView
) {
  'use strict';

  return {
    add: function(collection, privilege)
    {
      return {
        label: t.bound(collection.model.prototype.nlsDomain || 'core', 'PAGE_ACTION:add'),
        icon: 'plus',
        href: collection.genClientUrl('add'),
        privileges: privilege
      };
    },
    edit: function(model, privilege)
    {
      return {
        label: t.bound(model.nlsDomain || 'core', 'PAGE_ACTION:edit'),
        icon: 'edit',
        href: model.genClientUrl('edit'),
        privileges: privilege
      };
    },
    delete: function(model, privilege)
    {
      return {
        label: t.bound(model.nlsDomain || 'core', 'PAGE_ACTION:delete'),
        icon: 'times',
        href: model.genClientUrl('delete'),
        privileges: privilege,
        callback: function(e)
        {
          if (e.button === 0)
          {
            e.preventDefault();

            ActionFormView.showDeleteDialog({model: model});
          }
        }
      };
    }
  };
});
