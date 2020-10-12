@echo off

set OLD_CD=%CD%
set NEW_CD=%~dp0
set DB_HOST=%WMES_MONGODB_PRIMARY%
set DB_NAME=%1

if [%1] == [] SET DB_NAME=walkner-wmes
if [%DB_HOST%] == [] set DB_HOST=localhost

set AUTH=--authenticationDatabase %DB_NAME% --username %WMES_MONGODB_USER% --password %WMES_MONGODB_PASS%

if [%WMES_MONGODB_USER%] == [] set AUTH=

cd %NEW_CD%
call mongo --host %DB_HOST% %AUTH% %DB_NAME% %NEW_CD%mongodb-update.js
cd %OLD_CD%
