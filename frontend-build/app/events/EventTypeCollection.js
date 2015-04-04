// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../i18n","../core/Collection","./EventType"],function(e,t,n){"use strict";return t.extend({model:n,parse:function(t){return t.map(function(t){return{_id:t,text:e.bound("events","TYPE:"+t)}})},comparator:"text"})});