// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport","../data/localStorage","../core/View","./views/HeffView","i18n!app/nls/heff","i18n!app/nls/production"],function(e,n,i,o,t){"use strict";e.map("/",function(){n.showPage(new o({layoutName:"blank",view:new t({model:{prodLineId:i.getItem("HEFF:LINE")}})}))})});