define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<li class="list-group-item list-group-item-'),__append(className),__append(' xiconf-leds-led">\n  <div class="xiconf-leds-status"><i class="fa '),__append(statusIcon),__append('"></i></div>\n  <div class="xiconf-leds-serialNumber">'),__append(serialNumber),__append('</div>\n  <div class="xiconf-leds-info" title="'),__append(escapeFn(name)),__append('">\n    <span class="xiconf-leds-name">'),__append(escapeFn(name)),__append('</span>\n    <span class="xiconf-leds-nc12">'),__append(escapeFn(nc12)),__append('</span>\n  </div>\n  <div class="xiconf-leds-error">'),__append(error),__append("</div>\n</li>\n");return __output.join("")}});