define(["require","exports","module","./Term","./Query","./Parser","./specialTerms","./valueConverters"],function(e,t){var n=e("./Term"),r=e("./Query"),i=e("./Parser"),o=e("./specialTerms"),a=e("./valueConverters");t.Term=n,t.Query=r,t.Parser=i,t.specialTerms=o,t.valueConverters=a,t.parser=null,t.parse=function(e){null===t.parser&&(t.parser=new i({jsonQueryCompatible:!0,fiqlCompatible:!0,allowEmptyValues:!1,allowSlashedArrays:!0,specialTerms:Object.keys(o)}));var n=new r,a={};n.selector=t.parser.parse(e,a);for(var s in a)a.hasOwnProperty(s)&&o.hasOwnProperty(s)&&o[s](n,s,a[s]);return n}});