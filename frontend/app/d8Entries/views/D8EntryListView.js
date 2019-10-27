// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/views/ListView'
], function(
  _,
  t,
  ListView
) {
  'use strict';

  function tdAttrs(row, column, propName1, propName2)
  {
    var observer = row.observer;

    if (observer
      && observer.notify
      && observer.changes
      && (observer.changes[propName1 || column.id] || observer.changes[propName2]))
    {
      return {
        className: ['is-changed']
      };
    }

    return {};
  }

  return ListView.extend({

    className: 'd8Entries-list is-clickable',

    serializeColumns: function()
    {
      var stripsTdAttrs = _.partial(tdAttrs, _, _, 'strips');

      return [
        {id: 'rid', className: 'is-min is-number'},
        {id: 'status', valueProperty: 'statusText', className: 'is-min', tdAttrs: tdAttrs},
        {id: 'entrySource', className: 'is-min', tdAttrs: tdAttrs},
        {id: 'stripNos', className: 'is-min', tdAttrs: stripsTdAttrs, label: this.t('PROPERTY:strips.no')},
        {id: 'stripFamilies', className: 'is-min', tdAttrs: stripsTdAttrs, label: this.t('PROPERTY:strips.family')},
        {id: 'subject', tdAttrs: tdAttrs},
        {id: 'problemSource', tdAttrs: tdAttrs},
        {id: 'team', tdAttrs: _.partial(tdAttrs, _, _, 'owner', 'members')},
        {id: 'crsRegisterDate', className: 'is-min', tdAttrs: tdAttrs, label: this.t('LIST:crsRegisterDate')},
        {id: 'd5PlannedCloseDate', className: 'is-min', tdAttrs: tdAttrs, label: this.t('LIST:d5PlannedCloseDate')},
        {id: 'd5CloseDate', className: 'is-min', tdAttrs: tdAttrs, label: this.t('LIST:d5CloseDate')},
        {id: 'd8CloseDate', className: 'is-min', tdAttrs: tdAttrs, label: this.t('LIST:d8CloseDate')}
      ];
    },

    serializeActions: function()
    {
      var view = this;
      var collection = view.collection;

      return function(row)
      {
        var model = collection.get(row._id);
        var attachment = model.get('attachment');
        var actions = [ListView.actions.viewDetails(model), {
          id: 'download',
          icon: 'download',
          label: view.t('LIST:ACTION:download'),
          href: attachment ? ('/d8/' + model.id + '/attachments/' + attachment._id + '?download=1') : '/',
          disabled: !!attachment
        }];

        if (model.canEdit())
        {
          actions.push(ListView.actions.edit(model));
        }

        if (model.canDelete())
        {
          actions.push(ListView.actions.delete(model));
        }

        return actions;
      };
    },

    afterRender: function()
    {
      ListView.prototype.afterRender.call(this);

      var view = this;

      this.$el.popover({
        selector: '.list-item > td',
        container: this.el,
        trigger: 'hover',
        placement: 'auto right',
        html: true,
        content: function()
        {
          var model = view.collection.get(this.parentNode.dataset.id);

          if (this.dataset.id === 'team')
          {
            return view.serializeTeamPopoverContent(model);
          }

          if (this.dataset.id === 'subject')
          {
            return view.serializeSubjectPopoverContent(model);
          }

          return undefined;
        }
      });
    },

    serializeTeamPopoverContent: function(entry)
    {
      var team = entry.get('team');

      if (team.length <= 1)
      {
        return undefined;
      }

      var html = '<ul class="d8Entries-list-team">';

      for (var i = 0; i < team.length; ++i)
      {
        html += '<li>' + team[i].rendered;
      }

      html += '</ul>';

      return html;
    },

    serializeSubjectPopoverContent: function(entry)
    {
      var problemDescription = entry.get('problemDescription');

      if (_.isEmpty(problemDescription))
      {
        return undefined;
      }

      return problemDescription;
    }

  });
});
