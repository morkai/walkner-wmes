define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form">\n  '),__append(forms.dateTimeRange({idPrefix,type:"date",startHour:6})),__append('\n  <div class="form-group">\n    <label>'),__append(t("core","filter:shift")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-shift" class="btn-group filter-btn-group" data-toggle="buttons">\n      '),[0,1,2,3].forEach(function(e){__append('\n      <label class="btn btn-default">\n        <input type="radio" name="shift" value="'),__append(e),__append('"> '),__append(t("core","SHIFT:"+e)),__append("\n      </label>\n      ")}),__append('\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-orderMrp">'),__append(helpers.t("filter:orderMrp")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-orderMrp" name="orderMrp" type="text" autocomplete="new-password" data-placeholder=" ">\n  </div>\n  <div id="'),__append(idPrefix),__append('-orgUnit" class="form-group"></div>\n  '),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(helpers.t("filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});