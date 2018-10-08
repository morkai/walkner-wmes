// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/View',
  '../core/util/showDeleteFormPage'
], function(
  _,
  router,
  viewport,
  user,
  View,
  showDeleteFormPage
) {
  'use strict';

  var nls = 'i18n!app/nls/pkhdStrategies';
  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/pkhdStrategies', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/pkhdStrategies/PkhdStrategyCollection',
        'app/pkhdStrategies/views/PkhdStrategyFilterView',
        'app/pkhdStrategies/views/PkhdStrategyListView',
        nls
      ],
      function(FilteredListPage, PkhdStrategyCollection, FilterView, ListView)
      {
        return new FilteredListPage({
          FilterView: FilterView,
          ListView: ListView,
          collection: new PkhdStrategyCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/pkhdStrategies/:id', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/pkhdStrategies/PkhdStrategy',
        'app/pkhdStrategies/templates/details',
        nls
      ],
      function(DetailsPage, PkhdStrategy, template)
      {
        return new DetailsPage({
          detailsTemplate: template,
          model: new PkhdStrategy({_id: req.params.id})
        });
      }
    );
  });

  router.map('/pkhdStrategies;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/pkhdStrategies/PkhdStrategy',
        'app/pkhdStrategies/views/PkhdStrategyFormView',
        nls
      ],
      function(AddFormPage, PkhdStrategy, FormView)
      {
        return new AddFormPage({
          FormView: FormView,
          model: new PkhdStrategy()
        });
      }
    );
  });

  router.map('/pkhdStrategies/:id;edit', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/pkhdStrategies/PkhdStrategy',
        'app/pkhdStrategies/views/PkhdStrategyFormView',
        nls
      ],
      function(EditFormPage, PkhdStrategy, FormView)
      {
        return new EditFormPage({
          FormView: FormView,
          model: new PkhdStrategy({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/pkhdStrategies/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/pkhdStrategies/PkhdStrategy', _, _, {})
  );
});
