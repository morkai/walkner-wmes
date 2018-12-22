define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="paintShop" style="height: '),__append(height),__append('">\n  <div class="paintShop-left">\n    <div id="'),__append(idPrefix),__append('-todo" class="paintShop-list-container is-scrollable"></div>\n    <input id="'),__append(idPrefix),__append('-search" class="paintShop-search is-empty" data-vkb="numeric" maxlength="9" placeholder="&#xF002;">\n  </div>\n  <div class="paintShop-center">\n    <div id="'),__append(idPrefix),__append('-queue" class="paintShop-queue-container is-scrollable"></div>\n    <div class="paintShop-tabs-container">\n      <div id="'),__append(idPrefix),__append('-selectedPaint" class="paintShop-tab paintShop-tab-paint '),__append(selectedPaint.dropped?"is-dropped":""),__append('">\n        <div class="paintShop-tab-paint-inner">\n          <i class="fa fa-paint-brush"></i>\n          <span>'),__append(escapeFn(selectedPaint.label)),__append('</span>\n          <i class="fa fa-level-down"></i>\n        </div>\n      </div>\n      <div id="'),__append(idPrefix),__append('-tabs" class="paintShop-tabs">\n        '),__append(renderTabs({tabs})),__append('\n      </div>\n    </div>\n  </div>\n  <div class="paintShop-right">\n    <div id="'),__append(idPrefix),__append('-done" class="paintShop-list-container is-scrollable"></div>\n    <div id="'),__append(idPrefix),__append('-totals" class="paintShop-totals">\n      '),__append(renderTotals({totals})),__append('\n    </div>\n  </div>\n  <div id="'),__append(idPrefix),__append('-vkb"></div>\n</div>\n');return __output.join("")}});