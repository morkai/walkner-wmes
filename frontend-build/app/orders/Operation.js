// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model"],function(e){"use strict";var t=["machineSetupTime","machineTime","laborSetupTime","laborTime"];return e.extend({defaults:{no:null,workCenter:null,name:null,qty:null,unit:null,machineSetupTime:-1,machineTime:-1,laborSetupTime:-1,laborTime:-1},toJSON:function(){var n=e.prototype.toJSON.call(this);return n.qty&&(n.qtyUnit=n.qty,n.unit&&(n.qtyUnit+=" "+n.unit)),t.forEach(function(e){-1===n[e]&&(n[e]=null)}),n}})});