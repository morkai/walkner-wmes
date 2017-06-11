define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="well">\n  <form class="filter-form">\n    <div class="form-group">\n      <label for="'),__append(idPrefix),__append('-series">'),__append(t("reports","options:series")),__append('</label>\n      <select id="'),__append(idPrefix),__append('-series" name="series[]" class="form-control is-expandable" size="1" multiple>\n        <option value="quantityDone">'),__append(t("reports","coeffs:quantityDone")),__append('</option>\n        <option value="efficiency">'),__append(t("reports","coeffs:efficiency")),__append('</option>\n        <option value="productivity">'),__append(t("reports","coeffs:productivity")),__append('</option>\n        <option value="productivityNoWh">'),__append(t("reports","coeffs:productivityNoWh")),__append('</option>\n        <option value="scheduledDowntime">'),__append(t("reports","coeffs:scheduledDowntime")),__append('</option>\n        <option value="unscheduledDowntime">'),__append(t("reports","coeffs:unscheduledDowntime")),__append('</option>\n      </select>\n    </div><div class="form-group">\n      <label for="'),__append(idPrefix),__append('-aors">'),__append(t("reports","options:aors")),__append('</label>\n      <select id="'),__append(idPrefix),__append('-aors" name="aors[]" class="form-control is-expandable" size="1" multiple data-expanded-length="20">\n        '),aors.forEach(function(e){__append('\n        <option value="'),__append(e.id),__append('">'),__append(escapeFn(e.label)),__append("</option>\n        ")}),__append('\n      </select>\n    </div><div class="form-group">\n      <label for="'),__append(idPrefix),__append('-reasons">'),__append(t("reports","options:reasons")),__append('</label>\n      <select id="'),__append(idPrefix),__append('-reasons" name="reasons[]" class="form-control is-expandable" size="1" multiple data-expanded-length="20">\n        '),reasons.forEach(function(e){__append('\n        <option value="'),__append(e.id),__append('">'),__append(escapeFn(e.label)),__append("</option>\n        ")}),__append('\n      </select>\n    </div><div class="form-group">\n      <label for="'),__append(idPrefix),__append('-references">'),__append(t("reports","options:references")),__append('</label>\n      <select id="'),__append(idPrefix),__append('-references" name="references[]" class="form-control is-expandable" size="1" multiple data-expanded-length="20">\n        <optgroup label="'),__append(t("reports","options:references:coeffs")),__append('">\n          <option value="efficiency">'),__append(t("reports","coeffs:efficiency")),__append('</option>\n          <option value="productivity">'),__append(t("reports","coeffs:productivity")),__append('</option>\n          <option value="productivityNoWh">'),__append(t("reports","coeffs:productivityNoWh")),__append('</option>\n          <option value="scheduledDowntime">'),__append(t("reports","coeffs:scheduledDowntime")),__append('</option>\n          <option value="unscheduledDowntime">'),__append(t("reports","coeffs:unscheduledDowntime")),__append('</option>\n        </optgroup>\n        <optgroup label="'),__append(t("reports","options:references:aors")),__append('">\n          '),aors.forEach(function(e){__append('\n          <option value="'),__append(e.id),__append('">'),__append(escapeFn(e.label)),__append("</option>\n          ")}),__append('\n        </optgroup>\n        <optgroup label="'),__append(t("reports","options:references:reasons")),__append('">\n          '),reasons.forEach(function(e){__append('\n          <option value="'),__append(e.id),__append('">'),__append(escapeFn(e.label)),__append("</option>\n          ")}),__append('\n        </optgroup>\n      </select>\n    </div><div class="form-group">\n      <label for="'),__append(idPrefix),__append('-extremes">'),__append(t("reports","options:extremes")),__append('</label>\n      <div id="'),__append(idPrefix),__append('-extremes" class="btn-group filter-btn-group" data-toggle="buttons">\n        '),["none","siblings","parent"].forEach(function(e){__append('\n        <label class="btn btn-default">\n          <input type="radio" name="extremes" value="'),__append(e),__append('"> '),__append(t("reports","options:extremes:"+e)),__append("\n        </label>\n        ")}),__append('\n      </div>\n    </div><div class="form-group filter-actions">\n      <hr><button id="'),__append(idPrefix),__append('-showFilter" type="button" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(t("reports","options:filter")),__append("</span></button>\n    </div>\n  </form>\n</div>\n");return __output.join("")}});