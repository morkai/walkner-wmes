define(["app/core/views/ListView"],function(i){"use strict";return i.extend({serializeColumns:function(){return[{id:"_id",min:1,thClassName:"is-filter",tdClassName:"is-number"},{id:"createdAt",min:1,thClassName:"is-filter"},{id:"creator",min:1,thClassName:"is-filter"},{id:"implementer",min:1,thClassName:"is-filter"},{id:"coordinator",min:1,thClassName:"is-filter"},{id:"workplace",className:"is-overflow w150",thClassName:"is-filter"},{id:"division",className:"is-overflow w150",thClassName:"is-filter"},{id:"building",className:"is-overflow w150",thClassName:"is-filter"},{id:"kind",min:1,thClassName:"is-filter"},{id:"eventCategory",className:"is-overflow w200",thClassName:"is-filter"},{id:"reasonCategory",className:"is-overflow w200",thClassName:"is-filter"},{id:"problem",className:"is-overflow w250"},"-"]}})});