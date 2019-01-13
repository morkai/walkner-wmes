define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form fap-entries-filter" autocomplete="off">\n  '),__append(forms.dateTimeRange({idPrefix,property:"createdAt",startHour:6})),__append('\n  <div class="form-group">\n    <div class="filter-radioLabels">\n      <label>\n        <input name="userType" type="radio" value="mine">\n        '),__append(helpers.t("filter:user:mine")),__append('\n      </label><label>\n        <input name="userType" type="radio" value="unseen">\n        '),__append(helpers.t("filter:user:unseen")),__append('\n      </label><label>\n        <input name="userType" type="radio" value="others">\n        '),__append(helpers.t("filter:user:others")),__append('\n      </label>\n    </div>\n    <input id="'),__append(idPrefix),__append('-user" name="user" type="text">\n  </div>\n  <div class="form-group" style="min-width: 150px">\n    <div class="filter-radioLabels">\n      <label>\n        <input name="statusType" type="radio" value="specific">\n        '),__append(helpers.t("filter:status:specific")),__append('\n      </label><label class="fap-entries-filter-analysis">\n        <input name="statusType" type="radio" value="analysis">\n        '),__append(helpers.t("filter:status:analysis")),__append('\n      </label>\n    </div>\n    <select id="'),__append(idPrefix),__append('-status" name="status[]" class="form-control is-expandable" multiple size="1" data-expanded-length="10">\n      '),statuses.forEach(function(e){__append('\n        <option value="'),__append(e),__append('">'),__append(helpers.t("status:"+e)),__append("</option>\n      ")}),__append('\n    </select>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-order">'),__append(helpers.t("filter:order")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-order" name="order" class="form-control text-mono" type="text" pattern="^[A-Za-z0-9]{7,12}$" style="width: 110px">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-mrp">'),__append(helpers.t("PROPERTY:mrp")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-mrp" name="mrp" type="text" autocomplete="new-password" data-placeholder=" ">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-category">'),__append(helpers.t("PROPERTY:category")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-category" name="category" type="text" autocomplete="new-password" data-placeholder=" ">\n  </div>\n  '),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(helpers.t("filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});