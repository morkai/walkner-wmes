define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form behaviorObsCards-filter">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-from">'),__append(t("core","filter:date:from")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-from" class="form-control" name="from" type="date" placeholder="'),__append(t("core","placeholder:date")),__append('">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-to">'),__append(t("core","filter:date:to")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-to" class="form-control" name="to" type="date" placeholder="'),__append(t("core","placeholder:date")),__append('">\n  </div>\n  <div class="form-group">\n    <div class="filter-radioLabels">\n      <label>\n        <input name="userType" type="radio" value="mine">\n        '),__append(helpers.t("filter:user:mine")),__append('\n      </label><label>\n        <input name="userType" type="radio" value="observer">\n        '),__append(helpers.t("filter:user:observer")),__append('\n      </label><label>\n        <input name="userType" type="radio" value="superior">\n        '),__append(helpers.t("filter:user:superior")),__append('\n      </label><label>\n        <input name="userType" type="radio" value="others">\n        '),__append(helpers.t("filter:user:others")),__append('\n      </label>\n    </div>\n    <input id="'),__append(idPrefix),__append('-user" name="user" type="text">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-section">'),__append(helpers.t("PROPERTY:section")),__append('</label>\n    <select id="'),__append(idPrefix),__append('-section" name="section[]" class="form-control is-expandable" multiple size="1" data-expanded-length="15">\n      '),sections.forEach(function(e){__append('\n      <option value="'),__append(e._id),__append('">'),__append(escapeFn(e.name)),__append("</option>\n      ")}),__append('\n    </select>\n  </div>\n  <div class="form-group">\n    <label>'),__append(helpers.t("filter:anyHard")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-anyHard" class="btn-group filter-btn-group" data-toggle="buttons">\n      <label class="btn btn-default">\n        <input type="checkbox" name="anyHard[]" value="observations"> '),__append(helpers.t("filter:anyHard:observations")),__append('\n      </label>\n      <label class="btn btn-default">\n        <input type="checkbox" name="anyHard[]" value="risks"> '),__append(helpers.t("filter:anyHard:risks")),__append("\n      </label>\n    </div>\n  </div>\n  "),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(helpers.t("filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});