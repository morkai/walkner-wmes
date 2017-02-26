// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

  function prepareTdAttrs(row, className, propName1, propName2)
  {
    /*jshint validthis:true*/

    var classNames = '';

    if (className)
    {
      classNames += ' ' + className;
    }

    var observer = row.observer;

    if (observer
      && observer.notify
      && observer.changes
      && (observer.changes[propName1 || this.id] || observer.changes[propName2]))
    {
      classNames += ' is-changed';
    }

    return 'class="' + classNames + '"';
  }

  return ListView.extend({

    className: 'd8Entries-list is-clickable',

    serializeColumns: function()
    {
      var minTdAttrs = _.partial(prepareTdAttrs, _, 'is-min');
      var stripsTdAttrs = _.partial(prepareTdAttrs, _, 'is-min', 'strips');

      return [
        {id: 'rid', className: 'is-min is-number'},
        {id: 'statusText', tdAttrs: minTdAttrs, label: t('d8Entries', 'PROPERTY:status')},
        {id: 'entrySource', tdAttrs: minTdAttrs},
        {id: 'stripNos', tdAttrs: stripsTdAttrs, label: t('d8Entries', 'PROPERTY:strips.no')},
        {id: 'stripFamilies', tdAttrs: stripsTdAttrs, label: t('d8Entries', 'PROPERTY:strips.family')},
        {id: 'problemDescription', tdAttrs: prepareTdAttrs},
        {id: 'problemSource', tdAttrs: prepareTdAttrs},
        {id: 'team', tdAttrs: _.partial(prepareTdAttrs, _, null, 'owner', 'members')},
        {id: 'crsRegisterDate', tdAttrs: minTdAttrs, label: t('d8Entries', 'LIST:crsRegisterDate')},
        {id: 'd5PlannedCloseDate', tdAttrs: minTdAttrs, label: t('d8Entries', 'LIST:d5PlannedCloseDate')},
        {id: 'd5CloseDate', tdAttrs: minTdAttrs, label: t('d8Entries', 'LIST:d5CloseDate')},
        {id: 'd8CloseDate', tdAttrs: minTdAttrs, label: t('d8Entries', 'LIST:d8CloseDate')}
      ];
    },

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
      {
        var model = collection.get(row._id);
        var attachment = model.get('attachment');
        var actions = [ListView.actions.viewDetails(model), {
          id: 'download',
          icon: 'download',
          label: t('d8', 'LIST:ACTION:download'),
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
    }

  });
});
