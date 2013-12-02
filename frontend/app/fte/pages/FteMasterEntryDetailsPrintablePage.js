define([
  'moment',
  'app/i18n',
  'app/data/divisions',
  'app/data/views/renderOrgUnitPath',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../FteMasterEntry',
  '../views/FteMasterEntryDetailsPrintableView',
  'i18n!app/nls/fte'
], function(
  moment,
  t,
  divisions,
  renderOrgUnitPath,
  bindLoadingMessage,
  View,
  FteMasterEntry,
  FteMasterEntryDetailsPrintableView
) {
  'use strict';

  return View.extend({

    layoutName: 'print',

    pageId: 'fteMasterEntryDetailsPrintable',

    hdLeft: function()
    {
      var division = divisions.get(this.model.get('division'));

      return t('fte', 'masterEntry:print:hdLeft', {
        division: division ? renderOrgUnitPath(division, false, false) : '?'
      });
    },

    hdRight: function()
    {
      return t('fte', 'masterEntry:print:hdRight', {
        date: moment(this.model.get('date')).format('YYYY-MM-DD'),
        shift: t('fte', 'shift:' + this.model.get('shift'))
      });
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new FteMasterEntry({_id: this.options.modelId}), this);

      this.view = new FteMasterEntryDetailsPrintableView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
