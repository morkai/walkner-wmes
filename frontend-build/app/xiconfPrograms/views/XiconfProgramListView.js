define(["app/i18n","app/time","app/core/views/ListView","../util/buildStepLabels"],function(i,s,e,a){"use strict";return e.extend({className:"xiconfPrograms-list is-clickable",columns:[{id:"name",className:"is-min"},{id:"prodLines",className:"is-min"},{id:"programType",label:i.bound("xiconfPrograms","PROPERTY:type"),className:"is-min"},"steps",{id:"updatedAt",className:"is-min"}],serializeRow:function(i){var s=i.serialize();return s.steps=a(s.steps),s}})});