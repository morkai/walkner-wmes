define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div>\n  <div id="'),__append(idPrefix),__append('-current" class="paintShopLoad-current" style="color: '),__append(current.color),__append('">\n    <div id="'),__append(idPrefix),__append('-current-duration" class="paintShopLoad-current-duration">'),__append(current.duration),__append('</div>\n    <div id="'),__append(idPrefix),__append('-current-icon" class="paintShopLoad-current-icon"><i class="fa fa-'),__append(current.icon),__append('"></i></div>\n  </div>\n  <div class="paintShopLoad-hr-h"></div>\n  <div class="paintShopLoad-stats">\n    '),stats.forEach(function(n){__append('\n    <div class="paintShopLoad-stat" data-stat="'),__append(n.id),__append('">\n      <div class="paintShopLoad-stat-value" style="color: '),__append(n.color),__append('">'),__append(n.count),__append('</div>\n      <div class="paintShopLoad-stat-label">'),__append(t("paintShop","load:stats:"+n.id)),__append('</div>\n      <div class="paintShopLoad-stat-value" style="color: '),__append(n.color),__append('">'),__append(n.duration),__append('</div>\n    </div>\n    <div class="paintShopLoad-hr-v"></div>\n    ')}),__append('\n  </div>\n  <div class="paintShopLoad-hr-h"></div>\n</div>\n');return __output.join("")}});