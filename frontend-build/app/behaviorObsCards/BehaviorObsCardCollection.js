define(["../user","../core/Collection","./BehaviorObsCard"],function(e,t,r){"use strict";return t.extend({model:r,theadHeight:2,rqlQuery:"limit(-1337)&sort(-date)&lang("+e.lang+")"})});