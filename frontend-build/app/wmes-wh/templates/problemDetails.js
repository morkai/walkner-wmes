define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<div class="wh-problems-details">\n  <div class="wh-problems-details-details">\n    <div id="'),__append(idPrefix),__append('-orderInfo" class="wh-problems-row '),__append("cancelled"===whOrder.status?"is-cancelled":""),__append('">\n      '),__append(renderOrderInfo({helpers:helpers,whOrder:whOrder})),__append('\n    </div>\n    <div id="'),__append(idPrefix),__append('-funcs" class="wh-problems-row">\n      '),__append(renderFuncs({helpers:helpers,funcs:funcs})),__append('\n    </div>\n  </div>\n  <div id="'),__append(idPrefix),__append('-chat" class="wh-problems-chat-container"></div>\n</div>\n');return __output}});