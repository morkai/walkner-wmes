#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include <StringConstants.au3>
#include "_Common.au3"

$outputPath = ReadIni("T_MD04", "OutputPath", ReadIni("Transactions", "OutputPath", "C:\SAP\Output"))
$outputFile = ReadIni("T_MD04", "OutputFile", "T_MD04.txt")
$codePage = ReadIni("T_MD04", "OutputEncoding", ReadIni("Transactions", "OutputEncoding", "4110"))
$plant = ReadIni("T_MD04", "Plant", "")
$material = ""

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug("T_MD04.exe <arguments>")
  LogDebug()
  LogDebug("Arguments:")
  LogDebug("  --plant")
  LogDebug("  --material")
  Exit(0)
EndIf

If $CmdLine[0] > 0 And Mod($CmdLine[0], 2) = 0 Then
  For $i = 1 To ($CmdLine[0] - 1) Step 2
    $k = $CmdLine[$i]
    $v = $CmdLine[$i + 1]

    Switch $k
      Case "--plant"
        $plant = $v
      Case "--material"
        $material = $v
    EndSwitch
  Next
EndIf

LogDebug("T_MD04")
LogDebug("--plant=" & $plant)
LogDebug("--material=" & $material)

#include "_Logon.au3"

LogDebug("STARTING_TRANSATION")

; Start transaction
$session.StartTransaction("MD04")

; Set material 12NC
$session.FindById("wnd[0]/usr/tabsTAB300/tabpF01/ssubINCLUDE300:SAPMM61R:0301/ctxtRM61R-MATNR").Text = $material

; Set plant
$session.FindById("wnd[0]/usr/tabsTAB300/tabpF01/ssubINCLUDE300:SAPMM61R:0301/ctxtRM61R-WERKS").Text = $plant

; Execute
$session.FindById("wnd[0]/usr/tabsTAB300/tabpF01/ssubINCLUDE300:SAPMM61R:0301/ctxtRM61R-WERKS").SetFocus()
$session.FindById("wnd[0]").sendVKey(0)

; Expand material
$session.FindById("wnd[0]/usr/btnBUTTON_GROKO").Press()

; Read planist
$planist1 = $session.FindById("wnd[0]/usr/tabsTABTC/tabpTB01/ssubINCLUDE7XX:SAPLM61K:0101/txtT024D-DSNAM").Text
$planist2 = $session.FindById("wnd[0]/usr/tabsTABTC/tabpTB01/ssubINCLUDE7XX:SAPLM61K:0101/txtT024-EKNAM").Text

; Back to main screen
$session.FindById("wnd[0]/tbar[0]/btn[15]").Press()
$session.FindById("wnd[0]/tbar[0]/btn[15]").Press()

LogDebug("ENDING_TRANSACTION")

CloseSession()

LogDebug('planist1="' & $planist1 & '"')
LogDebug('planist2="' & $planist2 & '"')
