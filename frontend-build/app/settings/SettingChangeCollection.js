define(["app/core/Collection","./SettingChange"],function(e,t){"use strict";return e.extend({model:t,rqlQuery:"sort(-time)&limit(20)"})});