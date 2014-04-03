define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  '../views/ActionFormView',
  'app/core/templates/jumpAction'
], function(
  _,
  $,
  t,
  viewport,
  ActionFormView,
  jumpActionTemplate
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

  function onJumpFormSubmit(page, collection, $form)
  {
    var ridEl = $form[0].rid;

    if (ridEl.readOnly)
    {
      return false;
    }

    var rid = parseInt(ridEl.value, 10);

    if (isNaN(rid) || rid <= 0)
    {
      ridEl.value = '';

      return false;
    }

    ridEl.readOnly = true;
    ridEl.value = rid;

    var $iconEl = $form.find('.fa').removeClass('fa-search').addClass('fa-spinner fa-spin');

    var req = page.promised($.ajax({
      url: _.result(collection, 'url') + ';rid',
      data: {rid: rid}
    }));

    req.done(function(modelId)
    {
      page.broker.publish('router.navigate', {
        url: collection.genClientUrl() + '/' + modelId,
        trigger: true
      });
    });

    req.fail(function()
    {
      viewport.msg.show({
        type: 'error',
        time: 2000,
        text: t(collection.getNlsDomain(), 'MSG:jump:404', {rid: rid})
      });

      $iconEl.removeClass('fa-spinner fa-spin').addClass('fa-search');

      ridEl.readOnly = false;
      ridEl.select();
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
    },
    jump: function(page, collection)
    {
      return {
        template: function()
        {
          return jumpActionTemplate({
            nlsDomain: collection.getNlsDomain()
          });
        },
        afterRender: function($action)
        {
          var $form = $action.find('form');

          $form.submit(onJumpFormSubmit.bind(null, page, collection, $form));
        }
      };
    }
  };
});
