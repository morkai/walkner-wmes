// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  'app/time',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../settings',
  '../Report9',
  '../views/Report9TableView',
  '../views/Report9PlanUploadView',
  'app/reports/templates/report9Page',
  'app/reports/templates/report9Actions'
], function(
  $,
  time,
  t,
  user,
  viewport,
  View,
  bindLoadingMessage,
  settings,
  Report9,
  Report9TableView,
  Report9PlanUploadView,
  template,
  actionsTemplate
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'report9',

    template: template,

    breadcrumbs: [t.bound('reports', '9:breadcrumbs:base')],

    remoteTopics: {
      'cags.plan.synced': function()
      {
        viewport.msg.show({
          type: 'info',
          time: 2500,
          text: t('reports', '9:planUpload:synced')
        });
      },
      'cags.plan.syncFailed': function()
      {
        viewport.msg.show({
          type: 'error',
          time: 5000,
          text: t('reports', '9:planUpload:syncFailed')
        });
      }
    },

    actions: function()
    {
      return !user.isAllowedTo('REPORTS:MANAGE') ? [] : [{
        template: actionsTemplate,
        afterRender: function($pageAction)
        {
          $pageAction.find('a').last().on('click', function()
          {
            document.body.focus();

            viewport.showDialog(new Report9PlanUploadView(), t('reports', '9:planUpload:title'));

            return false;
          });
        }
      }];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.setView('#' + this.idPrefix + '-table', this.tableView);
    },

    destroy: function()
    {
      settings.release();
    },

    defineModels: function()
    {
      this.settings = bindLoadingMessage(settings.acquire(), this);
      this.report = bindLoadingMessage(new Report9(), this);
    },

    defineViews: function()
    {
      this.tableView = new Report9TableView({model: this.report});
    },

    defineBindings: function()
    {

    },

    load: function(when)
    {
      return when(this.settings.fetchIfEmpty(function()
      {
        return [
          this.report.fetch()
        ];
      }, this));
    },

    afterRender: function()
    {
      settings.acquire();
    }

  });
});
