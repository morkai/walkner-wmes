// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/util/pageActions","app/core/pages/FilteredListPage","../views/PscsResultFilterView","../views/PscsResultListView"],function(e,i,t,s,c){"use strict";return t.extend({baseBreadcrumb:"#pscs",FilterView:s,ListView:c,actions:function(e){return[i.export(e,this,this.collection,!1)]}})});