define(["../time","../core/Model"],function(t,e){"use strict";return e.extend({urlRoot:"/trw/tests",clientUrlRoot:"#trw/tests",topicPrefix:"trw.tests",privilegePrefix:"TRW",nlsDomain:"wmes-trw-tests",getLabel:function(){return this.get("order")+"/"+this.get("pce")},serialize:function(){var e=this.toJSON();return e.duration=t.toString((Date.parse(e.finishedAt)-Date.parse(e.startedAt))/1e3),e.startedAt=t.format(e.startedAt,"L, HH:mm:ss"),e},serializeRow:function(){var t=this.serialize();return t.tester=t.program.tester.name,t.program=t.program.name,t}})});