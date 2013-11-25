define([
  'moment',
  'app/i18n',
  'app/data/aors',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../FteLeaderEntry',
  '../views/FteLeaderEntryDetailsPrintableView',
  'i18n!app/nls/fte'
], function(
  moment,
  t,
  aors,
  bindLoadingMessage,
  View,
  FteLeaderEntry,
  FteLeaderEntryDetailsPrintableView
) {
  'use strict';

  return View.extend({

    layoutName: 'print',

    pageId: 'fteLeaderEntryDetailsPrintable',

    hdLeft: function()
    {
      var aor = aors.get(this.model.get('aor'));

      return t('fte', 'leaderEntry:print:hdLeft', {
        aor: aor ? aor.getLabel() : '?'
      });
    },

    hdRight: function()
    {
      return t('fte', 'leaderEntry:print:hdRight', {
        date: moment(this.model.get('date')).format('YYYY-MM-DD'),
        shift: t('fte', 'shift:' + this.model.get('shift'))
      });
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new FteLeaderEntry({_id: this.options.modelId}), this);

      this.view = new FteLeaderEntryDetailsPrintableView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
