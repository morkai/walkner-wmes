define(["app/viewport","app/wmes-osh-common/views/ListView"],function(s,i){"use strict";return i.extend({serializeColumns:function(){return[{id:"_id",min:1,thClassName:"is-filter",tdClassName:"is-number"},{id:"status",min:1,thClassName:"is-filter"},{id:"createdAt",min:1,thClassName:"is-filter"},{id:"creator",min:1,thClassName:"is-filter"},{id:"workplace",className:"is-overflow w150",thClassName:"is-filter"},{id:"division",className:"is-overflow w150",thClassName:"is-filter"},{id:"building",className:"is-overflow w150",thClassName:"is-filter"},{id:"location",className:"is-overflow w150",thClassName:"is-filter"},{id:"eventDate",min:1},{id:"kind",min:1,thClassName:"is-filter"},{id:"eventCategory",className:"is-overflow w175",thClassName:"is-filter"},{id:"reasonCategory",className:"is-overflow w175",thClassName:"is-filter"},{id:"subject",className:"is-overflow w200"},{id:"implementer",min:1,thClassName:"is-filter"},"-"]}})});