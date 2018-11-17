define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form">\n  '),__append(forms.dateTimeRange({idPrefix:idPrefix,property:"requestedAt",type:"date+time",startHour:6,labels:{text:helpers.t("requests:requestedAt"),ranges:"+shifts"}})),__append('\n  <div id="'),__append(idPrefix),__append('-orgUnit" class="form-group"></div>\n  '),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(t("isa","requests:filter"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});