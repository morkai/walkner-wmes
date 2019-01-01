// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  '../views/ActionFormView',
  'app/core/templates/jumpAction',
  'app/core/templates/exportAction'
], function(
  _,
  $,
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
        text: i18n(collection, 'MSG:jump:404', {rid: phrase})
      });

      $iconEl.removeClass('fa-spinner fa-spin').addClass('fa-search');

      phraseEl.readOnly = false;
      phraseEl.select();
    });

    return false;
  }

  function exportXlsx(url)
  {
    var $msg = viewport.msg.show({
      type: 'warning',
      text: t('core', 'MSG:EXPORTING'),
      sticky: true
    });

    var req = $.ajax({
      url: url
    });

    req.fail(function()
    {
      viewport.msg.show({
        type: 'error',
        time: 2500,
        text: t('core', 'MSG:EXPORTING_FAILURE')
      });
    });

    req.done(function(res)
    {
      window.open('/express/exports/' + res);
    });

    req.always(function()
    {
      viewport.msg.hide($msg);
    });

    return false;
  }

  function i18n(model, key, data)
  {
    var nlsDomain = model.getNlsDomain();

    return t.bound(t.has(nlsDomain, key) ? nlsDomain : 'core', key, data);
  }

  return {
    add: function(collection, privilege)
    {
      return {
        label: i18n(collection, 'PAGE_ACTION:add'),
        icon: 'plus',
        href: collection.genClientUrl('add'),
        privileges: resolvePrivileges(collection, privilege)
      };
    },
    edit: function(model, privilege)
    {
      return {
        label: i18n(model, 'PAGE_ACTION:edit'),
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
        label: i18n(model, 'PAGE_ACTION:delete'),
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
        privilege: privilege,
        maxCount: 60000
      };

      if (arguments.length === 1)
      {
        _.assign(options, layout);
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

        if (window.XLSX_EXPORT && totalCount < (options.maxCount / 2))
        {
          formats.push({
            type: 'xlsx',
            href: url.replace('${format}', 'xlsx')
          });
        }

        return exportActionTemplate({
          type: totalCount >= (options.maxCount / 2)
            ? 'danger'
            : totalCount >= (options.maxCount / 4) ? 'warning' : 'default',
          formats: formats,
          disabled: totalCount >= options.maxCount || totalCount === 0,
          label: options.label || i18n(options.collection, 'PAGE_ACTION:export')
        });
      };

      options.page.listenTo(options.collection, 'sync', function()
      {
        options.layout.$('.page-actions-export').replaceWith(template());

        afterRender(options.layout.$('.page-actions-export'));
      });

      return {
        template: template,
        privileges: resolvePrivileges(options.collection, options.privilege, 'VIEW'),
        callback: options.callback,
        afterRender: afterRender
      };

      function afterRender($container)
      {
        var $xlsx = $container.find('a[data-export-type="xlsx"]');

        if (!$xlsx.length)
        {
          return;
        }

        var href = $xlsx.prop('href');

        $xlsx.prop('href', 'javascript:void(0)'); // eslint-disable-line no-script-url

        $xlsx.on('click', function(e)
        {
          e.preventDefault();

          exportXlsx(href);
        });
      }
    },
    jump: function(page, collection, options)
    {
      options = _.assign({mode: 'rid', pattern: '^ *[0-9]+ *$', autoFocus: !window.IS_MOBILE}, options);

      return {
        template: function()
        {
          return jumpActionTemplate({
            title: options.title || i18n(collection, 'PAGE_ACTION:jump:title'),
            placeholder: options.placeholder || i18n(collection, 'PAGE_ACTION:jump:placeholder'),
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
