define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div>\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitle),__append('</div>\n    <div class="panel-details">\n      '),__append(helpers.props(model,["name","tester"])),__append('\n    </div>\n  </div>\n  <div class="panel-body trw-base-canvas-outer">\n    <div id="'),__append(idPrefix),__append('-canvas" class="trw-base-canvas-inner">\n      '),model.clusters.forEach(function(n){__append("\n      "),function(){__append('<div id="TRW:'),__append(n._id),__append('" class="trw-base-cluster" data-id="'),__append(n._id),__append('" data-connector="'),__append(n.connector),__append('" style="top: '),__append(n.top),__append("px; left: "),__append(n.left),__append('px">\n  <div class="trw-base-rows">\n    '),n.rows.forEach(function(p,a){__append("\n    "),0===p.length?__append('\n    <div class="trw-base-spacer"></div>\n    '):(__append('\n    <div class="trw-base-row">\n      '),p.forEach(function(p,e){__append('\n      <div id="TRW:'),__append(n._id),__append(":"),__append(a),__append(":"),__append(e),__append('" class="trw-base-cell '),__append(p.io.length?"is-with-io":"is-without-io"),__append('" data-row="'),__append(a),__append('" data-col="'),__append(e),__append('">\n        <div class="trw-base-cell-label">'),__append(p.label),__append("</div>\n        "),p.endpoints.forEach(function(n){__append('\n        <div class="trw-base-endpoint" data-position="'),__append(n),__append('"></div>\n        ')}),__append("\n      </div>\n      ")}),__append("\n    </div>\n    ")),__append("\n    ")}),__append('\n  </div>\n  <div class="trw-base-cluster-label" data-position="'),__append(n.label.position),__append('">\n    '),__append(n.label.text),__append("\n  </div>\n</div>\n")}.call(this),__append("\n      ")}),__append("\n    </div>\n  </div>\n</div>\n");return __output.join("")}});