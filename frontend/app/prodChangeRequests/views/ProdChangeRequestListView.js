// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
  'app/data/orgUnits',
  'app/data/companies',
  'app/data/prodFunctions',
  'app/prodShifts/ProdShift',
  'app/prodShifts/views/ProdShiftTimelineView',
  'app/prodShiftOrders/ProdShiftOrder',
  'app/prodShiftOrders/ProdShiftOrderCollection',
  'app/prodDowntimes/ProdDowntime',
  'app/prodDowntimes/ProdDowntimeCollection',
  'app/fte/FteMasterEntry',
  'app/fte/FteLeaderEntry',
  'app/fte/FteWhEntry',
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
  orgUnits,
  companies,
  prodFunctions,
  ProdShift,
  ProdShiftTimelineView,
  ProdShiftOrder,
  ProdShiftOrderCollection,
  ProdDowntime,
  ProdDowntimeCollection,
  FteMasterEntry,
  FteLeaderEntry,
  FteWhEntry,
  renderUserInfo,
  renderDetailsRow,
  renderQuantitiesDone
) {
  'use strict';

  var TYPE_TO_MODEL = {
    shift: ProdShift,
    order: ProdShiftOrder,
    downtime: ProdDowntime,
    fteMaster: FteMasterEntry,
    fteLeader: FteLeaderEntry
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
    downtime: 'prodDowntimes',
    fteMaster: 'fte',
    fteLeader: 'fte'
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
      },
      'prodShiftOrders.**': 'handleProdModelChange',
      'prodDowntimes.**': 'handleProdModelChange'
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

      this.timelineView = null;
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
        {id: 'orgUnit', className: 'is-min'},
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
          orgUnit: view.serializeOrgUnit(model),
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

    serializeOrgUnit: function(changeRequest)
    {
      if (changeRequest.isFte())
      {
        var subdivision = orgUnits.getByTypeAndId('subdivision', changeRequest.get('data').subdivision);

        return subdivision ? subdivision.getLabel() : '?';
      }

      return changeRequest.get('prodLine');
    },

    serializeOperation: function(changeRequest)
    {
      var status = changeRequest.get('status');
      var modelType = changeRequest.get('modelType');
      var data = changeRequest.get('data');
      var operation = changeRequest.get('operation');
      var model = new TYPE_TO_MODEL[modelType](_.assign({_id: changeRequest.get('modelId')}, data));
      var extra = '?';
      var href = operation === 'add' || (operation === 'delete' && status !== 'new') ? null : model.genClientUrl();

      switch (modelType)
      {
        case 'shift':
          extra = t('core', 'SHIFT', {
            date: time.format(data.date, 'L'),
            shift: t('core', 'SHIFT:' + data.shift)
          });
          break;

        case 'order':
          extra = model.getLabel(false);
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

        case 'fteMaster':
        case 'fteLeader':
        {
          var dateMoment = time.getMoment(data.date);
          var hours = dateMoment.hours();

          extra = t('core', 'SHIFT', {
            date: dateMoment.format('L'),
            shift: t('core', 'SHIFT:' + (hours === 6 ? 1 : hours === 14 ? 2 : 3))
          });

          break;
        }
      }

      if (modelType === 'fteLeader' && changeRequest.get('division') === FteWhEntry.WH_DIVISION)
      {
        modelType = 'fteWh';
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
      this.removeView('.prodChangeRequests-timeline');
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
        isFte: changeRequest.isFte(),
        changes: this.serializeChanges(changeRequest)
      }));

      $detailsRow.insertAfter($rowToExpand);
      $rowToExpand.addClass('is-expanded');

      this.showingDetails = true;

      this.loadTimeline(changeRequest);
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
      if (changeRequest.get('operation') === 'delete' || changeRequest.get('status') !== 'new')
      {
        return [];
      }

      if (changeRequest.isFte())
      {
        return this.serializeFteChanges(changeRequest);
      }

      return this.serializePropertyChanges(changeRequest);
    },

    serializePropertyChanges: function(changeRequest)
    {
      var changes = [];
      var operation = changeRequest.get('operation');
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
          var change = {
            property: property,
            oldValue: view.serializeProperty(propertyName, oldValue),
            newValue: view.serializeProperty(propertyName, newValue)
          };

          if (change.oldValue !== change.newValue)
          {
            changes.push(change);
          }
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

    serializeFteChanges: function(changeRequest)
    {
      var changes = {};
      var task = null;

      _.forEach(changeRequest.get('data').changes, function(change)
      {
        task = changes[change.taskId];

        if (!task)
        {
          task = changes[change.taskId] = {
            id: change.taskId,
            name: change.taskName,
            values: []
          };
        }

        var prodFunction = prodFunctions.get(change.functionId);
        var company = companies.get(change.companyId);
        var division = orgUnits.getByTypeAndId('division', change.divisionId);

        task.values.push({
          kind: change.kind || (change.demand ? 'demand' : 'supply'),
          function: prodFunction ? prodFunction.getLabel() : change.functionId,
          company: company ? company.getLabel() : change.companyId,
          division: division ? division.getLabel() : null,
          old: change.oldValue.toLocaleString(),
          new: change.newValue.toLocaleString()
        });
      });

      return _.values(changes);
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
        method: 'POST',
        wait: true
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
    },

    loadTimeline: function(changeRequest)
    {
      var view = this;
      var modelType = changeRequest.get('modelType');
      var $timeline = this.$('.prodChangeRequests-timeline');

      this.cancelRequests();

      if (changeRequest.isFte() || (changeRequest.get('operation') === 'add' && modelType === 'shift'))
      {
        return $timeline.remove();
      }

      this.resolveProdShift(changeRequest, function(prodShift)
      {
        if (!prodShift || !prodShift.id)
        {
          return $timeline.removeClass('progress-bar-primary active').addClass('progress-bar-danger');
        }

        var prodShiftOrders = new ProdShiftOrderCollection(null, {
          rqlQuery: 'sort(startedAt)&prodShift=' + prodShift.id
        });
        var prodDowntimes = new ProdDowntimeCollection(null, {
          rqlQuery: 'sort(startedAt)&prodShift=' + prodShift.id
        });

        var req = $.when(
          view.promised(prodShiftOrders.fetch({reset: true})),
          view.promised(prodDowntimes.fetch({reset: true}))
        );

        req.fail(function()
        {
          $timeline.removeClass('progress-bar-primary active').addClass('progress-bar-danger');
        });

        req.done(function()
        {
          if (changeRequest.get('operation') === 'add')
          {
            if (changeRequest.get('modelType') === 'order')
            {
              prodShiftOrders.add(changeRequest.get('data'));
            }
            else
            {
              prodDowntimes.add(changeRequest.get('data'));
            }
          }

          view.renderTimeline(prodShift, prodShiftOrders, prodDowntimes, changeRequest);
        });
      });
    },

    resolveProdShift: function(changeRequest, done)
    {
      var modelType = changeRequest.get('modelType');
      var prodModel = changeRequest.get('prodModel');
      var data = changeRequest.get('data');

      if (modelType === 'shift')
      {
        return done(new ProdShift(prodModel));
      }

      var prodShift = new ProdShift({_id: prodModel ? prodModel.prodShift : data.prodShift});
      var req = this.promised(prodShift.fetch());

      req.fail(function()
      {
        done(null);
      });

      req.done(function()
      {
        done(prodShift);
      });
    },

    renderTimeline: function(prodShift, prodShiftOrders, prodDowntimes, changeRequest)
    {
      this.timelineView = new ProdShiftTimelineView({
        editable: true,
        resizable: true,
        itemHeight: 30,
        prodShift: prodShift,
        prodShiftOrders: prodShiftOrders,
        prodDowntimes: prodDowntimes
      });

      this.setView('.prodChangeRequests-timeline', this.timelineView);

      this.timelineView.render();
      this.timelineView.highlightItem(changeRequest.getModelId(), true);
    },

    handleProdModelChange: function(data, topic)
    {
      if (!this.timelineView)
      {
        return;
      }

      var topicParts = topic.split('.');
      var modelType = topicParts[0];
      var collection = modelType === 'prodShiftOrders'
        ? this.timelineView.prodShiftOrders
        : this.timelineView.prodDowntimes;

      if (data.prodShift)
      {
        if (data.prodShift !== this.timelineView.prodShift.id)
        {
          return;
        }
      }
      else
      {
        var modelId = topicParts[2];

        if (modelId && !collection.get(modelId))
        {
          return;
        }
      }

      this.promised(collection.fetch());
    }

  });
});
