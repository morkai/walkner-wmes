// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport"],function(n,e){"use strict";n.map("/changelog",function(){e.loadPage(["app/changelog/pages/ListPage","i18n!app/nls/changelog"],function(n){return new n})})});