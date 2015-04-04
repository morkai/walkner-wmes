// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model"],function(e){"use strict";return e.extend({urlRoot:"/lossReasons",clientUrlRoot:"#lossReasons",topicPrefix:"lossReasons",privilegePrefix:"DICTIONARIES",nlsDomain:"lossReasons",labelAttribute:"label",defaults:{label:null,position:0},toJSON:function(){var l=e.prototype.toJSON.call(this);return l.label||(l.label=l._id),l}})});