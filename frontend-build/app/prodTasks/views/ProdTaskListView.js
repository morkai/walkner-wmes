// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/views/ListView","app/core/util/colorLabel"],function(e,t,o){"use strict";return t.extend({columns:["name","parent","tags","fteDiv","inProd","clipColor"],serializeRows:function(){var t=this.collection;return t.sort().map(function(r){var i=r.toJSON();i.tags=i.tags.length?i.tags.join(", "):"-",i.fteDiv=e("core","BOOL:"+!!i.fteDiv),i.inProd=e("core","BOOL:"+!!i.inProd),i.clipColor&&(i.clipColor=o(i.clipColor));var n=t.get(i.parent);return i.parent=n?n.getLabel():"-",i})}})});