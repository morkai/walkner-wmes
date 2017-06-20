// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/viewport","app/core/View","./SnCheckerView","app/production/templates/taktTime"],function(e,t,i,c,n,o){"use strict";return c.extend({template:o,events:{"click #-check":function(){i.showDialog(new n({model:this.model}),t("production","taktTime:check:title"))}}})});