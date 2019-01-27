define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})formGroup&&(__append('\n<div class="form-group '),__append(hidden?"hidden":""),__append('" data-filter="'),__append(property),__append('">\n')),__append('\n<div id="'),__append(idPrefix),__append("-dateTimeRange-"),__append(property),__append('" class="dateTimeRange" data-property="'),__append(property),__append('" data-utc="'),__append(utc),__append('" data-set-time="'),__append(setTime),__append('" data-type="'),__append(type),__append('" data-start-hour="'),__append(startHour),__append('" data-shift-length="'),__append(shiftLength),__append('">\n  <div class="dateTimeRange-labels">\n    '),labels.forEach(function(e){__append('\n    <div class="dateTimeRange-label '),__append(e.dropdown||e.ranges?"dropdown":""),__append(" "),__append(e.input?"dateTimeRange-is-input":""),__append('">\n      <label\n        class="control-label '),__append(e.dropdown||e.ranges?"dropdown-toggle":""),__append('"\n        '),__append(e.dropdown||e.ranges?'data-toggle="dropdown"':""),__append("\n        "),e.input&&(__append('for="'),__append(idPrefix),__append("-"),__append(e.input.name),__append("-"),__append(e.input.value),__append('"')),__append("\n      >\n        "),e.input&&(__append('\n        <input id="'),__append(idPrefix),__append("-"),__append(e.input.name),__append("-"),__append(e.input.value),__append('" class="dateTimeRange-label-input" type="'),__append(e.input.type),__append('" name="'),__append(e.input.name),__append('" value="'),__append(e.input.value),__append('">\n        ')),__append("\n        "),__append(e.text),__append("\n        "),(e.dropdown||e.ranges)&&__append('<span class="caret"></span>'),__append("\n      </label>\n      "),e.ranges?(__append('\n      <table class="dropdown-menu dateTimeRange-ranges">\n        '),Object.keys(e.ranges).forEach(function(p){__append("\n        <tr>\n          <th>"),__append(t("core","dateTimeRange:"+p)),__append("</th>\n          "),e.ranges[p].forEach(function(e){__append("\n          <td>\n            "),e&&(__append('\n            <a href="javascript:void(0)" data-date-time-group="'),__append(p),__append('" data-date-time-range="'),__append(e),__append('">\n              '),t.has("core","dateTimeRange:"+p+":"+e)?(__append("\n              "),__append(t("core","dateTimeRange:"+p+":"+e)),__append("\n              ")):t.has("core","dateTimeRange:"+e)?(__append("\n              "),__append(t("core","dateTimeRange:"+e)),__append("\n              ")):(__append("\n              "),__append(e),__append("\n              ")),__append("\n            </a>\n            ")),__append("\n          </td>\n          ")}),__append("\n        </tr>\n        ")}),__append('\n        <tr>\n          <td colspan="999" class="dateTimeRange-help">'),__append(t("core","dateTimeRange:help")),__append("</td>\n        </tr>\n      </table>\n      ")):e.dropdown&&(__append('\n      <ul class="dropdown-menu">\n        '),e.dropdown.forEach(function(e){__append("\n        <li><a "),__append(e.attrs),__append(">"),__append(e.text),__append("</a></li>\n        ")}),__append("\n      </ul>\n      ")),__append("\n    </div>\n    ")}),__append('\n  </div>\n  <div class="dateTimeRange-fields">\n    <div class="dateTimeRange-field dateTimeRange-from">\n      '),/date|month/.test(type)&&(__append('\n        <input id="'),__append(idPrefix),__append('-from-date" name="from-date" class="form-control" type="'),__append(/month/.test(type)?"month":"date"),__append('" placeholder="'),__append(t("core","dateTimeRange:placeholder:date")),__append('" min="'),__append(minDate),__append('" max="'),__append(maxDate),__append('" '),__append(required.date?"required":""),__append(">\n      ")),__append("\n      "),/time/.test(type)&&(__append('\n      <input id="'),__append(idPrefix),__append('-from-time" name="from-time" class="form-control" type="time" placeholder="'),__append(t("core","dateTimeRange:placeholder:time")),__append('" '),__append(required.time?"required":""),__append(">\n      ")),__append('\n    </div>\n    <div class="dateTimeRange-separator">'),__append(separator),__append('</div>\n    <div class="dateTimeRange-field dateTimeRange-to">\n      '),/date|month/.test(type)&&(__append('\n      <input id="'),__append(idPrefix),__append('-to-date" name="to-date" class="form-control" type="'),__append(/month/.test(type)?"month":"date"),__append('" placeholder="'),__append(t("core","dateTimeRange:placeholder:date")),__append('" min="'),__append(minDate),__append('" max="'),__append(maxDate),__append('" '),__append(required.date?"required":""),__append(">\n      ")),__append("\n      "),/time/.test(type)&&(__append('\n      <input id="'),__append(idPrefix),__append('-to-time" name="to-time" class="form-control" type="time" placeholder="'),__append(t("core","dateTimeRange:placeholder:time")),__append('" '),__append(required.time?"required":""),__append(">\n      ")),__append("\n    </div>\n  </div>\n</div>\n"),formGroup&&__append("\n</div>\n"),__append("\n");return __output.join("")}});