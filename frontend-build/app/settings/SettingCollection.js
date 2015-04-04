// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Collection","./Setting"],function(t,e){"use strict";return t.extend({model:e,rqlQuery:"select(value)",matchSettingId:null,topicSuffix:"**",initialize:function(t,e){e.pubsub&&this.setUpPubsub(e.pubsub)},setUpPubsub:function(t){var e=this;t.subscribe("settings.updated."+this.topicSuffix,function(t){var i=e.get(t._id);i?i.set(t):e.add(t)})}})});