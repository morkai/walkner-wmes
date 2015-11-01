// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model"],function(e){"use strict";return e.extend({urlRoot:"/prodChangeRequests",clientUrlRoot:"#prodChangeRequests",topicPrefix:"prodChangeRequests",privilegePrefix:"PROD_DATA:CHANGES",nlsDomain:"prodChangeRequests",getModelId:function(){var e=this.get("modelId");if(!e){var t=this.get("data");t&&t._id&&(e=t._id)}return e},isFte:function(){var e=this.get("modelType");return"fteMaster"===e||"fteLeader"===e}})});