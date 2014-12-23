// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/views/ListView"],function(e,o){return o.extend({columns:["name","parent","tags","fteDiv","inProd","clipColor"],serializeRows:function(){var o=this.collection;return o.sort().map(function(n){var r=n.toJSON();r.tags=r.tags.length?r.tags.join(", "):"-",r.fteDiv=e("core","BOOL:"+!!r.fteDiv),r.inProd=e("core","BOOL:"+!!r.inProd),r.clipColor&&(r.clipColor='<span class="label" style="background: '+r.clipColor+'">'+r.clipColor+"</span>");var t=o.get(r.parent);return r.parent=t?t.getLabel():"-",r})}})});