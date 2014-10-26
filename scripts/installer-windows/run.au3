#Region ;**** Directives created by AutoIt3Wrapper_GUI ****
#AutoIt3Wrapper_Icon=.\run.ico
#AutoIt3Wrapper_Outfile=.\Operator WMES.exe
#AutoIt3Wrapper_Res_Description=Operator WMES
#AutoIt3Wrapper_Res_Fileversion=1.0.0.0
#AutoIt3Wrapper_Res_ProductVersion=0.0.0
#AutoIt3Wrapper_Res_LegalCopyright=Copyright © 2014 walkner.pl
#AutoIt3Wrapper_Res_Language=1045
#AutoIt3Wrapper_Res_Field=OriginalFilename|Operator WMES.exe
#AutoIt3Wrapper_Res_Field=FileDescription|Plik uruchamiający aplikację Operator WMES.
#AutoIt3Wrapper_Res_Field=ProductName|Operator WMES
#AutoIt3Wrapper_Res_Field=CompanyName|Walkner elektronika przemysłowa Zbigniew Walukiewicz
#AutoIt3Wrapper_Res_Field=HomePage|http://walkner.pl/
#AutoIt3Wrapper_Res_Field=E-mail|walkner@walkner.pl
#AutoIt3Wrapper_Add_Constants=n
#EndRegion ;**** Directives created by AutoIt3Wrapper_GUI ****

Opt("TrayMenuMode", 3)
Opt("TrayOnEventMode", 1)

#include ".\common.au3"
#include <GUIConstantsEx.au3>
#include <Date.au3>
#include <WindowsConstants.au3>

Global Const $CHROME_WAIT_TIME = 60
Global Const $INI_FILE_PATH = @ScriptDir & "\config\" & $SERVICE_NAME & ".ini"
Global $SERVER_URL = IniRead($INI_FILE_PATH, "WMES", "SERVER_URL", "")
Global $PROD_LINE = IniRead($INI_FILE_PATH, "WMES", "PROD_LINE", "")

Global $BROWSER_PATTERN = "[REGEXPCLASS:(.*Chrome.*); REGEXPTITLE:(.*" & $BROWSER_TITLE & ".*)]"

If _Singleton($SERVICE_NAME, 1) = 0 Then
  ActivateBrowser()
  Exit
EndIf

SplashText("Konfiguracja...", True)

If Not FileExists($INI_FILE_PATH) Or $SERVER_URL = "" Or $PROD_LINE = "" Then
  CreateIniFile()
  CreateShortcuts()
EndIf

SplashText("Wyszukiwanie okna aplikacji...")

$browser = WinGetHandle($BROWSER_PATTERN)

If @error Then
  SplashText("Uruchamianie okna aplikacji... ")

  $app = $SERVER_URL

  If StringRight($app, 1) <> "/" Then
    $app = $app & "/"
  EndIf

  $app = $app & "?COMPUTERNAME=" & @ComputerName & "#production/" & $PROD_LINE

  $dataDir = @ScriptDir & "\data\google-chrome-profile"

  If Not FileExists($dataDir) Then
    DirCopy(@ScriptDir & "\bin\google-chrome\App\DefaultData\profile", $dataDir)
    FileCopy(@ScriptDir & "\bin\google-chrome\App\DefaultData\Local State", $dataDir & "\Local State")
  EndIf

  Run(@ScriptDir & '\bin\google-chrome\App\Chrome-bin\chrome.exe --user-data-dir="' & $dataDir & '" --app="' & $app & '"', @ScriptDir & "\bin\google-chrome\App\Chrome-bin")

  $browser = WinWait($BROWSER_PATTERN, "", $CHROME_WAIT_TIME)
EndIf

If Not IsHWnd($browser) Then
  ExitWithError("Nie udało się uruchomić okna aplikacji :(")
EndIf

SplashOff()
WinActivate($browser)
Send("!a")

TraySetToolTip($PRODUCT_NAME)
TrayCreateItem("Pokaż formatkę")
TrayItemSetOnEvent(-1, "ActivateBrowser")
TrayCreateItem("")
TrayCreateItem("Wyłącz")
TrayItemSetOnEvent(-1, "ExitScript")

$TWO_MINUTES = 60 * 1000 * 2;

While 1
	If @HOUR == "13" Or @HOUR == "21" Or @HOUR == "05" Then
		If @MIN == "50" Then
			WinActivate($BROWSER_PATTERN)
			Sleep($TWO_MINUTES)
		Else
			Sleep(1000)
		EndIf
	ElseIf  @MIN == "00" Then
		WinActivate($BROWSER_PATTERN)
		Sleep($TWO_MINUTES)
	Else
		Sleep(1000)
	EndIf
WEnd

Func CreateShortcuts()
  $key = "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{" & $PRODUCT_GUID & "}"

  RegWrite($key, "DisplayName", "REG_SZ", $PRODUCT_NAME)
  RegWrite($key, "DisplayVersion", "REG_SZ", $PRODUCT_VERSION)
  RegWrite($key, "DisplayIcon", "REG_SZ", '"' & @ScriptFullPath & '"')
  RegWrite($key, "Publisher", "REG_SZ", $PRODUCT_PUBLISHER)
  RegWrite($key, "URLInfoAbout", "REG_SZ", $PRODUCT_URL)
  RegWrite($key, "InstallLocation", "REG_SZ", '"' & @ScriptDir & '"')
  RegWrite($key, "UninstallString", "REG_SZ", '"' & @ScriptDir & "\bin\" & $SERVICE_NAME & '-uninstall.exe"')
  RegWrite($key, "NoModify", "REG_DWORD", 1)
  RegWrite($key, "NoRepair", "REG_DWORD", 1)
  RegWrite($key, "EstimatedSize", "REG_DWORD", 163840)

  $startMenu = @ProgramsDir & "\Walkner\" & $PRODUCT_NAME

  DirCreate($startMenu)
  FileCreateShortcut(@ScriptFullPath, $startMenu & "\Uruchom.lnk")
  FileCreateShortcut(@ScriptDir & "\bin\" & $SERVICE_NAME & "-uninstall.exe", $startMenu & "\Odinstaluj.lnk")
  FileCreateShortcut(@ScriptFullPath, @DesktopDir & "\" & $PRODUCT_NAME & ".lnk")

  If MsgBox(BitOr($MB_YESNO, $MB_ICONQUESTION), "Automatyczne uruchamianie", "Dodać skrót aplikacji do autostartu?") == $IDYES Then
    FileCreateShortcut(@ScriptFullPath, @StartupDir & "\" & $PRODUCT_NAME & ".lnk")
  EndIf
EndFunc

Func CreateIniFile()
  $PROD_LINE = InputBox("Podaj ID linii produkcyjnej", "ID linii produkcyjnej:", "", "", 325, 125)

  If $PROD_LINE = "" Then
    ExitWithError("ID linii produkcyjnej jest wymagane!")
  EndIf

  $SERVER_URL = InputBox("Podaj adres serwera WMES", "Adres serwera WMES:", "http://192.168.21.60:6080/", "", 325, 125)

  If Not StringRegExp($SERVER_URL, "^https?:\/\/.+") Then
    ExitWithError("Adres serwera WMES jest wymagany!")
  EndIf

  IniWrite($INI_FILE_PATH, "WMES", "PROD_LINE", $PROD_LINE)
  IniWrite($INI_FILE_PATH, "WMES", "SERVER_URL", $SERVER_URL)
EndFunc

Func ActivateBrowser()
  $browser = WinGetHandle($BROWSER_PATTERN)

  If @error Then
    $dataDir = @ScriptDir & "\data\google-chrome-profile"
    $app = $SERVER_URL

    If StringRight($app, 1) <> "/" Then
      $app = $app & "/"
    EndIf

    $app = $app & "?COMPUTERNAME=" & @ComputerName & "#production/" & $PROD_LINE

    Run(@ScriptDir & '\bin\google-chrome\App\Chrome-bin\chrome.exe --user-data-dir="' & $dataDir & '" --app="' & $app & '"', @ScriptDir & "\bin\google-chrome\App\Chrome-bin")

    $browser = WinWait($BROWSER_PATTERN, "", $CHROME_WAIT_TIME)
  EndIf

  WinActivate($browser)
EndFunc

Func ExitScript()
  Exit
EndFunc

