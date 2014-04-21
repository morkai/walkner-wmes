// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model"],function(e){var n=["machineSetupTime","machineTime","laborSetupTime","laborTime"];return e.extend({defaults:{no:null,workCenter:null,name:null,qty:null,unit:null,machineSetupTime:-1,machineTime:-1,laborSetupTime:-1,laborTime:-1},toJSON:function(){var t=e.prototype.toJSON.call(this);return t.qty&&(t.qtyUnit=t.qty,t.unit&&(t.qtyUnit+=" "+t.unit)),n.forEach(function(e){-1===t[e]&&(t[e]=null)}),t}})});