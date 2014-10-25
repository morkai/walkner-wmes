Unicode true
Name "Operator WMES v${PRODUCT_VERSION}"
InstallDir "C:\walkner"
OutFile "${__FILEDIR__}\..\..\build\walkner-wmes-operator-v${PRODUCT_VERSION}.exe"
AllowRootDirInstall false
SetCompressor /SOLID /FINAL lzma
RequestExecutionLevel admin

!include "MUI2.nsh"

!define REG_UNINST_KEY "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{${PRODUCT_GUID}}"

!define MUI_ABORTWARNING

!define MUI_FINISHPAGE_NOREBOOTSUPPORT
!define MUI_FINISHPAGE_RUN "$INSTDIR\Operator WMES.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Uruchom aplikację"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "Polish"

Function .onInit
  SetRegView 64
  ReadRegStr $0 HKLM "${REG_UNINST_KEY}" "DisplayVersion"
  SetRegView 32
  ReadRegStr $1 HKLM "${REG_UNINST_KEY}" "DisplayVersion"

  ${If} "$0" != ""
  ${OrIf} "$1" != ""
    MessageBox MB_OK|MB_ICONSTOP \
      "Aplikacja jest już zainstalowana.$\r$\n$\r$\n\
      Przed kontynuacją musisz usunąć aktualnie zainstalowaną wersję ($0$1)!" \
      /SD IDOK
    Abort
  ${EndIf}
FunctionEnd

Section
  SetOutPath "$INSTDIR"
  File /r "${__FILEDIR__}\..\..\build\installer\*.*"
SectionEnd
