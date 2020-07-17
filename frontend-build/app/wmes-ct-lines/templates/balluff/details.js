define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<div class="panel panel-default">\n  <div class="panel-heading">'),__append(t("stations:title",{no:stationIndex+1})),__append('</div>\n  <div class="panel-details">\n    '),__append(helpers.props(station,[{id:"processorIp",label:t("PROPERTY:stations:processorIp")},{id:"headPort",label:t("PROPERTY:stations:headPort")},{id:"headNo",label:t("PROPERTY:stations:headNo")},{id:"redLampI",label:t("PROPERTY:stations:redLampI")},{id:"orangeLampI",label:t("PROPERTY:stations:orangeLampI")}])),__append("\n  </div>\n</div>\n");return __output}});