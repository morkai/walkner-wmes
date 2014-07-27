// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/FilterView","app/purchaseOrders/templates/filter"],function(e,i){return e.extend({template:i,defaultFormData:{_id:"",nc12:"",from:"",to:""},termToForm:{_id:function(e,i,r){r._id="string"==typeof i.args[1]?i.args[1].replace(/^[0-9]/g,""):""},"items.nc12":"_id"},serializeTermToForm:function(e){this.serializeRegexTerm(e,"_id",6),this.serializeRegexTerm(e,"items.nc12",12)}})});