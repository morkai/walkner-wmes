define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(r){return String(r).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="well">\n  <form id="',idPrefix,'-form" class="filter-form"><div class="form-group">\n      <label for="',idPrefix,'-from">',t("purchaseOrders","FILTER:from"),'</label>\n      <input id="',idPrefix,'-from" class="form-control" name="from" type="date" placeholder="YYYY-MM-DD">\n    </div><div class="form-group">\n      <label for="',idPrefix,'-to">',t("purchaseOrders","FILTER:to"),'</label>\n      <input id="',idPrefix,'-to" class="form-control" name="to" type="date" placeholder="YYYY-MM-DD">\n    </div><div class="form-group">\n      <label for="',idPrefix,'-_id">',t("purchaseOrders","PROPERTY:_id"),'</label>\n      <input id="',idPrefix,'-_id" class="form-control no-controls" name="_id" type="number" min="1" max="999999">\n    </div><div class="form-group">\n      <label for="',idPrefix,'-nc12">',t("purchaseOrders","PROPERTY:nc12"),'</label>\n      <input id="',idPrefix,'-nc12" class="form-control no-controls" name="nc12" type="number" min="100000000000" max="999999999999">\n    </div><div class="form-group">\n      <label for="',idPrefix,'-limit">',t("purchaseOrders","FILTER:limit"),'</label>\n      <input id="',idPrefix,'-limit" class="form-control" name="limit" type="number" value="25" min="5" max="100" step="1">\n    </div><div class="form-group filter-actions">\n      <input type="submit" class="btn btn-default" value="',escape(t("purchaseOrders","FILTER:submit")),'">\n    </div>\n  </form>\n</div>\n')}();return buf.join("")}});