define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(t){return String(t).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="well">\n  <form id="',idPrefix,'-form" class="filter-form">\n    <div class="form-group">\n      <label for="',idPrefix,'-from">',t("reports","filter:from"),'</label>\n      <input id="',idPrefix,'-from" class="form-control" name="from" type="date" placeholder="YYYY-MM-DD">\n    </div><div\n      class="form-group">\n      <label for="',idPrefix,'-to">',t("reports","filter:to"),'</label>\n      <input id="',idPrefix,'-to" class="form-control" name="to" type="date" placeholder="YYYY-MM-DD">\n    </div><div class="form-group">\n      <label>',t("reports","filter:interval"),'</label>\n      <div class="btn-group filter-btn-group reports-2-filter-intervals" data-toggle="buttons">\n        <label class="btn btn-default" title="',t("reports","filter:interval:title:month"),'" data-interval="month">\n          <input type="radio" name="interval" value="month"> ',t("reports","filter:interval:month"),'\n        </label>\n        <label class="btn btn-default" title="',t("reports","filter:interval:title:week"),'" data-interval="week">\n          <input type="radio" name="interval" value="week"> ',t("reports","filter:interval:week"),'\n        </label>\n        <label class="btn btn-default" title="',t("reports","filter:interval:title:day"),'" data-interval="day">\n          <input type="radio" name="interval" value="day"> ',t("reports","filter:interval:day"),'\n        </label>\n      </div>\n    </div><div class="form-group filter-actions">\n      <input type="submit" class="btn btn-primary" value="',escape(t("reports","filter:submit")),'">\n      <div class="btn-group">\n        <input type="button" class="btn btn-default" value="',escape(t("reports","filter:submit:today")),'" data-range="today">\n        <input type="button" class="btn btn-default" value="',escape(t("reports","filter:submit:yesterday")),'" data-range="yesterday">\n        <input type="button" class="btn btn-default" value="',escape(t("reports","filter:submit:week")),'" data-range="week">\n        <input type="button" class="btn btn-default" value="',escape(t("reports","filter:submit:month")),'" data-range="month">\n      </div>\n    </div>\n  </form>\n</div>\n')}();return buf.join("")}});