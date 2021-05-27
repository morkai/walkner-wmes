// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/util/idAndLabel',
  '../KanbanSettingCollection',
  'app/kanban/templates/filters/numeric',
  'app/kanban/templates/filters/text',
  'app/kanban/templates/filters/select'
], function(
  _,
  idAndLabel,
  KanbanSettingCollection,
  numericFilterTemplate,
  textFilterTemplate,
  selectFilterTemplate
) {
  'use strict';

  return {

    numeric: {
      type: 'numeric',
      template: numericFilterTemplate,
      handler: function(cell, $filter)
      {
        var view = this;
        var $data = $filter.find('.form-control');
        var oldData = (view.model.tableView.getFilter(cell.columnId) || {data: ''}).data;

        $data.val(oldData).on('input', function()
        {
          this.setCustomValidity('');
        });

        $filter.find('.btn[data-action="clear"]').on('click', function()
        {
          view.handleFilterValue(cell.columnId);
        });

        $filter.find('form').on('submit', function()
        {
          var newData = $data.val()
            .trim()
            .replace(/and/ig, '&&')
            .replace(/or/ig, '||');

          if (newData === '')
          {
            return view.handleFilterValue(cell.columnId);
          }

          if (newData === '?')
          {
            return view.handleFilterValue(cell.columnId, 'empty', '?');
          }

          if (newData === '!')
          {
            return view.handleFilterValue(cell.columnId, 'notEmpty', '!');
          }

          if (/^[0-9]+$/.test(newData))
          {
            return view.handleFilterValue(cell.columnId, 'numeric', newData);
          }

          var code = newData;

          if (newData.indexOf('$$') === -1)
          {
            if (newData.indexOf('$') === -1)
            {
              code = '$' + code;
            }

            code = code
              .replace(/=+/g, '=')
              .replace(/([^<>])=/g, '$1==')
              .replace(/<>/g, '!=');
          }

          try
          {
            var o = view.model.entries.at(0).serialize(view.model);
            var v = cell.arrayIndex >= 0 ? o[cell.columnId][cell.arrayIndex] : o[cell.columnId];
            var result = eval( // eslint-disable-line no-eval
              '(function($, $$) { return ' + code + '; })(' + JSON.stringify(v) + ', ' + JSON.stringify(o) + ');'
            );

            if (typeof result !== 'boolean')
            {
              throw new Error('Invalid result type. Expected boolean, got ' + typeof result + '.');
            }
          }
          catch (err)
          {
            console.error(err);

            $data[0].setCustomValidity(view.t('filters:invalid'));

            view.timers.revalidate = setTimeout(function() { $filter.find('.btn-primary').click(); }, 1);

            return false;
          }

          return view.handleFilterValue(cell.columnId, 'numeric', newData);
        });
      }
    },
    text: {
      type: 'text',
      template: textFilterTemplate,
      handler: function(cell, $filter)
      {
        var view = this;
        var $data = $filter.find('.form-control');
        var oldData = (view.model.tableView.getFilter(cell.columnId) || {data: ''}).data;

        $data.val(oldData).on('input', function()
        {
          this.setCustomValidity('');
        });

        $filter.find('.btn[data-action="clear"]').on('click', function()
        {
          view.handleFilterValue(cell.columnId);
        });

        $filter.find('form').on('submit', function()
        {
          var newData = $data.val().trim();

          if (cell.column.prepareFilter)
          {
            newData = cell.column.prepareFilter(newData, cell);

            $data.val(newData);
          }

          if (newData === '')
          {
            return view.handleFilterValue(cell.columnId);
          }

          if (newData === '?')
          {
            return view.handleFilterValue(cell.columnId, 'empty', '?');
          }

          if (newData === '!')
          {
            return view.handleFilterValue(cell.columnId, 'notEmpty', '!');
          }

          if (!/^\/.*?\/$/.test(newData) && newData.indexOf('$$') === -1)
          {
            if (!newData.replace(/[^A-Za-z0-9]+/g, '').length)
            {
              $data[0].setCustomValidity(view.t('filters:invalid'));

              view.timers.revalidate = setTimeout(function() { $filter.find('.btn-primary').click(); }, 1);

              return false;
            }

            return view.handleFilterValue(cell.columnId, 'text', newData);
          }

          var code = newData + (newData.indexOf('$$') === -1 ? 'i.test($)' : '');

          try
          {
            var o = view.model.entries.at(0).serialize(view.model);
            var v = cell.arrayIndex >= 0 ? o[cell.columnId][cell.arrayIndex] : o[cell.columnId];
            var result = eval( // eslint-disable-line no-eval
              '(function($, $$) { return ' + code + '; })(' + JSON.stringify(v) + ', ' + JSON.stringify(o) + ');'
            );

            if (typeof result !== 'boolean')
            {
              throw new Error('Invalid result type. Expected boolean, got ' + typeof result + '.');
            }
          }
          catch (err)
          {
            console.error(err);

            $data[0].setCustomValidity(view.t('filters:invalid'));

            view.timers.revalidate = setTimeout(function() { $filter.find('.btn-primary').click(); }, 1);

            return false;
          }

          return view.handleFilterValue(cell.columnId, 'text', newData);
        });
      }
    },
    select: function(cell, $filter, options, multiple)
    {
      var view = this;
      var $data = $filter.find('.form-control').prop('multiple', multiple !== false);
      var oldData = (view.model.tableView.getFilter(cell.columnId) || {data: []}).data;

      $filter.find('select').html(options.map(function(option)
      {
        return '<option value="' + option.id + '" ' + (_.includes(oldData, option.id) ? 'selected' : '') + '>'
          + _.escape(option.text)
          + '</option>';
      }).join(''));

      $filter.find('.btn[data-action="clear"]').on('click', function()
      {
        view.handleFilterValue(cell.columnId);
      });

      $filter.find('form').on('submit', function()
      {
        var newData = $data.val();

        if (!Array.isArray(newData))
        {
          newData = [newData];
        }

        return view.handleFilterValue(
          cell.columnId,
          'select',
          newData.length === 0 ? null : newData
        );
      });
    },
    _id: 'text',
    storingPosition: 'text',
    kanbanQtyUser: 'numeric',
    componentQty: 'numeric',
    componentQtyJit: 'numeric',
    kanbanId: 'text',
    kanbanIdCount: 'numeric',
    lineCount: 'numeric',
    emptyFullCount: 'numeric',
    stock: 'numeric',
    maxBinQty: 'numeric',
    minBinQty: 'numeric',
    replenQty: 'numeric',
    storageType: 'numeric',
    nc12: 'text',
    description: 'text',
    storageBin: 'text',
    kanbanStorageBin: 'text',
    comment: 'text',
    unit: 'text',
    supplyArea: {
      type: 'select-multi',
      template: selectFilterTemplate,
      handler: function(cell, $filter)
      {
        this.filters.select.call(this, cell, $filter, this.model.supplyAreas.getNames());
      }
    },
    workCenter: {
      type: 'select-multi',
      template: selectFilterTemplate,
      handler: function(cell, $filter)
      {
        var options = [{id: '', text: this.t('filters:value:empty')}].concat(
          this.model.supplyAreas.getWorkCenters([])
        );

        this.filters.select.call(this, cell, $filter, options);
      }
    },
    family: {
      type: 'select-multi',
      template: selectFilterTemplate,
      handler: function(cell, $filter)
      {
        var options = [{id: '', text: this.t('filters:value:empty')}].concat(
          this.model.supplyAreas.getFamilies([])
        );

        this.filters.select.call(this, cell, $filter, options);
      }
    },
    kind: {
      type: 'select-multi',
      template: selectFilterTemplate,
      handler: function(cell, $filter)
      {
        this.filters.select.call(
          this,
          cell,
          $filter,
          [
            {id: '', text: this.t('filters:value:empty')},
            {id: 'kk', text: this.t('kind:kk')},
            {id: 'pk', text: this.t('kind:pk')}
          ]
        );
      }
    },
    container: {
      type: 'select-multi',
      template: selectFilterTemplate,
      handler: function(cell, $filter)
      {
        this.filters.select.call(
          this,
          cell,
          $filter,
          [{id: '', text: this.t('filters:value:empty')}].concat(this.model.containers.map(idAndLabel))
        );
      }
    },
    workstations: {
      type: 'select-one',
      template: selectFilterTemplate,
      handler: function(cell, $filter)
      {
        this.filters.select.call(
          this,
          cell,
          $filter,
          [
            {id: 'valid', text: this.t('filters:value:valid')},
            {id: 'invalid', text: this.t('filters:value:invalid')}
          ],
          false
        );
      }
    },
    locations: 'workstations',
    discontinued: {
      type: 'select-one',
      template: selectFilterTemplate,
      handler: function(cell, $filter)
      {
        this.filters.select.call(
          this,
          cell,
          $filter,
          [
            {id: 'true', text: this.t('core', 'BOOL:true')},
            {id: 'false', text: this.t('core', 'BOOL:false')}
          ],
          false
        );
      }
    },
    markerColor: {
      type: 'select-multi',
      template: selectFilterTemplate,
      handler: function(cell, $filter)
      {
        this.filters.select.call(
          this,
          cell,
          $filter,
          [{id: '', text: this.t('filters:value:empty')}].concat(KanbanSettingCollection.getMarkerColors())
        );
      }
    }

  };
});
