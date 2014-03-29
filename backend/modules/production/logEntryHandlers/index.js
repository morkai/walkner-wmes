'use strict';

exports.changeOrder = require('./changeOrder');
exports.changeMaster = require('./changePersonel')('master');
exports.changeLeader = require('./changePersonel')('leader');
exports.changeOperator = require('./changePersonel')('operator');
exports.changeQuantitiesDone = require('./changeQuantitiesDone');
exports.changeQuantityDone = require('./changeQuantityDone');
exports.changeShift = require('./changeShift');
exports.changeWorkerCount = require('./changeWorkerCount');
exports.correctOrder = require('./correctOrder');
exports.corroborateDowntime = require('./corroborateDowntime');
exports.editDowntime = require('./editDowntime');
exports.editOrder = require('./editOrder');
exports.editShift = require('./editShift');
exports.endWork = require('./endWork');
exports.finishDowntime = require('./finishDowntime');
exports.finishOrder = require('./finishOrder');
exports.startDowntime = require('./startDowntime');
