define(["require","exports","module","./Term","./Query","./Parser","./specialTerms","./valueConverters"],function(e,r){var s=e("./Term"),a=e("./Query"),l=e("./Parser"),n=e("./specialTerms"),o=e("./valueConverters");r.Term=s,r.Query=a,r.Parser=l,r.specialTerms=n,r.valueConverters=o,r.parser=null,r.parse=function(e){null===r.parser&&(r.parser=new l({jsonQueryCompatible:!0,fiqlCompatible:!0,allowEmptyValues:!1,allowSlashedArrays:!0,specialTerms:Object.keys(n)}));var s=new a,o={};s.selector=r.parser.parse(e,o);for(var p in o)o.hasOwnProperty(p)&&n.hasOwnProperty(p)&&n[p](s,p,o[p]);return s}});