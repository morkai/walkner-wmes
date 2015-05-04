// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../i18n","../core/Model"],function(e,i){"use strict";return i.extend({urlRoot:"/kaizen/categories",clientUrlRoot:"#kaizen/categories",topicPrefix:"kaizen.categories",privilegePrefix:"KAIZEN:DICTIONARIES",nlsDomain:"kaizenCategories",labelAttribute:"name",defaults:{},serialize:function(){var i=this.toJSON();return i.description||(i.description="-"),i.inNearMiss=e("core","BOOL:"+this.get("inNearMiss")),i.inSuggestion=e("core","BOOL:"+this.get("inSuggestion")),i}})});