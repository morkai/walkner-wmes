// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport","../data/localStorage","../core/View","./views/HeffView","i18n!app/nls/heff"],function(e,i,n,o,t){"use strict";e.map("/",function(){i.showPage(new o({layoutName:"blank",view:new t({model:{prodLineId:n.getItem("HEFF:LINE")}})}))})});