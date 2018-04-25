// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupPrinterModel(app, mongoose)
{
  const printerSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    tags: [String]
  }, {
    id: false
  });

  printerSchema.statics.TOPIC_PREFIX = 'printing.printers';
  printerSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('Printer', printerSchema);
};
