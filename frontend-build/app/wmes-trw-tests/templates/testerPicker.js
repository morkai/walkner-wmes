define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="trw-testerPicker">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-filter" class="control-label">'),__append(helpers.t("testerPicker:filter")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-filter" name="filter" class="form-control" type="text" data-vkb="alpha numeric">\n  </div>\n  <div id="'),__append(idPrefix),__append('-testerGroup" class="form-group">\n    <label class="control-label">'),__append(helpers.t("testerPicker:testers")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-testers" class="trw-testing-list" style="height: 64px">\n      <i class="fa fa-spinner fa-spin"></i>\n    </div>\n    </div>\n  <div class="form-actions">\n    <button class="btn btn-lg btn-primary">'),__append(helpers.t("testerPicker:submit")),__append('</button>\n    <button class="btn btn-lg btn-link cancel" type="button">'),__append(helpers.t("testerPicker:cancel")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});