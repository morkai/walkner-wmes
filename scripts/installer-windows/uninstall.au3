#RequireAdmin
#NoTrayIcon

#AutoIt3Wrapper_Icon=.\uninstall.ico
#AutoIt3Wrapper_Outfile=.\walkner-wmes-operator-uninstall.exe
#AutoIt3Wrapper_Res_Description=Odinstaluj aplikację Operator WMES.
#AutoIt3Wrapper_Res_Fileversion=1.0.0.0
#AutoIt3Wrapper_Res_ProductVersion=0.0.0
#AutoIt3Wrapper_Res_LegalCopyright=Copyright © 2014 walkner.pl
#AutoIt3Wrapper_Res_Language=1045
#AutoIt3Wrapper_Res_Field=OriginalFilename|walkner-wmes-uninstall.exe
#AutoIt3Wrapper_Res_Field=FileDescription|Plik usuwający aplikację Operator WMES.
#AutoIt3Wrapper_Res_Field=ProductName|Operator WMES
#AutoIt3Wrapper_Res_Field=CompanyName|Walkner elektronika przemysłowa Zbigniew Walukiewicz
#AutoIt3Wrapper_Res_Field=HomePage|http://walkner.pl/
#AutoIt3Wrapper_Res_Field=E-mail|walkner@walkner.pl

#include ".\common.au3"

Global Const $ROOT_DIR = $CmdLine[0] == 2 ? @WorkingDir : (@ScriptDir & "\..")

If Not FileExists($ROOT_DIR & "\bin\" & @ScriptName) Then
  Exit
EndIf

If $CmdLine[0] == 2 Then
  SplashText("Usuwanie aplikacji...")

  FileDelete($ROOT_DIR & "\bin\" & @ScriptName)

  $dataRemoved = $CmdLine[1] == "1"
  $hasRemainingApps = $CmdLine[2] <> "0"

  If $dataRemoved And Not $hasRemainingApps Then
    DirRemove($ROOT_DIR, 1)
  ElseIf Not $hasRemainingApps Then
    DirRemove($ROOT_DIR & "\bin", 1)
    DirRemove($ROOT_DIR & "\config", 1)
    DirRemove($ROOT_DIR & "\docs", 1)
    DirRemove($ROOT_DIR & "\logs", 1)
  EndIf

  RegDelete("HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{" & $PRODUCT_GUID & "}")

  SplashOff()
  MsgBox(BitOr($MB_OK, $MB_ICONINFORMATION), $PRODUCT_NAME & " - Usuwanie", "Zakończono usuwanie aplikacji " & $PRODUCT_NAME & "!")
  Exit
EndIf

If MsgBox(BitOr($MB_YESNO, $MB_ICONWARNING), $PRODUCT_NAME & " - Usuwanie", "Czy na pewno chcesz usunąć aplikację " & $PRODUCT_NAME & "?") == $IDNO Then
  Exit 0
EndIf

SplashText("Zamykanie aplikacji w schowku...", False)

If ProcessExists("Operator WMES.exe") Then
  ProcessClose("Operator WMES.exe")
  ProcessWaitClose("Operator WMES.exe", 5000)
EndIf

_Singleton($SERVICE_NAME)

SplashText("Zamykanie okna formatki...")
WinClose("[REGEXPCLASS:(.*Chrome.*); REGEXPTITLE:(.*" & $BROWSER_TITLE & ".*)]")

SplashText("Usuwanie skrótów...")
FileDelete(@DesktopDir & "\" & $PRODUCT_NAME & ".lnk")
FileDelete(@StartupDir & "\" & $PRODUCT_NAME & ".lnk")
DirRemove(@ProgramsDir & "\Walkner\" & $PRODUCT_NAME, 1)

If CountFilesInDir(@ProgramsDir & "\Walkner") == 0 Then
  DirRemove(@ProgramsDir & "\Walkner", 1)
EndIf

SplashText("Usuwanie aplikacji...", True)
DirRemove($ROOT_DIR & "\bin\" & $SERVICE_NAME & "", 1)
FileDelete($ROOT_DIR & "\config\" & $SERVICE_NAME & ".ini")
FileDelete($ROOT_DIR & "\docs\" & $SERVICE_NAME & "*.*")
FileDelete($ROOT_DIR & "\logs\" & $SERVICE_NAME & "*.*")
FileDelete($ROOT_DIR & "\" & $PRODUCT_NAME & ".exe")

$tempUninstaller = @TempDir & "\" & @scriptName
$installedAppCount = CountFilesInDir($ROOT_DIR & "\config")

FileCopy(@ScriptFullPath, $tempUninstaller, BitOr($FC_OVERWRITE, $FC_CREATEPATH))
SplashOff()
ShellExecute($tempUninstaller, "1 " & $installedAppCount, $ROOT_DIR, "open", @SW_HIDE)
