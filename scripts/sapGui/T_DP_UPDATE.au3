#Region
#AutoIt3Wrapper_UseX64=n
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include <Array.au3>
#include <StringConstants.au3>
#include "_Common.au3"

$t = "T_DP_UPDATE"

$verify = ReadIni($t, "Verify", "1")
$phased = ReadIni($t, "Phased", "0")
$inputFile = ""

Dim $items[1] = [0]

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug($t & " <arguments> <items>")
  LogDebug()
  LogDebug("Arguments:")
  LogDebug("  --verify")
  LogDebug("  --phased")
  LogDebug("  --input-file")
  LogDebug("Items: <order>/<search-component>/<replace-component>")
  Exit(0)
EndIf

If $CmdLine[0] > 0 Then
  For $i = 1 To $CmdLine[0] Step 1
    If $CmdLine[$i] = "--verify" Then
      $verify = "1"
    ElseIf $CmdLine[$i] = "--phased" Then
      $phased = "1"
    ElseIf $CmdLine[$i] = "--input-file" Then
      $i += 1
      $inputFile = $CmdLine[$i]
    ElseIf StringRegExp($CmdLine[$i], "^[0-9]+\/[0-9]+\/[0-9]+$") Then
      _ArrayAdd($items, $CmdLine[$i])
      $items[0] += 1
    EndIf
  Next
EndIf

LogDebug($t)
LogDebug("--verify=" & $verify)
LogDebug("--phased=" & $phased)
LogDebug("--input-file=" & $inputFile)

If $inputFile <> "" Then
  $lines = StringSplit(FileRead($inputFile), @LF)
  For $i = 1 To $lines[0] Step 1
    $line = StringStripWS($lines[$i], $STR_STRIPLEADING + $STR_STRIPTRAILING)
    If StringRegExp($line, "^[0-9]+\/[0-9]+\/[0-9]+$") Then
      _ArrayAdd($items, $line)
      $items[0] += 1
    EndIf
  Next
EndIf

If $items[0] = 0 Then
  LogDebug("NO_ITEMS")
  Exit(0)
EndIf

#include "_Logon.au3"

StartTransaction("CO02")

For $i = 1 To $items[0] Step 1
  $parts = StringSplit($items[$i], "/")
  $order = $parts[1]
  $searchComponent = StringRegExpReplace($parts[2], "^0+", "")
  $replaceComponent = StringRegExpReplace($parts[3], "^0+", "")

  LogDebug("ORDER=" & $order)
  LogDebug("SEARCH_COMPONENT=" & $searchComponent)
  LogDebug("REPLACE_COMPONENT=" & $replaceComponent)

  ; Set Order
  $ctrlId = "wnd[0]/usr/ctxtCAUFVD-AUFNR"
  $ctrl = $session.FindById($ctrlId)
  AssertControl($ctrl, $ctrlId)
  $ctrl.Text = $order

  ; Select Order entered
  $session.FindById("wnd[0]/usr/radR62CLORD-FLG_KNOT").Select()

  ; Press Component Overview
  $session.FindById("wnd[0]/tbar[1]/btn[6]").Press()

  ; Check status bar
  $sbar = $session.FindById("wnd[0]/sbar")

  If StringInStr($sbar.Text, "not found") Then
    LogDebug("COMPONENT_NOT_SET=ORDER_NOT_FOUND")
    ContinueLoop
  EndIf

  ; Close any possible modals
  $tblId = "wnd[0]/usr/tblSAPLCOMKTCTRL_0120"
  $modal = $session.FindById("wnd[1]")
  If IsObj($modal) Then
    $text = ReadAllText($modal)
    $modal.Close()
    If Not IsObj($session.FindById($tblId)) Then
      LogDebug("COMPONENT_NOT_SET=MODAL=" & $text)
      ContinueLoop
    EndIf
  EndIf

  ; Check if the Component table exists
  $tbl = $session.FindById($tblId)

  If Not IsObj($tbl) Then
    LogDebug("COMPONENT_NOT_SET=INVALID_SCREEN=" & $tblId)
    ContinueLoop
  EndIf

  $visibleRowCount = $tbl.VisibleRowCount - 1
  $tbl.VerticalScrollbar.Position = 0

  $searching = True
  $page = 0
  $save = False

  While $searching
    $page = $page + 1
    $tbl = $session.FindById($tblId)
    AssertControl($tbl, $tblId)

    For $j = 0 To $visibleRowCount Step 1
      $compCell = $tbl.GetCell($j, 1)
      $descCell = $tbl.GetCell($j, 2)

      If Not IsObj($compCell) Or Not IsObj($descCell) Or ($compCell.Text = "" And $descCell.Text = "") Then
        LogDebug("END_OF_TABLE")
        $searching = False
        ExitLoop
      EndIf

      $component = StringRegExpReplace($compCell.Text, "^0+", "")

      If $component = $replaceComponent Then
        LogDebug("COMPONENT_NOT_SET=ALREADY_SET")
        $searching = False
        ExitLoop
      EndIf

      If $component = $searchComponent Then
        LogDebug("COMPONENT_FOUND=" & $descCell.Text)
        $searching = False

        $compCell.Text = $replaceComponent

        $session.FindById("wnd[0]").sendVKey(0)

        While 1
          $modal = $session.FindById("wnd[1]")

          If Not IsObj($modal) Then
            ExitLoop
          EndIf

          $modalText = ReadAllText($modal, " ")

          If $phased = "1" And StringInStr($modalText, "To Be Phased Out") Then
            LogDebug("CLOSING_MODAL=To Be Phased Out")
            $ctrlId = "wnd[1]/usr/btnSPOP-VAROPTION1"
            $ctrl = $session.FindById($ctrlId)
            AssertControl($ctrl, $ctrlId)
            $ctrl.Press()
          Else
            LogDebug("COMPONENT_NOT_SET=MODAL=" & $modalText)
            $modal.Close()
            ; Check if we're back at the initial screen
            If IsObj($session.FindById("wnd[0]/usr/ctxtCAUFVD-AUFNR")) Then
              ExitLoop 2
            EndIf
          EndIf
        WEnd

        $sbarId = "wnd[0]/sbar"
        $sbar = $session.FindById($sbarId)
        AssertControl($sbar, $sbarId)

        If StringInStr($sbar.Text, "allow confirmation") Then
          $session.FindById("wnd[0]").sendVKey(0)
        EndIf

        $session.FindById("wnd[0]").sendVKey(0)

        $tbl = $session.FindById($tblId)
        $compCell = $tbl.GetCell($j, 1)
        $descCell = $tbl.GetCell($j, 2)

        If StringRegExpReplace($compCell.Text, "^0+", "") = $replaceComponent Then
          LogDebug("COMPONENT_SET=" & $descCell.Text)
          $save = True
        Else
          LogDebug("COMPONENT_NOT_SET=INVALID_VALUE")
        EndIf
      EndIf
    Next

    If $searching = True Then
      LogDebug("SCROLLING_TABLE")
      $tbl = $session.FindById($tblId)
      AssertControl($tbl, $tblId)
      $tbl.VerticalScrollbar.Position = $page * ($visibleRowCount + 1)
    EndIf
  WEnd

  If $save Then
    LogDebug("SAVING")
    $session.FindById("wnd[0]/tbar[0]/btn[11]").Press()
  ElseIf Not IsObj($session.FindById("wnd[0]/usr/ctxtCAUFVD-AUFNR")) Then
    LogDebug("NOT_SAVING")
    $session.FindById("wnd[0]/tbar[0]/btn[15]").Press()
  EndIf

  ; Close possible modals
  While 1
    $modal = $session.FindById("wnd[1]")

    If Not IsObj($modal) Then
      ExitLoop
    EndIf

    $modalText = ReadAllText($modal, " ")

    If StringInStr($modalText, "Error calculating costs") Then
      LogDebug("CLOSING_MODAL=Error calculating costs")
      $ctrlId = "wnd[1]/usr/btnSPOP-OPTION1"
      $ctrl = $session.FindById($ctrlId)
      AssertControl($ctrl, $ctrlId)
      $ctrl.Press()
    Else
      LogDebug("CLOSING_MODAL=" & ReadAllText($modal, " "))
      $modal.Close()
    EndIf
  WEnd

  If $verify <> "1" Or Not $save Then
    ContinueLoop
  EndIf

  LogDebug("VERIFYING")

  ; Set Order
  $ctrlId = "wnd[0]/usr/ctxtCAUFVD-AUFNR"
  $ctrl = $session.FindById($ctrlId)
  AssertControl($ctrl, $ctrlId)
  $ctrl.Text = $order

  ; Select Order entered
  $session.FindById("wnd[0]/usr/radR62CLORD-FLG_KNOT").Select()

  ; Press Component Overview
  $session.FindById("wnd[0]/tbar[1]/btn[6]").Press()

  ; Check if the Component table exists
  $tblId = "wnd[0]/usr/tblSAPLCOMKTCTRL_0120"
  $tbl = $session.FindById($tblId)
  AssertControl($tbl, $tblId)

  $visibleRowCount = $tbl.VisibleRowCount - 1
  $tbl.VerticalScrollbar.Position = 0

  $searching = True
  $page = 0
  $found = False

  While $searching
    $page = $page + 1
    $tbl = $session.FindById($tblId)
    AssertControl($tbl, $tblId)

    For $j = 0 To $visibleRowCount Step 1
      $compCell = $tbl.GetCell($j, 1)
      $descCell = $tbl.GetCell($j, 2)

      If Not IsObj($compCell) Or Not IsObj($descCell) Or ($compCell.Text = "" And $descCell.Text = "") Then
        LogDebug("END_OF_TABLE")
        $searching = False
        ExitLoop
      EndIf

      $component = StringRegExpReplace($compCell.Text, "^0+", "")

      If $component = $replaceComponent Then
        $searching = False
        $found = True
        ExitLoop
      EndIf
    Next

    If $searching = True Then
      LogDebug("SCROLLING_TABLE")
      $tbl = $session.FindById($tblId)
      AssertControl($tbl, $tblId)
      $tbl.VerticalScrollbar.Position = $page * ($visibleRowCount + 1)
    EndIf
  WEnd

  If $found Then
    LogDebug("VERIFIED")
  Else
    LogDebug("NOT_VERIFIED")
  EndIf

  ; Go back to the initial screen
  $session.FindById("wnd[0]/tbar[0]/btn[15]").Press()
Next

LogDebug("ENDING_TRANSACTION")

CloseSession()
