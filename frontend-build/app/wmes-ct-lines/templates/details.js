define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<div>\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitle),__append('</div>\n    <div class="panel-details">\n      '),__append(helpers.props(model,["_id","active","type","stationCount"])),__append("\n    </div>\n  </div>\n  "),model.stations.forEach(function(n,p){__append("\n  "),"inveo"===type?(__append("\n  "),function(){__append('<div class="panel panel-default">\n  <div class="panel-heading">'),__append(t("stations:title",{no:p+1})),__append('</div>\n  <div class="panel-details">\n    '),__append(helpers.props(n,[{id:"lampIp",label:t("PROPERTY:stations:lampIp")}])),__append("\n  </div>\n</div>\n")}.call(this),__append("\n  ")):"luma2"===type&&(__append("\n  "),function(){__append('<div class="panel panel-default">\n  <div class="panel-heading">'),__append(t("stations:title",{no:p+1})),__append("</div>\n</div>\n")}.call(this),__append("\n  ")),__append("\n  ")}),__append("\n</div>\n");return __output}});