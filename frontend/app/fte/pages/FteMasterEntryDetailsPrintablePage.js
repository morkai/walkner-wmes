// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/i18n',
  'app/data/subdivisions',
  'app/data/views/renderOrgUnitPath',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../FteMasterEntry',
  '../views/FteMasterEntryDetailsPrintableView'
], function(
  time,
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
        date: time.format(this.model.get('date'), 'L'),
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
