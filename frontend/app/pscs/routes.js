// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../router',
  '../viewport',
  '../user',
  '../i18n',
  '../core/View',
  '../core/util/showDeleteFormPage'
], function(
  _,
  $,
  router,
  viewport,
  user,
  t,
  View,
  showDeleteFormPage
) {
  'use strict';

  var nls = 'i18n!app/nls/pscs';
  var canView = user.auth('PSCS:VIEW');
  var canManage = user.auth('PSCS:MANAGE');

  router.map('/pscs', function()
  {
    viewport.loadPage(
      ['app/pscs/pages/PscsIntroPage', nls],
      function(PscsIntroPage)
      {
        return new PscsIntroPage();
      }
    );
  });

  router.map('/pscs/learn', function()
  {
    viewport.loadPage(
      ['app/pscs/pages/PscsLearnPage', nls],
      function(PscsLearnPage)
      {
        return new PscsLearnPage();
      }
    );
  });

  router.map('/pscs/exam', function()
  {
    viewport.loadPage(
      ['app/pscs/PscsResult', 'app/pscs/views/ExamView', nls],
      function(PscsResult, ExamView)
      {
        return new View({
          layoutName: 'blank',
          breadcrumbs: [
            {href: '#pscs', label: t.bound('pscs', 'BREADCRUMBS:base')},
            t.bound('pscs', 'BREADCRUMBS:exam')
          ],
          view: new ExamView({
            editMode: false,
            formMethod: 'POST',
            formAction: '/pscs/results',
            model: new PscsResult({
              personnelId: user.data.personellId || ''
            })
          })
        });
      }
    );
  });

  router.map('/pscs/results', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/pscs/PscsResultCollection',
        'app/pscs/pages/PscsResultListPage',
        nls
      ],
      function(PscsResultCollection, PscsResultListPage)
      {
        return new PscsResultListPage({
          collection: new PscsResultCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map(
    '/pscs/results/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/pscs/PscsResult', _, _, {
      baseBreadcrumb: true
    })
  );

});
