// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Model"],function(e){"use strict";var t=["machineSetupTime","machineTime","laborSetupTime","laborTime"];return e.extend({defaults:{no:null,workCenter:null,name:null,qty:null,unit:null,machineSetupTime:-1,machineTime:-1,laborSetupTime:-1,laborTime:-1},toJSON:function(){var n=e.prototype.toJSON.call(this);return n.qty&&(n.qtyUnit=n.qty,n.unit&&(n.qtyUnit+=" "+n.unit)),t.forEach(function(e){n[e]===-1&&(n[e]=null)}),n}})});