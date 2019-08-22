define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form">\n  '),__append(forms.dateTimeRange({idPrefix:idPrefix,property:"time",type:"date+time",startHour:6,labels:{text:helpers.t("PROPERTY:time"),ranges:!0}})),__append('\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-nc15">'),__append(helpers.t("PROPERTY:nc15")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-nc15" class="form-control" name="nc15" type="text" maxlength="15" pattern="^[0-9]{6,15}$" style="width: 140px">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-orderNo">'),__append(helpers.t("PROPERTY:orderNo")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-orderNo" class="form-control" name="orderNo" type="text" maxlength="9" pattern="^[0-9]{9}$" style="width: 90px">\n  </div>\n  <div id="'),__append(idPrefix),__append('-orgUnit" class="form-group"></div>\n  '),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(helpers.t("core","filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});