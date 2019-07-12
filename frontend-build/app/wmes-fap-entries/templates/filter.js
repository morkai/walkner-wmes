define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form fap-entries-filter" autocomplete="off">\n  '),__append(forms.dateTimeRange({idPrefix:idPrefix,property:"createdAt",startHour:6,hidden:!0})),__append('\n  <div class="form-group" data-filter="search">\n    <label for="'),__append(idPrefix),__append('-search">'),__append(helpers.t("PROPERTY:search")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-search" name="search" class="form-control" type="text" maxlength="50" style="width: 125px">\n  </div>\n  <div class="form-group">\n    <div class="filter-radioLabels">\n      <label>\n        <input name="userType" type="radio" value="mine">\n        '),__append(helpers.t("filter:user:mine")),__append('\n      </label><label>\n        <input name="userType" type="radio" value="unseen">\n        '),__append(helpers.t("filter:user:unseen")),__append('\n      </label><label>\n        <input name="userType" type="radio" value="others">\n        '),__append(helpers.t("filter:user:others")),__append('\n      </label>\n    </div>\n    <input id="'),__append(idPrefix),__append('-user" name="user" type="text">\n  </div>\n  <div class="form-group" style="min-width: 150px">\n    <div class="filter-radioLabels">\n      <label>\n        <input name="statusType" type="radio" value="specific">\n        '),__append(helpers.t("filter:status:specific")),__append('\n      </label><label class="fap-entries-filter-analysis">\n        <input name="statusType" type="radio" value="analysis">\n        '),__append(helpers.t("filter:status:analysis")),__append('\n      </label>\n    </div>\n    <select id="'),__append(idPrefix),__append('-status" name="status[]" class="form-control is-expandable" multiple size="1" data-expanded-length="10">\n      '),statuses.forEach(function(e){__append('\n      <option value="'),__append(e),__append('">'),__append(helpers.t("status:"+e)),__append("</option>\n      ")}),__append('\n    </select>\n  </div>\n  <div class="form-group hidden" data-filter="order">\n    <label for="'),__append(idPrefix),__append('-order">'),__append(helpers.t("PROPERTY:order")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-order" name="order" class="form-control text-mono" type="text" pattern="^[A-Za-z0-9]{7,12}$" style="width: 110px">\n  </div>\n  <div class="form-group hidden" data-filter="mrp">\n    <label for="'),__append(idPrefix),__append('-mrp">'),__append(helpers.t("PROPERTY:mrp")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-mrp" name="mrp" type="text" autocomplete="new-password" data-placeholder=" ">\n  </div>\n  <div class="form-group hidden" data-filter="category">\n    <label for="'),__append(idPrefix),__append('-category">'),__append(helpers.t("PROPERTY:category")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-category" name="category" type="text" autocomplete="new-password" data-placeholder=" ">\n  </div>\n  <div class="form-group hidden" data-filter="subdivisionType">\n    <label for="'),__append(idPrefix),__append('-subdivisionType">'),__append(helpers.t("PROPERTY:subdivisionType")),__append('</label>\n    <select id="'),__append(idPrefix),__append('-subdivisionType" name="subdivisionType[]" class="form-control is-expandable" multiple size="1" data-expanded-length="10">\n      '),subdivisionTypes.forEach(function(e){__append('\n      <option value="'),__append(escapeFn(e)),__append('">'),__append(helpers.t("subdivisionType:"+e)),__append("</option>\n      ")}),__append('\n    </select>\n  </div>\n  <div class="form-group hidden" data-filter="divisions">\n    <label for="'),__append(idPrefix),__append('-divisions">'),__append(helpers.t("PROPERTY:divisions")),__append('</label>\n    <select id="'),__append(idPrefix),__append('-divisions" name="divisions[]" class="form-control is-expandable" multiple size="1" data-expanded-length="10">\n      '),divisions.forEach(function(e){__append('\n      <option value="'),__append(escapeFn(e.id)),__append('">'),__append(escapeFn(e.text)),__append("</option>\n      ")}),__append('\n    </select>\n  </div>\n  <div class="form-group hidden" data-filter="level">\n    <label for="'),__append(idPrefix),__append('-level">'),__append(helpers.t("PROPERTY:level")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-level" class="btn-group filter-btn-group" data-toggle="buttons">\n      '),[0,1,2,3,4].forEach(function(e){__append('\n      <label class="btn btn-default">\n        <input type="radio" name="level" value="'),__append(e),__append('"> '),__append(e),__append("\n      </label>\n      ")}),__append("\n    </div>\n  </div>\n  "),__append(renderLimit({hidden:!0})),__append('\n  <div class="form-group filter-actions">\n    <div class="btn-group">\n      <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(helpers.t("filter:submit")),__append('</span></button>\n      <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="'),__append(helpers.t("filter:filters")),__append('"><span class="caret"></span></button>\n      <ul class="dropdown-menu">\n        '),filters.forEach(function(e){__append('\n        <li><a data-filter="'),__append(e),__append('">'),__append(helpers.t("PROPERTY:"+e)),__append("</a></li>\n        ")}),__append("\n      </ul>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});