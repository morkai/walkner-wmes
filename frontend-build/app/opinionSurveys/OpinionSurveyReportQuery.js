// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../time","../core/Model"],function(r,i,e){"use strict";return e.extend({serializeToObject:function(){var r=this.attributes,i={};return["surveys","divisions","superiors","employers"].forEach(function(e){i[e]=r[e].join(",")}),i},serializeToString:function(){var r="",i=this.attributes;return["surveys","divisions","superiors","employers"].forEach(function(e){r+="&"+e+"="+i[e].join(",")}),r.substr(1)}},{fromQuery:function(i){var e=this,s={};return["surveys","divisions","superiors","employers"].forEach(function(e){var t=i[e];s[e]=r.isEmpty(t)?[]:t.split(",")}),new e(s)}})});