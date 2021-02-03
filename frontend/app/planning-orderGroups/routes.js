// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../router',
  '../viewport',
  '../user',
  '../time',
  '../core/util/showDeleteFormPage'
], function(
  _,
  t,
  router,
  viewport,
  user,
  time,
  showDeleteFormPage
) {
  'use strict';

  var nls = 'i18n!app/nls/planning-orderGroups';
  var model = 'app/planning-orderGroups/OrderGroup';
  var canView = user.auth('PLANNING:VIEW', 'FN:process-engineer');
  var canManage = user.auth('PLANNING:MANAGE', 'FN:process-engineer');

  function baseBreadcrumb()
  {
    return !user.isAllowedTo('PLANNING:VIEW') ? [] : [
      {href: '#planning/plans', label: this.t('BREADCRUMB:base')}
    ];
  }

  router.map('/planning/orderGroups', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/planning-orderGroups/OrderGroupCollection',
        'app/planning-orderGroups/views/FilterView',
        'app/planning-orderGroups/views/ListView',
        nls
      ],
      function(FilteredListPage, Collection, FilterView, ListView)
      {
        return new FilteredListPage({
          FilterView: FilterView,
          ListView: ListView,
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          collection: new Collection(null, {rqlQuery: req.rql}),
          actions: function()
          {
            var actions = FilteredListPage.prototype.actions.apply(this, arguments);

            actions.unshift({
              icon: 'question',
              href: '#planning/orderGroups;tester',
              label: this.t('tester:pageAction')
            });

            return actions;
          }
        });
      }
    );
  });

  router.map('/planning/orderGroups;tester', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/Model',
        'app/planning-orderGroups/pages/TesterPage',
        'css!app/planning-orderGroups/assets/tester',
        nls
      ],
      function(Model, TesterPage)
      {
        return new TesterPage({
          model: new Model({
            date: req.query.date || time.getMoment().format('YYYY-MM-DD'),
            mrp: req.query.mrp || 'TEST',
            groups: []
          })
        });
      }
    );
  });

  router.map('/planning/orderGroups/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        model,
        'app/planning-orderGroups/templates/details',
        'css!app/planning-orderGroups/assets/details',
        nls
      ],
      function(DetailsPage, Model, detailsTemplate)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          model: new Model({_id: req.params.id}),
          detailsTemplate,
          actions: function()
          {
            const actions = DetailsPage.prototype.actions.apply(this, arguments);
            const editI = actions.findIndex(a => a.id === 'edit');

            if (editI !== -1)
            {
              actions.splice(editI + 1, 0, {
                id: 'copy',
                icon: 'copy',
                label: this.t('PAGE:ACTION:copy'),
                href: `#planning/orderGroups;add?copy=${this.model.id}`
              });
            }

            return actions;
          }
        });
      }
    );
  });

  router.map('/planning/orderGroups;add', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        model,
        'app/planning-orderGroups/views/FormView',
        nls
      ],
      function(AddFormPage, Model, FormView)
      {
        const model = new Model({_id: req.query.copy});

        if (model.id)
        {
          model.once('sync', () =>
          {
            model.set({
              _id: undefined,
              name: model.get('name') + ' ' + t('planning-orderGroups', 'FORM:copySuffix')
            });
          });
        }

        return new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: model
        });
      }
    );
  });

  router.map('/planning/orderGroups/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        model,
        'app/planning-orderGroups/views/FormView',
        nls
      ],
      function(EditFormPage, Model, FormView)
      {
        return new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new Model({_id: req.params.id})
        });
      }
    );
  });

  router.map('/planning/orderGroups/:id;delete', canManage, _.partial(showDeleteFormPage, model, _, _, {
    baseBreadcrumb: baseBreadcrumb
  }));
});
