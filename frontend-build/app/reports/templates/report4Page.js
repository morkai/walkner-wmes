define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(n){return String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="reports-4">\n  <div class="filter-container"></div>\n  <div class="reports-4-container">\n    <div class="row">\n      <div class="col-lg-6 reports-4-effAndProd-container"></div>\n      <div class="col-lg-6 reports-4-workTimes-container"></div>\n    </div>\n    <div class="row">\n      <div class="col-lg-6 reports-4-machineTimes-container"></div>\n      <div class="col-lg-6 reports-4-quantities-container"></div>\n    </div>\n  </div>\n</div>\n')}();return buf.join("")}});