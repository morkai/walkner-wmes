// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/views/ListView"],function(o,i){return i.extend({columns:["name","tags","fteDiv","inProd","clipColor"],serializeRows:function(){return this.collection.toJSON().map(function(i){return i.tags=i.tags.length?i.tags.join(", "):null,i.fteDiv=o("core","BOOL:"+!!i.fteDiv),i.inProd=o("core","BOOL:"+!!i.inProd),i.clipColor&&(i.clipColor='<span class="label" style="background: '+i.clipColor+'">'+i.clipColor+"</span>"),i})}})});