define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="well">\n  <form class="filter-form">\n    <div class="form-group">\n      <label for="'),__output.push(idPrefix),__output.push('-series">'),__output.push(t("reports","options:series")),__output.push('</label>\n      <select id="'),__output.push(idPrefix),__output.push('-series" name="series[]" class="form-control is-expandable" size="1" multiple>\n        <optgroup label="'),__output.push(t("reports","options:clip")),__output.push('">\n          <option value="clipOrderCount">'),__output.push(t("reports","metrics:clip:orderCount")),__output.push('</option>\n          <option value="clipProduction">'),__output.push(t("reports","metrics:clip:production")),__output.push('</option>\n          <option value="clipEndToEnd">'),__output.push(t("reports","metrics:clip:endToEnd")),__output.push('</option>\n        </optgroup>\n        <optgroup label="'),__output.push(t("reports","dirIndir:title")),__output.push('">\n          <option value="direct">'),__output.push(t("reports","options:direct")),__output.push('</option>\n          <option value="indirect">'),__output.push(t("reports","options:indirect")),__output.push('</option>\n          <option value="warehouse">'),__output.push(t("reports","options:warehouse")),__output.push('</option>\n          <option value="productivity">'),__output.push(t("reports","coeffs:productivity")),__output.push('</option>\n          <option value="productivityNoWh">'),__output.push(t("reports","coeffs:productivityNoWh")),__output.push('</option>\n          <option value="quantityDone">'),__output.push(t("reports","coeffs:quantityDone")),__output.push('</option>\n        </optgroup>\n        <optgroup label="'),__output.push(t("reports","effIneff:title")),__output.push('">\n          <option value="dirIndir">'),__output.push(t("reports","options:dirIndir")),__output.push('</option>\n          <option value="effIneff">'),__output.push(t("reports","options:effIneff")),__output.push('</option>\n        </optgroup>\n      </select>\n    </div><div class="form-group">\n      <label for="'),__output.push(idPrefix),__output.push('-prodTasks">'),__output.push(t("reports","options:prodTasks")),__output.push('</label>\n      <select id="'),__output.push(idPrefix),__output.push('-prodTasks" name="prodTasks[]" class="form-control is-expandable" size="1" multiple data-expanded-length="20">\n        '),prodTasks.forEach(function(t){__output.push('\n        <option value="'),__output.push(t.id),__output.push('">'),__output.push(escape(t.label)),__output.push("</option>\n        ")}),__output.push('\n      </select>\n    </div><div class="form-group">\n      <label for="'),__output.push(idPrefix),__output.push('-prodFunctions">'),__output.push(t("reports","options:prodFunctions")),__output.push('</label>\n      <select id="'),__output.push(idPrefix),__output.push('-prodFunctions" name="prodFunctions[]" class="form-control is-expandable" size="1" multiple data-expanded-length="20">\n        '),prodFunctions.forEach(function(t){__output.push('\n        <option value="'),__output.push(t.id),__output.push('">'),__output.push(escape(t.label)),__output.push("</option>\n        ")}),__output.push('\n      </select>\n    </div><div class="form-group">\n      <label for="'),__output.push(idPrefix),__output.push('-references">'),__output.push(t("reports","options:references")),__output.push('</label>\n      <select id="'),__output.push(idPrefix),__output.push('-references" name="references[]" class="form-control is-expandable" size="1" multiple data-expanded-length="20">\n        <optgroup label="'),__output.push(t("reports","dirIndir:title")),__output.push('">\n          <option value="direct">'),__output.push(t("reports","options:direct")),__output.push('</option>\n          <option value="indirect">'),__output.push(t("reports","options:indirect")),__output.push('</option>\n          <option value="warehouse">'),__output.push(t("reports","options:warehouse")),__output.push('</option>\n        </optgroup>\n        <optgroup label="'),__output.push(t("reports","effIneff:title")),__output.push('">\n          <option value="dirIndir">'),__output.push(t("reports","options:dirIndir")),__output.push('</option>\n          <option value="absence">'),__output.push(t("reports","options:absence")),__output.push('</option>\n        </optgroup>\n      </select>\n    </div><div class="form-group">\n      <label for="'),__output.push(idPrefix),__output.push('-extremes">'),__output.push(t("reports","options:extremes")),__output.push('</label>\n      <div id="'),__output.push(idPrefix),__output.push('-extremes" class="btn-group filter-btn-group" data-toggle="buttons">\n        '),["none","siblings","parent"].forEach(function(u){__output.push('\n        <label class="btn btn-default">\n          <input type="radio" name="extremes" value="'),__output.push(u),__output.push('"> '),__output.push(t("reports","options:extremes:"+u)),__output.push("\n        </label>\n        ")}),__output.push('\n      </div>\n    </div><div class="form-group filter-actions">\n      <hr><button id="'),__output.push(idPrefix),__output.push('-showFilter" type="button" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__output.push(t("reports","options:filter")),__output.push("</span></button>\n    </div>\n  </form>\n</div>\n");return __output.join("")}});