// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/views/ListView',
  'app/data/aors',
  'app/data/downtimeReasons',
  'app/prodShifts/ProdShift',
  'app/prodShiftOrders/ProdShiftOrder',
  'app/prodDowntimes/ProdDowntime',
  'app/core/templates/userInfo',
  'app/prodChangeRequests/templates/detailsRow',
  'app/prodChangeRequests/templates/quantitiesDone'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  ListView,
  aors,
  downtimeReasons,
  ProdShift,
  ProdShiftOrder,
  ProdDowntime,
  renderUserInfo,
  renderDetailsRow,
  renderQuantitiesDone
) {
  'use strict';

  var TYPE_TO_MODEL = {
    shift: ProdShift,
    order: ProdShiftOrder,
    downtime: ProdDowntime
  };
  var COMMON_PROPERTIES = ['date', 'shift', 'master', 'leader', 'operator'];
  var TYPE_TO_PROPERTIES = {
    shift: ['quantitiesDone'],
    order: ['orderId', 'operationNo', 'quantityDone', 'workerCount', 'startedAt', 'finishedAt'],
    downtime: ['reason', 'aor', 'reasonComment', 'startedAt', 'finishedAt']
  };
  var TYPE_TO_NLS_DOMAIN = {
    shift: 'prodShifts',
    order: 'prodShiftOrders',
    downtime: 'prodDowntimes'
  };

  return ListView.extend({

    className: function()
    {
      return this.collection.isNewStatus() ? '' : 'is-colored';
    },

    remoteTopics: {
      'prodChangeRequests.**': function()
      {
        if (this.showingDetails)
        {
          this.requiresRefresh = true;
        }
        else
        {
          this.refreshCollection();
        }
      }
    },

    events: {
      'click .list-item[data-id]': function(e)
      {
        if (e.target.tagName !== 'A' && !this.el.classList.contains('is-loading'))
        {
          this.toggleDetails(e.currentTarget.dataset.id);
        }
      },
      'click #-accept': function(e)
      {
        this.confirm(e.currentTarget.dataset.id, 'accepted');
      },
      'click #-reject': function(e)
      {
        this.confirm(e.currentTarget.dataset.id, 'rejected');
      }
    },

    initialize: function()
    {
      ListView.prototype.initialize.apply(this, arguments);

      this.requiresRefresh = false;
      this.showingDetails = false;
      this.$errorMessage = null;
    },

    destroy: function()
    {
      ListView.prototype.destroy.apply(this, arguments);

      this.hideErrorMessage();
    },

    afterRender: function()
    {
      ListView.prototype.afterRender.apply(this, arguments);

      this.requiresRefresh = false;
      this.showingDetails = false;

      this.hideErrorMessage();
    },

    serializeColumns: function()
    {
      var isNewStatus = this.collection.isNewStatus();

      var columns = [
        {id: 'division', className: 'is-min'},
        {id: 'prodLine', className: 'is-min'},
        {id: 'operation', className: isNewStatus ? 'is-min' : ''},
        'creatorComment',
        {id: 'creator', className: 'is-min'},
        {id: 'createdAt', className: 'is-min'}
      ];

      if (!isNewStatus)
      {
        columns.push(
          'confirmerComment',
          {id: 'confirmer', className: 'is-min'},
          {id: 'confirmedAt', className: 'is-min'}
        );
      }

      return columns;
    },

    serializeActions: function()
    {
      return null;
    },

    serializeRows: function()
    {
      var view = this;

      return this.collection.map(function(model)
      {
        var confirmedAt = model.get('confirmedAt');
        var confirmer = model.get('confirmer');
        var status = model.get('status');
        var statusClassName = status === 'accepted' ? 'success' : status === 'rejected' ? 'danger' : '';

        return {
          _id: model.id,
          className: 'prodChangeRequests-list-item ' + statusClassName,
          division: model.get('division'),
          prodLine: model.get('prodLine'),
          operation: view.serializeOperation(model),
          createdAt: time.format(model.get('createdAt'), 'LLL'),
          creator: renderUserInfo({userInfo: model.get('creator')}),
          creatorComment: model.get('creatorComment') || '-',
          confirmedAt: confirmedAt ? time.format(model.get('confirmedAt'), 'LLL') : '-',
          confirmer: confirmer ? renderUserInfo({userInfo: confirmer}) : '-',
          confirmerComment: model.get('confirmerComment') || '-'
        };
      });
    },

    serializeOperation: function(changeRequest)
    {
      var status = changeRequest.get('status');
      var modelType = changeRequest.get('modelType');
      var data = changeRequest.get('data');
      var operation = changeRequest.get('operation');
      var model = new TYPE_TO_MODEL[modelType](_.extend({_id: changeRequest.get('modelId')}, data));
      var extra = '?';
      var href = operation === 'add' || (operation === 'delete' && status !== 'new') ? null : model.genClientUrl();

      switch (modelType)
      {
        case 'shift':
          extra = t('core', 'SHIFT', {
            date: time.format(data.date, 'YYYY-MM-DD'),
            shift: t('core', 'SHIFT:' + data.shift)
          });
          break;

        case 'order':
          extra = model.getLabel();
          break;

        case 'downtime':
        {
          if (operation === 'add')
          {
            var reason = model.get('reason');
            var downtimeReason = downtimeReasons.get(reason);

            extra = downtimeReason ? downtimeReason.getLabel() : reason;
          }
          else
          {
            extra = model.get('rid');
          }

          break;
        }
      }

      var text = t('prodChangeRequests', 'operation:' + operation + ':' + modelType, {extra: extra});

      if (href)
      {
        return '<a href="' + href + '">' + text + '</a>';
      }

      return text;
    },

    toggleDetails: function(changeRequestId)
    {
      var $rowToExpand = this.$('.list-item[data-id="' + changeRequestId + '"]');
      var $expandedRow = this.$('.is-expanded');

      this.collapseDetails($expandedRow);

      if ($rowToExpand[0] === $expandedRow[0])
      {
        if (this.requiresRefresh)
        {
          this.refreshCollectionNow();
        }
      }
      else
      {
        this.expandDetails(changeRequestId, $rowToExpand);
      }
    },

    collapseDetails: function($expandedRow)
    {
      $expandedRow.removeClass('is-expanded').next().remove();
    },

    expandDetails: function(changeRequestId, $rowToExpand)
    {
      var changeRequest = this.collection.get(changeRequestId);

      if (changeRequest.get('status') !== 'new')
      {
        return;
      }

      var $detailsRow = $(renderDetailsRow({
        idPrefix: this.idPrefix,
        showForm: changeRequest.get('status') === 'new' && this.isCurrentUserAllowedToConfirm(changeRequest),
        changeRequestId: changeRequestId,
        isEdit: changeRequest.get('operation') === 'edit',
        changes: this.serializeChanges(changeRequest)
      }));

      $detailsRow.insertAfter($rowToExpand);
      $rowToExpand.addClass('is-expanded');

      $detailsRow.find('textarea').focus();

      this.showingDetails = true;
    },

    isCurrentUserAllowedToConfirm: function(changeRequest)
    {
      if (!user.isAllowedTo('PROD_DATA:MANAGE', 'PROD_DATA:CHANGES:MANAGE'))
      {
        return false;
      }

      var userDivision = user.getDivision();

      return !userDivision || userDivision.id === changeRequest.get('division');
    },

    serializeChanges: function(changeRequest)
    {
      var changes = [];
      var operation = changeRequest.get('operation');

      if (operation === 'delete' || changeRequest.get('status') !== 'new')
      {
        return changes;
      }

      var modelType = changeRequest.get('modelType');
      var nlsDomain = TYPE_TO_NLS_DOMAIN[modelType];
      var properties = [].concat(COMMON_PROPERTIES, TYPE_TO_PROPERTIES[modelType]);
      var oldData = changeRequest.get('prodModel');
      var newData = changeRequest.get('data');
      var view = this;

      _.forEach(properties, function(propertyName)
      {
        var oldValue = oldData ? oldData[propertyName] : null;
        var newValue = newData[propertyName];

        if (operation === 'edit' && _.isEqual(oldValue, newValue))
        {
          return;
        }

        var property = t(nlsDomain, 'PROPERTY:' + propertyName);

        if (propertyName === 'quantitiesDone')
        {
          changes.push({
            property: property,
            value: renderQuantitiesDone({
              oldQuantitiesDone: oldValue,
              newQuantitiesDone: newValue
            })
          });
        }
        else
        {
          changes.push({
            property: property,
            oldValue: view.serializeProperty(propertyName, oldValue),
            newValue: view.serializeProperty(propertyName, newValue)
          });
        }
      });

      return changes;
    },

    serializeProperty: function(propertyName, value)
    {
      if (value === null || value === undefined || value === '')
      {
        return '-';
      }

      switch (propertyName)
      {
        case 'master':
        case 'leader':
        case 'operator':
          return renderUserInfo({userInfo: value});

        case 'date':
          return time.format(value, 'LL');

        case 'shift':
          return t('core', 'SHIFT:' + value);

        case 'startedAt':
        case 'finishedAt':
          return time.format(value, 'LLLL');

        case 'reason':
        {
          var downtimeReason = downtimeReasons.get(value);

          return downtimeReason ? downtimeReason.getLabel() : value;
        }

        case 'aor':
        {
          var aor = aors.get(value);

          return aor ? aor.getLabel() : value;
        }
      }

      if (typeof value === 'number')
      {
        return value.toLocaleString();
      }

      return String(value);
    },

    confirm: function(changeRequestId, newStatus)
    {
      var changeRequest = this.collection.get(changeRequestId);

      if (!changeRequest)
      {
        return;
      }

      var $el = this.$el.addClass('is-loading');
      var $fields = this.$('.prodChangeRequests-details').find('.form-control, .btn').prop('disabled', true);
      var view = this;
      var req = changeRequest.save({
        status: newStatus,
        confirmerComment: this.$id('confirmerComment').val().trim()
      }, {
        method: 'POST'
      });

      req.done(function()
      {
        $el.removeClass('is-loading');

        view.requiresRefresh = true;
        view.toggleDetails(changeRequestId);

        viewport.msg.show({
          type: 'success',
          time: 2500,
          text: t('prodChangeRequests', 'confirm:success:' + newStatus)
        });
      });

      req.fail(function(jqXhr)
      {
        var nlsDomain = TYPE_TO_NLS_DOMAIN[changeRequest.get('modelType')];
        var error = jqXhr.responseJSON ? jqXhr.responseJSON.error.message : null;

        if (t.has('prodChangeRequests', 'confirm:error:' + error))
        {
          error = t('prodChangeRequests', 'confirm:error:' + error);
        }
        else if (t.has(nlsDomain, 'FORM:ERROR:' + error))
        {
          error = t(nlsDomain, 'FORM:ERROR:' + error);
        }
        else
        {
          error = t('prodChangeRequests', 'confirm:error');
        }

        view.showErrorMessage(error);

        $fields.prop('disabled', false);
        $el.removeClass('is-loading');
      });
    },

    showErrorMessage: function(text)
    {
      this.hideErrorMessage();

      this.$errorMessage = viewport.msg.show({
        type: 'error',
        time: 5000,
        text: text
      });
    },

    hideErrorMessage: function()
    {
      if (this.$errorMessage)
      {
        viewport.msg.hide(this.$errorMessage);
        this.$errorMessage = null;
      }
    }

  });
});
