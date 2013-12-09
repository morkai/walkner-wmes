#Region ;**** Directives created by AutoIt3Wrapper_GUI ****
#AutoIt3Wrapper_Icon=FocusWMES.ico
#AutoIt3Wrapper_Add_Constants=n
#EndRegion ;**** Directives created by AutoIt3Wrapper_GUI ****

Opt("TrayAutoPause", 0)
Opt("WinTitleMatchMode", 2)

#include <GUIConstantsEx.au3>
#include <Date.au3>
#include <WindowsConstants.au3>

TraySetToolTip("WMES - Aktywator przegl�darki")

Dim $PATTERN

If $CmdLine[0] > 0 Then
	$PATTERN = $CmdLine[1]
Else
	$PATTERN = "Wannabe MES"
EndIf

$TWO_MINUTES = 60 * 1000 * 2;

While 1
	If @HOUR == "13" Or @HOUR == "21" Or @HOUR == "05" Then
		If @MIN == "50" Then
			WinActivate($PATTERN)
			Sleep($TWO_MINUTES)
		Else
			Sleep(1000)
		EndIf
	ElseIf  @MIN == "00" Then
		WinActivate($PATTERN)
		Sleep($TWO_MINUTES)
	Else
		Sleep(1000)
	EndIf
WEnd
