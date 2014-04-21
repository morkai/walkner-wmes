// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/views/ListView"],function(o,e){return e.extend({columns:["name","tags","fteDiv","clipColor"],serializeRows:function(){return this.collection.toJSON().map(function(e){return e.tags=e.tags.length?e.tags.join(", "):null,e.fteDiv=o("core","BOOL:"+!!e.fteDiv),e.clipColor&&(e.clipColor='<span class="label" style="background: '+e.clipColor+'">'+e.clipColor+"</span>"),e})}})});