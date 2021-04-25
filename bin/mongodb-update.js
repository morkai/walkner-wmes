/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.componentlabels.dropIndex({operationNo: 1, componentCode: 1});
db.componentlabels.createIndex({operationNo: 1, componentCode: 1});

db.suggestions.updateMany({resolutions: {$exists: false}}, {resolutions: []});
db.suggestions.addIndex({'resolutions._id': 1});
