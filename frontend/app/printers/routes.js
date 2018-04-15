// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './Printer',
  'i18n!app/nls/printers'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  Printer
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/printers', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/printers/PrinterCollection'
      ],
      function(ListPage, PrinterCollection)
      {
        return new ListPage({
          collection: new PrinterCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: 'name', className: 'is-min'},
            'label'
          ]
        });
      }
    );
  });

  router.map('/printers/:id', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/printers/templates/details'
      ],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          model: new Printer({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/printers;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/printers/views/PrinterFormView'
      ],
      function(AddFormPage, PrinterFormView)
      {
        return new AddFormPage({
          FormView: PrinterFormView,
          model: new Printer()
        });
      }
    );
  });

  router.map('/printers/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/printers/views/PrinterFormView'
      ],
      function(EditFormPage, PrinterFormView)
      {
        return new EditFormPage({
          FormView: PrinterFormView,
          model: new Printer({_id: req.params.id})
        });
      }
    );
  });

  router.map('/printers/:id;delete', canManage, showDeleteFormPage.bind(null, Printer));
});
