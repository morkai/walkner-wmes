// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  '../views/ActionFormView',
  'app/core/templates/jumpAction',
  'app/core/templates/exportAction'
], function(
  _,
  t,
  viewport,
  ActionFormView,
  jumpActionTemplate,
  exportActionTemplate
) {
  'use strict';

  function resolvePrivileges(modelOrCollection, privilege, privilegeSuffix)
  {
    if (privilege === false)
    {
      return null;
    }

    return privilege || (modelOrCollection.getPrivilegePrefix() + ':' + (privilegeSuffix || 'MANAGE'));
  }

  function getTotalCount(collection)
  {
    if (collection.paginationData)
    {
      return collection.paginationData.get('totalCount');
    }

    return collection.length;
  }

  function onJumpFormSubmit(page, collection, $form, options)
  {
    var phraseEl = $form[0].phrase;

    if (phraseEl.readOnly)
    {
      return false;
    }

    var phrase = phraseEl.value;

    phraseEl.readOnly = true;

    var $iconEl = $form.find('.fa').removeClass('fa-search').addClass('fa-spinner fa-spin');

    var req = page.ajax(options.mode === 'rid' ? {
      url: _.result(collection, 'url') + ';rid',
      data: {rid: phrase}
    } : {
      method: 'HEAD',
      url: _.result(collection, 'url') + '/' + phrase
    });

    req.done(function(modelId)
    {
      page.broker.publish('router.navigate', {
        url: collection.genClientUrl() + '/' + (modelId || phrase),
        trigger: true
      });
    });

    req.fail(function()
    {
      viewport.msg.show({
        type: 'error',
        time: 2000,
        text: t(collection.getNlsDomain(), 'MSG:jump:404', {rid: phrase})
      });

      $iconEl.removeClass('fa-spinner fa-spin').addClass('fa-search');

      phraseEl.readOnly = false;
      phraseEl.select();
    });

    return false;
  }

  return {
    add: function(collection, privilege)
    {
      return {
        label: t.bound(collection.getNlsDomain(), 'PAGE_ACTION:add'),
        icon: 'plus',
        href: collection.genClientUrl('add'),
        privileges: resolvePrivileges(collection, privilege)
      };
    },
    edit: function(model, privilege)
    {
      return {
        label: t.bound(model.getNlsDomain(), 'PAGE_ACTION:edit'),
        icon: 'edit',
        href: model.genClientUrl('edit'),
        privileges: resolvePrivileges(model, privilege)
      };
    },
    delete: function(model, privilege, options)
    {
      if (!options)
      {
        options = {};
      }

      return {
        label: t.bound(model.getNlsDomain(), 'PAGE_ACTION:delete'),
        icon: 'times',
        href: model.genClientUrl('delete'),
        privileges: resolvePrivileges(model, privilege),
        callback: function(e)
        {
          if (!e || e.button === 0)
          {
            if (e)
            {
              e.preventDefault();
            }

            ActionFormView.showDeleteDialog(_.defaults({model: model}, options));
          }
        }
      };
    },
    export: function(layout, page, collection, privilege)
    {
      var options = {
        layout: layout,
        page: page,
        collection: collection,
        privilege: privilege
      };

      if (arguments.length === 1)
      {
        options = layout;
      }

      var template = function()
      {
        var totalCount = getTotalCount(options.collection);
        var url = _.result(options.collection, 'url') + ';export.${format}?' + options.collection.rqlQuery;
        var formats = [
          {
            type: 'csv',
            href: url.replace('${format}', 'csv')
          }
        ];

        if (window.XLSX_EXPORT && totalCount < 30000)
        {
          formats.push({
            type: 'xlsx',
            href: url.replace('${format}', 'xlsx')
          });
        }

        return exportActionTemplate({
          type: totalCount >= 30000 ? 'danger' : totalCount >= 15000 ? 'warning' : 'default',
          formats: formats,
          disabled: totalCount >= 60000 || totalCount === 0,
          label: options.label || t(options.collection.getNlsDomain(), 'PAGE_ACTION:export')
        });
      };

      options.page.listenTo(options.collection, 'sync', function()
      {
        options.layout.$('.page-actions-export').replaceWith(template());
      });

      return {
        template: template,
        privileges: resolvePrivileges(options.collection, options.privilege, 'VIEW'),
        callback: options.callback
      };
    },
    jump: function(page, collection, options)
    {
      options = _.assign({mode: 'rid', pattern: '^ *[0-9]+ *$', autoFocus: true}, options);

      return {
        template: function()
        {
          var nlsDomain = collection.getNlsDomain();

          return jumpActionTemplate({
            title: options.title || t(nlsDomain, 'PAGE_ACTION:jump:title'),
            placeholder: options.placeholder || t(nlsDomain, 'PAGE_ACTION:jump:placeholder'),
            autoFocus: options.autoFocus,
            pattern: options.pattern
          });
        },
        afterRender: function($action)
        {
          var $form = $action.find('form');

          $form.submit(onJumpFormSubmit.bind(null, page, collection, $form, options));
        }
      };
    }
  };
});
