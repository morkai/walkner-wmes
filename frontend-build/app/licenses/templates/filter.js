define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(p){return _ENCODE_HTML_RULES[p]||p}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-_id">'),__append(helpers.t("PROPERTY:_id")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-_id" class="form-control" name="_id" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-appId">'),__append(helpers.t("PROPERTY:appName")),__append('</label>\n    <select id="'),__append(idPrefix),__append('-appId" class="form-control" name="appId">\n      <option value=""></option>\n      '),["msys-xiconf-lp","walkner-xiconf","walkner-icpo","wmes-docs"].forEach(function(p){__append('\n      <option value="'),__append(p),__append('">'),__append(helpers.t("app:"+p)),__append("</option>\n      ")}),__append("\n    </select>\n  </div>\n  "),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(helpers.t("filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});