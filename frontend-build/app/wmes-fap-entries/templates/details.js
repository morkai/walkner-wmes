define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(p){return _ENCODE_HTML_RULES[p]||p}var __output=[],__append=__output.push.bind(__output);with(locals||{}){__append('<div class="fap-details">\n  <div id="'),__append(idPrefix),__append('-message" class="message message-inline message-'),__append(model.message.type),__append('">\n    '),__append(model.message.text),__append('\n  </div>\n  <div class="fap-props">\n    <div class="fap-prop" data-prop="rid">\n      <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:rid")),__append('</div>\n      <div class="fap-prop-value text-mono">'),__append(escapeFn(model.rid)),__append('</div>\n    </div>\n    <div class="fap-prop" data-prop="category">\n      <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:category")),__append('</div>\n      <div class="fap-prop-value">'),__append(escapeFn(model.category)),__append('</div>\n    </div>\n    <div class="fap-prop fap-is-textarea '),__append(model.multiline.problem?"fap-is-multiline":""),__append('" data-prop="problem">\n      <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:problem")),__append('</div>\n      <div class="fap-prop-value">'),__append(model.problem),__append('</div>\n    </div>\n  </div>\n  <div class="fap-prop-separator"></div>\n  <div class="fap-props">\n    <div class="fap-prop" data-prop="orderNo">\n      <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:orderNo")),__append('</div>\n      <div class="fap-prop-value text-mono">\n        '),"-"!==model.orderNo?(__append('\n        <a href="javascript:void(0)" class="fap-autolink" data-type="order" data-id="'),__append(model.orderNo),__append('">'),__append(model.orderNo),__append("</a>\n        ")):__append("\n        -\n        "),__append('\n      </div>\n    </div>\n    <div class="fap-prop" data-prop="nc12">\n      <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:nc12")),__append('</div>\n      <div class="fap-prop-value text-mono">'),__append(escapeFn(model.nc12)),__append('</div>\n    </div>\n    <div class="fap-prop" data-prop="productName">\n      <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:productName")),__append('</div>\n      <div class="fap-prop-value text-mono">'),__append(escapeFn(model.productName)),__append('</div>\n    </div>\n  </div>\n  <div class="fap-prop-separator"></div>\n  <div class="fap-props">\n    <div class="fap-prop" data-prop="qty">\n      <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:qty")),__append('</div>\n      <div class="fap-prop-value">\n        <span class="text-mono" data-prop="qtyDone">'),__append(model.qtyDone),__append('</span>\n        /\n        <span class="text-mono" data-prop="qtyTodo">'),__append(model.qtyTodo),__append('</span>\n      </div>\n    </div>\n    <div class="fap-prop" data-prop="mrp">\n      <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:mrp")),__append('</div>\n      <div class="fap-prop-value text-mono">'),__append(escapeFn(model.mrp)),__append('</div>\n    </div>\n    <div class="fap-prop" data-prop="divisions">\n      <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:divisions")),__append('</div>\n      <div class="fap-prop-value">'),__append(escapeFn(model.divisions)),__append('</div>\n    </div>\n    <div class="fap-prop" data-prop="lines">\n      <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:lines")),__append('</div>\n      <div class="fap-prop-value">'),__append(escapeFn(model.lines)),__append('</div>\n    </div>\n  </div>\n  <div class="fap-prop-separator"></div>\n  <div class="fap-props">\n    <div class="fap-prop" data-prop="subdivisionType">\n      <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:subdivisionType")),__append('</div>\n      <div class="fap-prop-value">'),__append(model.subdivisionType),__append('</div>\n    </div>\n    <div class="fap-prop" data-prop="componentCode">\n      <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:componentCode")),__append('</div>\n      <div class="fap-prop-value text-mono">'),__append(escapeFn(model.componentCode)),__append('</div>\n    </div>\n    <div class="fap-prop" data-prop="componentName">\n      <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:componentName")),__append('</div>\n      <div class="fap-prop-value text-mono">'),__append(escapeFn(model.componentName)),__append('</div>\n    </div>\n  </div>\n  <div class="fap-prop-separator"></div>\n  <div class="fap-chatAndAside">\n    <div id="'),__append(idPrefix),__append('-chat" class="fap-chat-container"></div>\n    <div id="'),__append(idPrefix),__append('-observersAndAttachments" class="fap-observersAndAttachments"></div>\n  </div>\n  <div class="fap-props">\n    <div class="fap-prop fap-is-textarea '),__append(model.multiline.solution?"fap-is-multiline":""),__append(" "),__append(model.empty.solution?"":"fap-is-success"),__append('" data-prop="solution" style="flex: 1 1 auto">\n      <div class="fap-prop-name">\n        '),__append(helpers.t("PROPERTY:solution")),__append('\n        <i class="fa fa-user" title="'),__append(escapeFn(model.solver)),__append('"></i>\n      </div>\n      <div class="fap-prop-value">'),__append(model.solution),__append('</div>\n    </div>\n  </div>\n  <div class="fap-prop-separator"></div>\n  <div class="fap-analysis">\n    <div class="fap-analysis-header">'),__append(helpers.t("assessment:header")),__append('</div>\n    <div class="fap-prop-separator"></div>\n    <div class="fap-props fap-prop-assessment">\n      <div class="fap-prop" data-prop="assessment">\n        <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:assessment")),__append('</div>\n        <div class="fap-prop-value">'),__append(model.assessment),__append('</div>\n      </div>\n      <div class="fap-prop" data-prop="analysisNeed">\n        <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:analysisNeed")),__append('</div>\n        <div class="fap-prop-value">'),__append(model.analysisNeed),__append('</div>\n      </div>\n      <div class="fap-prop" data-prop="analysisDone">\n        <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:analysisDone")),__append('</div>\n        <div class="fap-prop-value">'),__append(model.analysisDone),__append('</div>\n      </div>\n    </div>\n    <div class="fap-prop-separator"></div>\n    <div class="fap-props">\n      <div class="fap-prop" data-prop="mainAnalyzer" style="flex: 1 1 auto">\n        <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:mainAnalyzer")),__append('</div>\n        <div class="fap-prop-value">'),__append(model.mainAnalyzer),__append('</div>\n      </div>\n      <div class="fap-prop" data-prop="analyzers" style="flex: 2 1 auto">\n        <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:analyzers")),__append('</div>\n        <div class="fap-prop-value">'),__append(model.analyzers),__append('</div>\n      </div>\n    </div>\n    <div class="fap-prop-separator"></div>\n    <div class="fap-props">\n      <div class="fap-prop" data-prop="why5" style="flex: 1 1 auto">\n        <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:why5")),__append('</div>\n        <div class="fap-prop-value">\n          ');for(var i=0;i<5;++i)__append('\n            <div class="fap-analysis-why" data-why-index="'),__append(i),__append('">\n              <div class="fap-analysis-why-label">'),__append(helpers.t("PROPERTY:why")),__append('</div>\n              <div class="fap-analysis-why-value">'),__append(model.why5[i]||""),__append("</div>\n            </div>\n          ");__append('\n        </div>\n      </div>\n    </div>\n    <div class="fap-prop-separator"></div>\n    <div class="fap-props">\n      <div class="fap-prop fap-is-textarea '),__append(model.multiline.solutionSteps?"fap-is-multiline":""),__append('" data-prop="solutionSteps" style="flex: 1 1 auto">\n        <div class="fap-prop-name">'),__append(helpers.t("PROPERTY:solutionSteps")),__append('</div>\n        <div class="fap-prop-value">'),__append(model.solutionSteps),__append('</div>\n      </div>\n    </div>\n  </div>\n  <div class="fap-prop-separator" style="margin-top: 15px"></div>\n</div>\n')}return __output.join("")}});