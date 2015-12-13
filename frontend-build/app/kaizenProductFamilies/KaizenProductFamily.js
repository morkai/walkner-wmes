// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model","app/core/templates/userInfo"],function(e,i){"use strict";return e.extend({urlRoot:"/kaizen/productFamilies",clientUrlRoot:"#kaizenProductFamilies",topicPrefix:"kaizen.productFamilies",privilegePrefix:"KAIZEN:DICTIONARIES",nlsDomain:"kaizenProductFamilies",labelAttribute:"name",defaults:{},serialize:function(){var e=this.toJSON();return e.owners?e.owners=e.owners.map(function(e){return i({userInfo:e})}):e.owners=[],e},serializeRow:function(){var e=this.serialize();return e.owners=e.owners.join("; "),e}})});