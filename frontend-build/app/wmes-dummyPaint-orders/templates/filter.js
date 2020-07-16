define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form class="well filter-form" autocomplete="off">\n  <div class="form-group">\n    <label>'),__append(t("PROPERTY:changed")),__append('</label>\n    <div id="'),__append(id("changed")),__append('" class="btn-group filter-btn-group" data-toggle="buttons">\n      <label class="btn btn-default"><input type="radio" name="changed" value="true"> '),__append(t("core","BOOL:true")),__append('</label>\n      <label class="btn btn-default"><input type="radio" name="changed" value="false"> '),__append(t("core","BOOL:false")),__append("</label>\n    </div>\n  </div>\n  "),__append(forms.dateTimeRange({idPrefix:idPrefix,property:"createdAt",type:"date+time",startHour:6,labels:{text:t("PROPERTY:createdAt"),ranges:!0}})),__append("\n  "),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(t("core","filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output}});