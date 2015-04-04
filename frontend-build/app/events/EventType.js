// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model"],function(t){"use strict";return t.extend({urlRoot:"/events/types",clientUrlRoot:"#events/types",nlsDomain:"events",labelAttribute:"text",defaults:{text:null},toSelect2Option:function(){return{id:this.id,text:this.getLabel()}}})});