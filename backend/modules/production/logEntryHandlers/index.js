// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
exports.deleteDowntime = require('./deleteDowntime');
exports.deleteOrder = require('./deleteOrder');
exports.deleteShift = require('./deleteShift');
exports.editDowntime = require('./editDowntime');
exports.editOrder = require('./editOrder');
exports.editShift = require('./editShift');
exports.endWork = require('./endWork');
exports.finishDowntime = require('./finishDowntime');
exports.finishOrder = require('./finishOrder');
exports.startDowntime = require('./startDowntime');
