define([
  'moment',
  'app/i18n',
  'app/data/subdivisions',
  'app/data/views/renderOrgUnitPath',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../FteMasterEntry',
  '../views/FteMasterEntryDetailsPrintableView',
  'i18n!app/nls/fte'
], function(
  moment,
  t,
  subdivisions,
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
      var subdivision = subdivisions.get(this.model.get('subdivision'));

      return t('fte', 'print:hdLeft', {
        subdivision: subdivision ? renderOrgUnitPath(subdivision, false, false) : '?'
      });
    },

    hdRight: function()
    {
      return t('fte', 'print:hdRight', {
        date: moment(this.model.get('date')).format('YYYY-MM-DD'),
        shift: t('core', 'SHIFT:' + this.model.get('shift'))
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
