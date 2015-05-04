// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n"],function(e){"use strict";return function(r,n){var l=r.modelProperty?r[r.modelProperty]:r.model||r.collection,t=l.getNlsDomain();return n=Array.isArray(n)?n.map(function(r){return"string"==typeof r?{label:":"===r[0]?e.bound(t,"BREADCRUMBS"+r):r}:("string"==typeof r.label&&":"===r.label[0]&&(r.label=e.bound(t,"BREADCRUMBS"+r.label)),r)}):[],n.unshift({label:e.bound(t,"BREADCRUMBS:browse"),href:n.length?l.genClientUrl("base"):null}),r.baseBreadcrumb===!0?n.unshift(e.bound(t,"BREADCRUMBS:base")):r.baseBreadcrumb&&n.unshift({label:e.bound(t,"BREADCRUMBS:base"),href:r.baseBreadcrumb.toString()}),n}});