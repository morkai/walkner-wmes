// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/util/onModelDeleted',
  'app/core/View',
  '../ProdDowntime',
  '../views/ProdDowntimeDetailsView'
], function(
  t,
  user,
  viewport,
  bindLoadingMessage,
  pageActions,
  onModelDeleted,
  View,
  ProdDowntime,
  ProdDowntimeDetailsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('prodDowntimes', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        this.model.getLabel()
      ];
    },

    actions: function()
    {
      var actions = [];

      if (this.model.canCorroborate())
      {
        var page = this;
        var canChangeStatus = this.model.canChangeStatus();

        actions.push({
          icon: canChangeStatus ? 'gavel' : 'comment',
          label: t('prodDowntimes', 'LIST:ACTION:' + (canChangeStatus ? 'corroborate' : 'comment')),
          callback: function()
          {
            page.view.focusComment();
          }
        });
      }

      if (this.model.isEditable())
      {
        actions.push(
          pageActions.edit(this.model, 'PROD_DATA:MANAGE'),
          pageActions.delete(this.model, 'PROD_DATA:MANAGE')
        );
      }

      return actions;
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.model, this);

      this.view = new ProdDowntimeDetailsView({model: this.model});

      this.listenToOnce(this.model, 'sync', this.onFirstModelSync);
      this.listenTo(this.model, 'change', this.onModelChange);
    },

    setUpLayout: function(pageLayout)
    {
      this.listenTo(this.model, 'change', function()
      {
        pageLayout.setActions(this.actions());
      });
    },

    load: function(when)
    {
      return when(this.model.fetch(this.options.fetchOptions));
    },

    afterRender: function()
    {
      if (this.options.corroborate)
      {
        this.view.focusComment();
      }
    },

    setUpRemoteTopics: function()
    {
      this.pubsub.subscribe('prodDowntimes.updated.' + this.model.id, this.onProdDowntimeUpdated.bind(this));
      this.pubsub.subscribe('prodDowntimes.deleted.' + this.model.id, this.onProdDowntimeDeleted.bind(this));

      var pressWorksheetId = this.model.get('pressWorksheet');

      if (pressWorksheetId)
      {
        this.pubsub
          .subscribe('pressWorksheets.edited', this.onPressWorksheetEdited.bind(this))
          .setFilter(filterWorksheet);

        this.pubsub
          .subscribe('pressWorksheets.deleted', this.onPressWorksheetDeleted.bind(this))
          .setFilter(filterWorksheet);
      }

      function filterWorksheet(message)
      {
        return message.model._id === pressWorksheetId;
      }
    },

    refreshModel: function()
    {
      if (this.timers.refreshModel)
      {
        clearTimeout(this.timers.refreshModel);
        this.timers.refreshModel = null;
      }

      var page = this;

      this.promised(this.model.fetch()).fail(function(xhr)
      {
        if (xhr.status === 404)
        {
          page.onProdDowntimeDeleted();
        }
      });
    },

    onFirstModelSync: function()
    {
      this.setUpRemoteTopics();
    },

    onModelChange: function()
    {

    },

    onPressWorksheetEdited: function()
    {
      if (this.timers.refreshModel)
      {
        clearTimeout(this.timers.refreshModel);
      }

      this.timers.refreshModel = setTimeout(this.refreshModel.bind(this), 3000, this);
    },

    onPressWorksheetDeleted: function()
    {
      this.onProdDowntimeDeleted();
    },

    onProdDowntimeDeleted: function()
    {
      onModelDeleted(this.broker, this.model, null, true);
    },

    onProdDowntimeUpdated: function(message)
    {
      this.model.set(message);
    }

  });
});
