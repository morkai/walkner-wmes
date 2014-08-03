define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="well">\n  <form class="filter-form">\n    <div class="form-group">\n      <label for="',idPrefix,'-series">',t("reports","options:series"),'</label>\n      <select id="',idPrefix,'-series" name="series[]" class="form-control is-expandable" size="1" multiple>\n        <option value="quantityDone">',t("reports","hr:quantityDone"),'</option>\n        <option value="total">',t("reports","hr:total"),'</option>\n        <option value="direct">',t("reports","hr:direct"),'</option>\n        <option value="indirect">',t("reports","hr:indirect"),'</option>\n        <option value="dirIndir">',t("reports","hr:dirIndir"),'</option>\n      </select>\n    </div><div class="form-group">\n      <label for="',idPrefix,'-companies">',t("reports","options:companies"),'</label>\n      <select id="',idPrefix,'-companies" name="companies[]" class="form-control is-expandable" size="1" multiple data-expanded-length="20">\n        '),companies.forEach(function(e){buf.push('\n        <option value="',e.id,'">',escape(e.label),"</option>\n        ")}),buf.push('\n      </select>\n    </div><div class="form-group">\n      <label for="',idPrefix,'-prodFunctions">',t("reports","options:prodFunctions"),'</label>\n      <select id="',idPrefix,'-prodFunctions" name="prodFunctions[]" class="form-control is-expandable" size="1" multiple data-expanded-length="20">\n        '),prodFunctions.forEach(function(e){buf.push('\n        <option value="',e.id,'">',escape(e.label),"</option>\n        ")}),buf.push('\n      </select>\n    </div><div class="form-group">\n      <label for="',idPrefix,'-extremes">',t("reports","options:extremes"),'</label>\n      <div id="',idPrefix,'-extremes" class="btn-group filter-btn-group" data-toggle="buttons">\n        '),["none","siblings","parent"].forEach(function(e){buf.push('\n        <label class="btn btn-default">\n          <input type="radio" name="extremes" value="',e,'"> ',t("reports","options:extremes:"+e),"\n        </label>\n        ")}),buf.push('\n      </div>\n    </div><div class="form-group filter-actions">\n      <hr><button id="',idPrefix,'-showFilter" type="button" class="btn btn-default"><i class="fa fa-filter"></i><span>',t("reports","options:filter"),"</span></button>\n    </div>\n  </form>\n</div>\n")}();return buf.join("")}});