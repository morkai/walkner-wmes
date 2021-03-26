#Region ;**** Directives created by AutoIt3Wrapper_GUI ****
#AutoIt3Wrapper_Change2CUI=y
#EndRegion ;**** Directives created by AutoIt3Wrapper_GUI ****

#include "_Common.au3"

$t = "T_DP_INQ"

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug($t & " <items>")
  LogDebug()
  LogDebug("Items: <inquiry-no>/<inquiry-item-1>[/<inquiry-item-n>...]")
  Exit(0)
EndIf

If $CmdLine[0] > 0 Then
  For $i = 1 To $CmdLine[0] Step 1
    If Not StringRegExp($CmdLine[$i], "^[0-9]+(\/[0-9]+)+$") Then
      LogError("INVALID_ITEMS", 1)
    EndIf
  Next
EndIf

LogDebug($t)

#include "_Logon.au3"

StartTransaction("VA13")

$itemOverviewId = "wnd[0]/tbar[1]/btn[6]"
$itemTblId = "wnd[0]/usr/tabsTAXI_TABSTRIP_OVERVIEW/tabpT\02/ssubSUBSCREEN_BODY:SAPMV45A:4401/subSUBSCREEN_TC:SAPMV45A:4900/tblSAPMV45ATCTRL_U_ERF_AUFTRAG"
$configTblId1 = "wnd[0]/usr/tabsTABSTRIP_CHAR/tabpTAB1/ssubCHARACTERISTICS:SAPLCEI0:1400/tblSAPLCEI0CHARACTER_VALUES"
$configTblId2 = "wnd[0]/usr/subCHARACTERISTICS:SAPLCEI0:1400/tblSAPLCEI0CHARACTER_VALUES"

For $orderI = 1 To $CmdLine[0] Step 1
  $parts = StringSplit($CmdLine[$orderI], "/")
  $order = $parts[1]

  LogDebug("INQUIRY_NO=" & $order)

  ; Set Inquiry
  $ctrlId = "wnd[0]/usr/ctxtVBAK-VBELN"
  $ctrl = $session.FindById($ctrlId)
  AssertControl($ctrl, $ctrlId)
  $ctrl.Text = $order

  ; Execute Item overview
  $ctrl = $session.FindById($itemOverviewId)
  AssertControl($ctrl, $itemOverviewId)
  $ctrl.Press()

  ; Close any possible modal
  While True
    $modal = $session.FindById("wnd[1]")

    If IsObj($modal) Then
      LogDebug("CLOSING_DIALOG=" & ReadAllText($modal, " "))
      $modal.Close()
    Else
      ExitLoop
    EndIf
  WEnd

  ; Check the status bar
  $error = ""

  If Not IsObj($session.FindById($itemTblId)) Then
    $sbar = $session.FindById("wnd[0]/sbar")

    If IsObj($sbar) And $sbar.Text <> "" Then
      $btn = $session.FindById($itemOverviewId)

      If IsObj($btn) And $btn.Text = "Item overview" Then
        $btn.Press()

        If Not IsObj($session.FindById($itemTblId)) And $sbar.Text <> "" Then
          $error = "ERROR=STATUS_BAR=VA03: " & $sbar.Text
        EndIf
      Else
        $error = "ERROR=STATUS_BAR=VA03: " & $sbar.Text
      EndIf
    EndIf
  EndIf

  For $itemI = 2 To $parts[0] Step 1
    $item = $parts[$itemI]

    LogDebug("INQUIRY_ITEM=" & $item)

    If $error <> "" Then
      LogDebug($error)
      ContinueLoop
    EndIf

    ; Find Inquiry item
    $tbl = $session.FindById($itemTblId)
    AssertControl($tbl, $itemTblId)

    $visibleRowCount = $tbl.VisibleRowCount - 1

    $tbl.VerticalScrollbar.Position = 0

    $lastKey = ""
    $itemFound = False
    $searching = True
    $page = 0

    LogDebug("SEARCHING")

    While $searching
      $page = $page + 1
      $tbl = $session.FindById($itemTblId)

      If Not IsObj($tbl) Then
        LogDebug("NO_TABLE_FOR_SEARCH")
        ExitLoop
      EndIf

      For $j = 0 To $visibleRowCount Step 1
        $cell = $tbl.GetCell($j, 0)

        If Not IsObj($cell) Or $cell.Text = $lastKey Then
          LogDebug("NO_CELL")
          $searching = False
          ExitLoop
        EndIf

        $lastKey = $cell.Text

        LogDebug("ITEM_CANDIDATE=" & $lastKey)

        If $lastKey = $item Then
          LogDebug("ITEM_FOUND")
          $cell.SetFocus()
          $itemFound = True
          $searching = False
          ExitLoop
        EndIf
      Next

      If $searching = True Then
        LogDebug("SCROLLING_ITEMS")

        $tbl = $session.FindById($itemTblId)

        If Not IsObj($tbl) Then
          LogDebug("NO_TABLE_FOR_SCROLL")
          ExitLoop
        EndIf

        $tbl.VerticalScrollbar.Position = $page * ($visibleRowCount + 1)
      EndIf
    WEnd

    If $itemFound = False Then
      LogDebug("ERROR=ITEM_NOT_FOUND")
      ContinueLoop
    EndIf

    ; Execute Display document flow
    $ctrlId = "wnd[0]/tbar[1]/btn[5]"
    $ctrl = $session.FindById($ctrlId)
    AssertControl($ctrl, $ctrlId)
    $ctrl.Press()

    ; Find all documents
    $treeId = "wnd[0]/usr/shell/shellcont[1]/shell[1]"
    $tree = $session.FindById($treeId)
    AssertControl($tree, $treeId)

    $cols = $tree.GetColumnNames()
    $rows = $tree.GetAllNodeKeys()

    For $i = 0 To $rows.Count - 1 Step 1
      LogDebug("DOCUMENT=" & $tree.GetItemText($rows.Item($i), $cols.Item(0)))
    Next

    ; Back to item overview
    LogDebug("BACK_TO_ITEM_OVERVIEW=" & $i)
    $ctrlId = "wnd[0]/tbar[0]/btn[3]"
    $ctrl = $session.FindById($ctrlId)
    AssertControl($ctrl, $ctrlId)
    $ctrl.Press()
  Next

  ; Stay on the initial screen
  $btn = $session.FindById($itemOverviewId)
  If IsObj($btn) And $btn.Text = "Item overview" Then
    ContinueLoop
  EndIf

  ; Back to the initial screen
  LogDebug("BACK_TO_INITIAL_SCREEN")
  $ctrlId = "wnd[0]/tbar[0]/btn[3]"
  $ctrl = $session.FindById($ctrlId)
  AssertControl($ctrl, $ctrlId)
  $ctrl.Press()
Next

LogDebug("ENDING_TRANSACTION")
CloseSession()
