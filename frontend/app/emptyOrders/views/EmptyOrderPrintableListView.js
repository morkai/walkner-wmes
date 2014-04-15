// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/views/PrintableListView'
], function(
  t,
  PrintableListView
) {
  'use strict';

  return PrintableListView.extend({

    serializeColumns: function()
    {
      return [
        {id: '_id', label: t('emptyOrders', 'PROPERTY:_id')},
        {id: 'nc12', label: t('emptyOrders', 'PROPERTY:nc12')},
        {id: 'mrp', label: t('emptyOrders', 'PROPERTY:mrp')},
        {id: 'startDateText', label: t('emptyOrders', 'PROPERTY:startDate')},
        {id: 'finishDateText', label: t('emptyOrders', 'PROPERTY:finishDate')}
      ];
    },

    serializeRows: function()
    {
      return this.collection.toJSON({startFinishDateFormat: 'YYYY-MM-DD'});
    }

  });
});
