define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(a){return String(a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="page">\n  <div class="hd">\n    <nav class="navbar navbar-default"></nav>\n    <div class="page-alerts"></div>\n    <div class="page-header">\n      <ul class="page-actions"></ul>\n      <ul class="page-breadcrumbs"></ul>\n    </div>\n  </div>\n  <div class="bd"></div>\n  <div class="ft">\n    <p>\n      WMES v',version,'<br>\n      <a href="http://miracle.systems/">miracle.systems</a>\n    </p>\n  </div>\n</div>\n')}();return buf.join("")}});