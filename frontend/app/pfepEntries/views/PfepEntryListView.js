// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/core/views/ListView'
], function(
  _,
  t,
  time,
  ListView
) {
  'use strict';

  t = t.forDomain('pfepEntries');

  return ListView.extend({

    className: 'pfepEntries-list is-clickable',

    events: _.assign({

      'click .is-filter': function(e)
      {
        this.trigger('showFilter', e.currentTarget.dataset.columnId);
      }

    }, ListView.prototype.events),

    serializeColumns: function()
    {
      return [
        {id: 'rid', tdClassName: 'is-min is-number', thClassName: 'is-filter'},
        {id: 'date', tdClassName: 'is-min', thClassName: 'is-filter'},
        {id: 'nc12', tdClassName: 'is-min is-number', thClassName: 'is-filter'},
        'description',
        {id: 'unit', tdClassName: 'is-min', label: t('LIST:COLUMN:unit')},
        {id: 'packType', tdClassName: 'is-min', thClassName: 'is-filter', label: t('LIST:COLUMN:packType')},
        {id: 'externalPackQty', tdClassName: 'is-min is-number', label: t('LIST:COLUMN:externalPackQty')},
        {id: 'packSize', tdClassName: 'is-min is-number text-center', label: t('LIST:COLUMN:packSize')},
        {id: 'packGrossWeight', tdClassName: 'is-min is-number', label: t('LIST:COLUMN:packGrossWeight')},
        {id: 'componentNetWeight', tdClassName: 'is-min is-number', label: t('LIST:COLUMN:componentNetWeight')},
        {id: 'componentGrossWeight', tdClassName: 'is-min is-number', label: t('LIST:COLUMN:componentGrossWeight')},
        {id: 'internalPackQty', tdClassName: 'is-min is-number', label: t('LIST:COLUMN:internalPackQty')},
        {id: 'qtyPerLayer', tdClassName: 'is-min is-number', label: t('LIST:COLUMN:qtyPerLayer')},
        {id: 'qtyOnPallet', tdClassName: 'is-min is-number', label: t('LIST:COLUMN:qtyOnPallet')},
        {id: 'palletSize', tdClassName: 'is-min is-number text-center', label: t('LIST:COLUMN:palletSize')},
        {id: 'moq', tdClassName: 'is-min is-number'},
        {id: 'roundingValue', tdClassName: 'is-min is-number', label: t('LIST:COLUMN:roundingValue')},
        {id: 'vendor', thClassName: 'is-filter'},
        {id: 'creator', thClassName: 'is-filter'},
        {id: 'notes', label: t('LIST:COLUMN:notes')}
      ];
    }

  });
});
