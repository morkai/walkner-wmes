// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/viewport',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/wmes-dummyPaint-jobs/DpJobCollection',
  'app/wmes-dummyPaint-workers/DpWorkerCollection',
  '../dictionaries',
  'app/wmes-dummyPaint-orders/templates/startJob'
], function(
  _,
  user,
  viewport,
  FormView,
  idAndLabel,
  setUpUserSelect2,
  DpJobCollection,
  DpWorkerCollection,
  dictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    nlsDomain: 'wmes-dummyPaint-orders',

    remoteTopics: {
      'dummyPaint.jobs.updated': 'onJobUpdated',
      'dummyPaint.workers.updated': 'onWorkerUpdated'
    },

    events: Object.assign({

      'click #-codes-all': function()
      {
        var $codes = this.$id('codes');

        window.$codes = $codes;

        $codes.select2('data', $codes.data('select2').opts.data.filter(function(item)
        {
          return !item.disabled;
        }));
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.jobs = new DpJobCollection(null, {
        rqlQuery: 'status=inProgress'
      });

      this.workers = new DpWorkerCollection(null, {
        rqlQuery: 'sort(name)&lastSeenAt=gte=0'
      });

      this.listenTo(this.jobs, 'reset', this.setUpCodesSelect2);
      this.listenTo(this.workers, 'reset', this.setUpWorkerSelect2);

      this.timers.setUpNotifySelect2 = setInterval(this.setUpWorkerSelect2.bind(this), 2 * 60 * 1000);
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpCodesSelect2();
      this.setUpWorkerSelect2();
      this.setUpNotifySelect2();
      this.loadJobs();
      this.loadWorkers();
    },

    loadJobs: function()
    {
      this.$id('codes').select2('disable');

      this.promised(this.jobs.fetch({reset: true}));
    },

    loadWorkers: function()
    {
      this.$id('workers').select2('disable');

      this.workers.rqlQuery.selector.args[1].args[1] = Date.now() - 5 * 60 * 1000;

      this.promised(this.workers.fetch({reset: true}));
    },

    setUpCodesSelect2: function()
    {
      var $codes = this.$id('codes');
      var codesInProgress = {};

      this.jobs.forEach(function(job)
      {
        if (job.get('status') !== 'inProgress')
        {
          return;
        }

        job.get('codes').forEach(function(code)
        {
          codesInProgress[code] = true;
        });
      });

      var selected = $codes
        .val()
        .split(',')
        .filter(function(code) { return code.length > 0 && !codesInProgress[code]; })
        .join(',');

      $codes.val(selected);

      $codes.select2({
        multiple: true,
        data: dictionaries.codes.map(function(code)
        {
          return {
            id: code.id,
            text: code.getLabel(),
            disabled: codesInProgress[code.id] === true
          };
        })
      });

      $codes.select2('enable');
    },

    setUpWorkerSelect2: function()
    {
      var $worker = this.$id('worker');
      var fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      var workers = this.workers.filter(function(worker)
      {
        return Date.parse(worker.get('lastSeenAt')) >= fiveMinutesAgo;
      });
      var selected = $worker.val();

      if (selected && !workers.find(function(worker) { return worker.id === selected; }))
      {
        $worker.val('');
      }

      var data = workers.map(idAndLabel);

      $worker.select2({
        data: data
      });

      $worker.select2('enable');

      if (!$worker.val() && data.length === 1)
      {
        $worker.select2('data', data[0]);
      }
    },

    setUpNotifySelect2: function()
    {
      setUpUserSelect2(this.$id('notify'), {
        view: this,
        multiple: true,
        noPersonnelId: true
      });

      if (user.data.email)
      {
        this.$id('notify').select2('data', [{
          id: user.data._id,
          text: user.getLabel()
        }]);
      }
    },

    onJobUpdated: function(message)
    {
      var view = this;
      var changed = false;

      [].concat(message.added || [], message.updated || []).forEach(function(data)
      {
        var job = view.jobs.get(data._id);

        if (job)
        {
          if (data.status !== 'inProgress')
          {
            view.jobs.remove(job);

            changed = true;
          }
          else if (job.get('status') !== 'inProgress')
          {
            job.set(data);

            changed = true;
          }
        }
        else if (data.status === 'inProgress')
        {
          view.workers.add(data);

          changed = true;
        }
      });

      if (changed)
      {
        view.setUpCodesSelect2();
      }
    },

    onWorkerUpdated: function(message)
    {
      var view = this;
      var changed = false;
      var fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

      [].concat(message.added || [], message.updated || []).forEach(function(data)
      {
        var worker = view.workers.get(data._id);

        if (worker)
        {
          if (!changed)
          {
            var wasSeen = Date.parse(worker.get('lastSeenAt')) >= fiveMinutesAgo;
            var isSeen = Date.parse(data.lastSeenAt) >= fiveMinutesAgo;

            changed = (!wasSeen && isSeen) || (wasSeen && !isSeen);
          }

          worker.set(data);
        }
        else
        {
          view.workers.add(data);

          changed = true;
        }
      });

      if (changed)
      {
        view.setUpWorkerSelect2();
      }
    },

    serializeForm: function(formData)
    {
      formData.codes = formData.codes.split(',');
      formData.notify = setUpUserSelect2.getUserInfo(this.$id('notify'));

      return formData;
    },

    submitRequest: function()
    {
      this.hideErrorMessage();

      this.$errorMessage = viewport.msg.show({
        type: 'warning',
        text: this.t('startJob:msg:starting')
      });

      return FormView.prototype.submitRequest.apply(this, arguments);
    },

    getFailureText: function(jqXhr)
    {
      var error = jqXhr.responseJSON && jqXhr.responseJSON.error || {};
      var code = error.code || '';
      var data = {};

      if (code === 'CODE_IN_PROGRESS')
      {
        data.code = _.intersection(error.newJob.codes, error.inProgressJob.codes).join(', ');
      }

      return this.t.has('startJob:msg:' + code)
        ? this.t('startJob:msg:' + code, data)
        : this.t('startJob:msg:failure');
    },

    handleSuccess: function()
    {
      this.hideErrorMessage();

      viewport.msg.show({
        type: 'success',
        time: 2500,
        text: this.t('startJob:msg:success')
      });

      viewport.closeDialog();
    }

  });
});
