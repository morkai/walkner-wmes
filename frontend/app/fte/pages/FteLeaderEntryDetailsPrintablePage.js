// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/i18n',
  'app/data/subdivisions',
  'app/orgUnits/util/renderOrgUnitPath',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../FteLeaderEntry',
  '../views/FteLeaderEntryDetailsPrintableView'
], function(
  time,
  t,
  subdivisions,
  renderOrgUnitPath,
  bindLoadingMessage,
  View,
  FteLeaderEntry,
  FteLeaderEntryDetailsPrintableView
) {
  'use strict';

  return View.extend({

    layoutName: 'print',

    pageId: 'fteLeaderEntryDetailsPrintable',

    landscape: true,

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
      this.model = bindLoadingMessage(this.model, this);

      this.view = new FteLeaderEntryDetailsPrintableView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
