// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

exports.addDowntime = require('./addDowntime');
exports.addOrder = require('./addOrder');
exports.addShift = require('./addShift');
exports.changeOrder = require('./changeOrder');
exports.changeMaster = require('./changePersonel')('master');
exports.changeLeader = require('./changePersonel')('leader');
exports.changeOperator = require('./changePersonel')('operator');
exports.changeQuantitiesDone = require('./changeQuantitiesDone');
exports.changeQuantityDone = require('./changeQuantityDone');
exports.changeShift = require('./changeShift');
exports.changeWorkerCount = require('./changeWorkerCount');
exports.checkSerialNumber = require('./checkSerialNumber');
exports.checkSpigot = require('./checkSpigot');
exports.correctOrder = require('./correctOrder');
exports.corroborateDowntime = require('./corroborateDowntime');
exports.deleteDowntime = require('./deleteDowntime');
exports.deleteOrder = require('./deleteOrder');
exports.deleteShift = require('./deleteShift');
exports.editDowntime = require('./editDowntime');
exports.editOrder = require('./editOrder');
exports.editShift = require('./editShift');
exports.endWork = require('./endWork');
exports.finishDowntime = require('./finishDowntime');
exports.finishDowntimeAlert = require('./finishDowntimeAlert');
exports.finishOrder = require('./finishOrder');
exports.notifyDowntimeAlert = require('./notifyDowntimeAlert');
exports.startDowntime = require('./startDowntime');
