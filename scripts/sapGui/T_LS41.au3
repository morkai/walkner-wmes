#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include <Date.au3>
#include "_Common.au3"

$outputPath = ReadIni("T_LS41", "OutputPath", ReadIni("Transactions", "OutputPath", "C:\SAP\Output"))
$outputFile = ReadIni("T_LS41", "OutputFile", "T_LS41.txt")
$codePage = ReadIni("T_LS41", "OutputEncoding", ReadIni("Transactions", "OutputEncoding", "4110"))
$variant = ReadIni("T_LS41", "Variant", "")
$variantCreator = ReadIni("T_LS41", "VariantCreator", ReadIni("Transactions", "VariantCreator", ""))
$layout = ReadIni("T_LS41", "Layout", "")
$plant = ReadIni("T_LS41", "Plant", "")
$warehouse = ReadIni("T_LS41", "Warehouse", "")

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug("T_LS41.exe <arguments>")
  LogDebug()
  LogDebug("Arguments:")
  LogDebug("  --output-path")
  LogDebug("  --output-file")
  LogDebug("  --code-page")
  LogDebug("  --variant")
  LogDebug("  --variant-creator")
  LogDebug("  --layout")
  LogDebug("  --plant")
  LogDebug("  --warehouse")
  Exit(0)
EndIf

If $CmdLine[0] > 0 And Mod($CmdLine[0], 2) = 0 Then
  For $i = 1 To ($CmdLine[0] - 1) Step 2
    $k = $CmdLine[$i]
    $v = $CmdLine[$i + 1]

    Switch $k
      Case "--output-path"
        $outputPath = $v
      Case "--output-file"
        $outputFile = $v
      Case "--code-page"
        $codePage = $v
      Case "--variant"
        $variant = $v
      Case "--variant-creator"
        $variantCreator = $v
      Case "--layout"
        $layout = $v
      Case "--plant"
        $plant = $v
      Case "--warehouse"
        $warehouse = $v
    EndSwitch
  Next
EndIf

LogDebug("T_LS41")
LogDebug("--output-path=" & $outputPath)
LogDebug("--output-file=" & $outputFile)
LogDebug("--code-page=" & $codePage)
LogDebug("--variant=" & $variant)
LogDebug("--variant-creator=" & $variantCreator)
LogDebug("--layout=" & $layout)
LogDebug("--plant=" & $plant)
LogDebug("--warehouse=" & $warehouse)

#include "_Logon.au3"

StartTransaction("LS41")

SetVariant($session, $variant, $variantCreator)

; Set Plant
If $plant <> "" Then
  $session.FindById("wnd[0]/usr/ctxtWERKS-LOW").Text = $plant
EndIf

; Set Warehouse number
If $warehouse <> "" Then
  $session.FindById("wnd[0]/usr/ctxtLGNUM").Text = $warehouse
EndIf

; Set Layout
If $layout <> "" Then
  $session.FindById("wnd[0]/usr/ctxtP_VARI").Text = $layout
EndIf

; Execute
$session.FindById("wnd[0]/tbar[1]/btn[8]").Press()

; Save to file (replace)
$session.FindById("wnd[0]/mbar/menu[0]/menu[1]/menu[2]").Select()
$session.FindById("wnd[1]/tbar[0]/btn[0]").Press()
$session.FindById("wnd[1]/usr/ctxtDY_PATH").Text = $outputPath
$session.FindById("wnd[1]/usr/ctxtDY_FILENAME").Text = $outputFile
$session.FindById("wnd[1]/usr/ctxtDY_FILE_ENCODING").Text = $codePage
$session.FindById("wnd[1]/tbar[0]/btn[11]").Press()

; Back to main screen
$session.FindById("wnd[0]/tbar[0]/btn[15]").Press()
$session.FindById("wnd[0]/tbar[0]/btn[15]").Press()

LogDebug("ENDING_TRANSACTION")

CloseSession()
