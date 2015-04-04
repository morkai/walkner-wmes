// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/user","app/core/views/FormView","app/vendors/util/setUpVendorSelect2","app/vendorNc12s/templates/form"],function(e,t,n,r,i){"use strict";return n.extend({template:i,events:e.extend({},n.prototype.events,{"change #-nc12":function(){var e=this.$id("nc12");e.val(e.val().replace(/[^0-9]/g,""))}}),afterRender:function(){n.prototype.afterRender.call(this),this.options.editMode&&this.$id("nc12").attr("readonly",!0),t.vendor||r(this.$id("vendor"))},serializeForm:function(t){return e.isEmpty(t.value)&&(t.value=""),e.isEmpty(t.unit)&&(t.unit=""),t}})});