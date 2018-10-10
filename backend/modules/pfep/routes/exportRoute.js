// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

exports.serializeRow = function(app, module, doc)
{
  return {
    rid: doc.rid,
    creator: doc.creator.label,
    createdAt: doc.createdAt,
    nc12: doc.nc12,
    description: doc.description,
    unit: doc.unit,
    packType: doc.packType,
    externalPackQty: doc.externalPackQty,
    internalPackQty: doc.internalPackQty,
    packLength: doc.packLength,
    packWidth: doc.packWidth,
    packHeight: doc.packHeight,
    packGrossWeight: doc.packGrossWeight,
    componentNetWeight: doc.componentNetWeight,
    componentGrossWeight: doc.componentGrossWeight,
    qtyPerLayer: doc.qtyPerLayer,
    qtyOnPallet: doc.qtyOnPallet,
    palletLength: doc.palletLength,
    palletHeight: doc.palletHeight,
    palletWidth: doc.palletWidth,
    moq: doc.moq,
    roundingValue: doc.roundingValue,
    vendor: doc.vendor,
    notes: doc.notes
  };
};

exports.cleanUp = function()
{

};