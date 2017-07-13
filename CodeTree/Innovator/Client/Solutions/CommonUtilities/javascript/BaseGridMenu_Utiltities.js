// ModuleName:  BaseGridMenu_Utiltities
// version: 	v3-1
// date:		Sept-2016
// innovator code tree location: ../Client/Solutions/CommonUtilities/javascript/BaseGridMenu_Utiltities.js

/// Part of package: "commonBase Grid Utilities"
/// use with your own JS logic that connects to Form Event "onload". Example code below shows how to include into your logic
/// SAMPLE:  if (typeof BaseMenuActionHandler != 'function') {eval(top.aras.getFileText(top.aras.getBaseURL() + "/Solutions/CommonUtilities/javascript/BaseGridMenu_Utiltities.js"));}

/// requires BaseGridMain_Utiltities.js to be included first !!!

//==================================================================================
//==================================================================================
//==================================================================================

// include modules from Aras Code Tree
var includeScript = document.createElement('script');
includeScript.src = "../javascript/include.aspx?classes=Dependencies";
document.head.appendChild(includeScript);

// - CLASS for action handling
BaseMenuActionHandler = function (menuId) {
 this.contextMenuId = menuId;
};

/* eActionArgs context can be:
	eActionArgs.isStartedFromTab			--> identifies that grid is displayed on a tab
	eActionArgs.effectivityMode				--> holds the current effectivity setting the grid is in "current_config or latest_released"
	eActionArgs.gridIsEditable				--> identifies that grid is editable
	eActionArgs.userIsOwnerOfContextItem	--> identifies that current user is owner of context item the grid was started from
	eActionArgs.userIsManagerOfContextItem	--> identifies that current user is manager of context item the grid was started from
	eActionArgs.userIsOwnerOfRowItem		--> identifies that current user is owner of row related item the action was started from
	eActionArgs.userIsOwnerOrManagerOfRowItem	--> identifies that current user is owner or manager of row related item the action was started from
	eActionArgs.lockStatus					--> holds the current lock status of the row related item
	eActionArgs.rowOfGroupName				--> holds the name of the group under which this row is listed
	eActionArgs.rowItemType					--> holds the current item Type name of the row related item
	eActionArgs.rowItemId					--> holds the current id of the row related item
	eActionArgs.rowItemState				--> holds the current status name of the row related item
	eActionArgs.rowItemIsReleased			--> true if current row related item is released (is_released property = "1")
	eActionArgs.rowItemIsCurrent			--> true if current row related item is current generation (is_current property = "1")
	eActionArgs.isPhantomRow				--> identifies that row the action was started from is a phantom row (goup row)
	eActionArgs.updateItemToCurrentVersion	--> tells that row related item must be updated to current version before starting the action
  	eActionArgs.gridHandler					--> references the grid handler object
	eActionArgs.rowId						--> holds the current id of the grid row
	
  menuAction context can be:
	menuAction.name 			 			--> name (actionId) of the menu action to be started
	menuAction.label 			 			--> language specific label of the menu action to be started
	menuAction.relQueryName 				--> group Name this action is valid for (check against eActionArgs.rowOfGroupName)
	menuAction.allowOnGroupRows  			--> Allow action for listed group rows (if isPhantomRow then check against eActionArgs.rowItemType == groupName)
	menuAction.executeThisAction			--> Name of system action to execute with row item's context
	menuAction.ifStartedFromTab  			--> if true, only allow, if started from Tab  			(check: eActionArgs.isStartedFromTab)
	menuAction.ifGridIsEditable				--> if true, only allow, if grid if editable			(check: eActionArgs.gridIsEditable)
	menuAction.ifUserIsAdmin				--> if true, only allow, if user is in Administrations Identity
	menuAction.ifUserIsOwnerOfContextItem	--> if true, only allow, if user is owner of context	(check: eActionArgs.userIsOwnerOfContextItem)
	menuAction.ifUserIsManagerOfContextItem	--> if true, only allow, if user is owner of context	(check: eActionArgs.userIsOwnerOfContextItem)
	menuAction.ifUserIsOwnerOfRowItem		--> if true, only allow, if user is owner of row item	(check: eActionArgs.userIsOwnerOfRowItem)
	menuAction.ifUserIsOwnerOrManagerOfRowItem	-> if true, only allow, if user is owner or manager of row item	(check: eActionArgs.userIsOwnerOrManagerOfRowItem)
	menuAction.ifIsGroupRow					--> if true, only allow, if row is a group row			(check: eActionArgs.isPhantomRow)
	menuAction.ifItemIsCurrentVersion		--> if true, check if row item is current version, if not do not execute action
	menuAction.ifEffectivityMode			--> if true, only allow, if right effectivity set		(check against eActionArgs.effectivityMode)
	menuAction.applyToParentItem			--> if true, only allow, get parent row context before applying action .executeThisAction
	menuAction.ifRowItemIsReleased			--> if true, only allow, if row item has released condition (check against eActionArgs.rowItemIsReleased)
	menuAction.ifRowItemIsLocked			--> if true, only allow, if row item is locked by user (check eActionArgs.lockStatus = 1)
	menuAction.separator					--> if true, this is not an action
*/

BaseMenuActionHandler.prototype = {
	//== API
  setCustomMenuActionHandler: function(customMenuHandler) {
	this.customMenuHandler = customMenuHandler;
  },
    //--- API
	/// <summary>
	///
	/// </summary>
  executeAction: function(eActionArgs, menuAction) {
	//debugger;
	// if system action defined, no validations needed. Start this action
	if (menuAction.executeThisAction && menuAction.executeThisAction !== "") {
		fn_executeConfiguredMenuAction(menuAction.executeThisAction, eActionArgs);
		return "";
	}
	//returns "" if execution was done. Else the function returns an Error message.
	var checkMsg = this.validateAction(eActionArgs, menuAction);
	if (checkMsg !== "") {return checkMsg;}

	this.handleExecuteAction(eActionArgs, menuAction.name);
	return "";
  },

    //--- API
	/// <summary>
	///
	/// </summary>
  validateAction: function(eActionArgs, menuAction) {
	//returns "" if validations are OK. Else the function returns an Error message.
	return this.handleValidateAction(eActionArgs, menuAction);
  },
    //--- API
	/// <summary>
	///
	/// </summary>
  executeLink: function(eActionArgs, linkInfo, cellVal) {
  	var linkActionElements = linkInfo.split("+");  //0=key, 1=itemType, 2=propName, 3=propValue
	var linkActionKey = linkActionElements[0];

	switch (linkActionKey) {
		case "{OpenRowItem}":
		case "{OpenNewRowItem}":
		case "{OpenRowCurrentItem}":
			if (linkActionKey === "{OpenNewRowItem}" || linkActionKey === "{OpenRowCurrentItem}" ) {
				eActionArgs.checkForNewerVersionOfItem = true;
				eActionArgs.rowItemId = eActionArgs.rowNewItemId;
			}
			var menuAction= "view_item";
			eActionArgs.actionSource = "hyperlink";
			this.handleExecuteAction(eActionArgs, "view_item");
			break;

		case "{OpenFilesOfRowItem}":
			this.handleExecuteAction(eActionArgs, "view_attached_files");
			break;

		case "{OpenURL}":
			if (cellVal && cellVal !== "") {
				var pos = cellVal.indexOf("http");
				if (pos !== 0) {top.aras.AlertError(top.aras.getResource("CommonUtilities","commonUtilities.message.utils_execute_link_format_not_http").format(cellVal));}
				window.open(cellVal,'_blank','toolbar=no,scrollbars=yes,resizable=yes,top=10,left=10,status=yes');
				//window.open(cellVal);
			}
			break;

		case "{OpenPropertyItem}":
			if (cellVal && cellVal !== "") {
				var itemType = linkActionElements[1];
				var propName = linkActionElements[2];
				var propValue = linkActionElements[3];
				//alert(itemType+"-"+propValue);
				top.aras.uiShowItem(itemType, propValue);
			}
			break;
		default:
	}
  },
  //--- copied 1:1 from ActionBase class in method "BaseTreeGrid"
  searchItem: function (itemTypeName, width, height, searchCallback, allowMultiSelect) {
    if (!searchCallback || searchCallback === undefined) {top.aras.AlertError("SearchCallback missing! See your System Administrator!"); return;}
	if (!allowMultiSelect || allowMultiSelect === undefined) {allowMultiSelect=false;}
	
    if (!width) {width = 800;}
    if (!height) {height = 500;}
	var param = { aras: top.aras, itemtypeName: itemTypeName, multiselect: allowMultiSelect };
	var options = { dialogHeight: height, dialogWidth: width, resizable:true};
	
	param.callback = function (dlgRes) {
	 if (allowMultiSelect) {
		if(!dlgRes) {
			searchCallback(null); return;
		} else if (dlgRes.length == 0) {
			searchCallback(null); return;
		} else {
			searchCallback(dlgRes); return;
		}
	 }
	 else {
		if(!dlgRes) {
			searchCallback(null); return;
		} else if (dlgRes.itemID === "") {
			searchCallback(null);	return "";
		} else if(!dlgRes.item) {
			//no item selected
			searchCallback(null); return;
		}
		searchCallback(dlgRes.item);
	 }
	};

	var wnd = top.aras.getMainWindow();
	wnd = wnd === top ? wnd.main : top;
	top.aras.modalDialogHelper.show('SearchDialog', wnd, param, options);
  },
  
  getContextMenuItemOfMenuIndex: function (gridContextMenu, menuIndex) {
	var idx = -1;
	for (var i = 0; i < gridContextMenu.length && idx < 0; i++) {
		if (gridContextMenu[i].menuindex === parseInt(menuIndex)) {idx = i;}
	}
	if (idx < 0) {return null;}
	return gridContextMenu[idx];
  },
  
  getOpenItemMenuAction: function() {
	return "view_item";
  },
	//== API
  getContextMenuItemOfOpenItemAction: function(gridContextMenu, relQueryName) {
	var idx = -1;
	var viewItemAction = this.getOpenItemMenuAction();
	for (var i = 0; i < gridContextMenu.length && idx < 0; i++) {
	  if (gridContextMenu[i].name === viewItemAction && gridContextMenu[i].relQueryName === relQueryName)
		{idx = i;}
	}
	if (idx === -1) {
	  for (i = 0; i < gridContextMenu.length && idx < 0; i++) {
		if (gridContextMenu[i].name === viewItemAction && gridContextMenu[i].relQueryName === "default")
		{idx = i;}
	  }
	}
	if (idx < 0) {return null;}
	return gridContextMenu[idx];
  },
  
  updateActionContextArgsForRowId: function(eActionArgs, rowId) {
	eActionArgs.rowId = rowId;
	eActionArgs.rowItemType = eActionArgs.gridHandler.getGridRowUserData(rowId,"rowItemType");
	eActionArgs.rowOfGroupName = eActionArgs.gridHandler.getGridRowUserData(rowId,"rowOfGroupName");
	eActionArgs.rowItemId = eActionArgs.gridHandler.getGridRowUserData(rowId,"rowItemID");
	eActionArgs.isPhantomRow =  (eActionArgs.gridHandler.getGridRowUserData(rowId,"isPhantomRow") === "1");

	//get Item details from server
	if (!eActionArgs.isPhantomRow) {
	  var rowItem = top.aras.newIOMItem(eActionArgs.rowItemType,"get");
	  rowItem.setID(eActionArgs.rowItemId);
	  rowItem.setAttribute("select","state,owned_by_id,managed_by_id,team_id,is_released,is_current,locked_by_id");
	  rowItem = rowItem.apply();
	  if (!rowItem.isError()) {
		eActionArgs.rowItemIsReleased = (rowItem.getProperty("is_released","0") === "1");
		eActionArgs.rowItemIsCurrent = (rowItem.getProperty("is_current","0") === "1");
		eActionArgs.userIsOwnerOfRowItem = fn_IsCurrUserMemberOfIdentityId(rowItem.getProperty("owned_by_id",""));
		eActionArgs.userIsOwnerOrManagerOfRowItem = fn_IsCurrUserMemberOfIdentityId(rowItem.getProperty("owned_by_id",""));
		if (eActionArgs.userIsOwnerOrManagerOfRowItem === false) 
		  {eActionArgs.userIsOwnerOrManagerOfRowItem = fn_IsCurrUserMemberOfIdentityId(rowItem.getProperty("managed_by_id",""));}
			// define lock status
		eActionArgs.rowItemState = rowItem.getProperty("state","")
		var lckId = rowItem.getProperty("locked_by_id","");
		eActionArgs.lockStatus = 0; //not locked
		if (top.aras.getUserID() === lckId) {eActionArgs.lockStatus = 1;} // locked by user
		else {if (lckId !== "") {eActionArgs.lockStatus = 2;}} // locked by other
	  }
	}
  },
    //--- API
	/// <summary>
	///
	/// </summary>
  buildContextMenuForThisRow: function(menuItems, gridContextMenu, id_array, eActionArgs) {
	//menuItems = array of menu items to be displayed.  (passed in from calling function) => will get updated here
	//gridContextMenu = array of all menu action to be filtered here 
	var enableAction = true;
	var prevActionIsSeparator = false;
	var menuItemCount = 0;
	var lastMenuItemIndex = 0;
	var lastSepIndex = 0;
	
	//build dynamic context menu items (the tricky part is to avoid duplicate separators or separators at first and last position !!)
	//assumes menu actions got initialized by calling method
	for (var i = 0; i < gridContextMenu.length; i++) {
		if (!gridContextMenu[i].isDisabled) {
		  if (!gridContextMenu[i].separator) {
			eActionArgs.actionId = gridContextMenu[i].name;
			
			// check if menu action is allowed on group rows
			if (gridContextMenu[i].allowOnGroupRows && eActionArgs.isPhantomRow) {
				var selectedId = eActionArgs.gridHandler.grid.getParentId(eActionArgs.rowId);
				if (!selectedId) {return false;}
				// set as if menu was initialized from parent row
				if (selectedId && selectedId !== undefined) {
					eActionArgs.startedFromGroupName = eActionArgs.rowItemType;
					this.updateActionContextArgsForRowId(eActionArgs, selectedId);
				}
			}
		
			if (this.isShowOnMenu(eActionArgs, gridContextMenu[i])) {
				prevActionIsSeparator = false;
				var menuItemName = gridContextMenu[i].name;
				if (this.contextMenuId) {menuItemName = this.contextMenuId +"."+ menuItemName;}
				menuItems.push({
					name: menuItemName,
					label: gridContextMenu[i].label,
					enabled: enableAction
				});
				gridContextMenu[i].menuindex = menuItemCount;
				lastMenuItemIndex = i;
				menuItemCount++;
			} else {
				gridContextMenu[i].menuindex = -1;
			}
		  }
		  else {
			if (prevActionIsSeparator === false) {
				menuItems.push(gridContextMenu[i]);
				menuItemCount++;
				lastSepIndex = i;
			}
			prevActionIsSeparator = true;
			gridContextMenu[i].menuindex = -1;
		  }
		}
	}
	if (menuItems.length === 0) {return false;} // no menuItems got added
	
	//clean single separator on menu
	if (menuItemCount === 1 && gridContextMenu[lastSepIndex].separator === true) {return false;} //show no menu
	//clean separator on top of menu
	if (menuItems[0].separator === true) {
		menuItems.splice(0,1);menuItemCount--;
		for ( i = 0; i < gridContextMenu.length; i++) {
			if (gridContextMenu[i].menuindex !== -1) {gridContextMenu[i].menuindex = gridContextMenu[i].menuindex-1;}
		}
	}
	//clean separator at bottom of menu
	if (menuItems[menuItemCount-1].separator === true) {
		menuItems.splice(menuItemCount-1,1);menuItemCount--;
		gridContextMenu[lastMenuItemIndex].menuindex=menuItemCount-1;
	}
	return true;
  },

    //--- API
	/// <summary>
	///
	/// </summary>
  isShowOnMenu: function(eActionArgs, menuAction) {
	//+++++ Common Rules ...

//debugger;
	// 1st detect if started from group row
	if (eActionArgs.startedFromGroupName) {
     if (!menuAction.allowOnGroupRows || menuAction.allowOnGroupRows === undefined || menuAction.allowOnGroupRows.indexOf(eActionArgs.startedFromGroupName) < 0) {return false;}
	}
	
	// 2nd apply filter by relQueryName
	if (menuAction.relQueryName !== "default" && menuAction.relQueryName !== eActionArgs.rowOfGroupName) {return false;}
	
	// then apply rules for base menu config
	if (eActionArgs.isStartedFromTab !== undefined && menuAction.ifStartedFromTab !== undefined && menuAction.ifStartedFromTab !== eActionArgs.isStartedFromTab) {return false;}

	if (eActionArgs.gridIsEditable !== undefined && menuAction.ifGridIsEditable !== undefined && menuAction.ifGridIsEditable !== eActionArgs.gridIsEditable) {return false;}

	if (menuAction.ifUserIsAdmin !== undefined && menuAction.ifUserIsAdmin !== top.aras.isAdminUser()) {return false;}

	if (eActionArgs.userIsOwnerOfContextItem !== undefined && menuAction.ifUserIsOwnerOfContextItem !== undefined && menuAction.ifUserIsOwnerOfContextItem !== eActionArgs.userIsOwnerOfContextItem) {return false;}

	if (eActionArgs.userIsManagerOfContextItem !== undefined && menuAction.ifUserIsManagerOfContextItem !== undefined && menuAction.ifUserIsManagerOfContextItem !== eActionArgs.userIsManagerOfContextItem) {return false;}

	if (eActionArgs.userIsOwnerOfRowItem !== undefined && menuAction.ifUserIsOwnerOfRowItem !== undefined && menuAction.ifUserIsOwnerOfRowItem !== eActionArgs.userIsOwnerOfRowItem) {return false;}
	
	if (eActionArgs.userIsOwnerOrManagerOfRowItem !== undefined && menuAction.ifUserIsOwnerOrManagerOfRowItem !== undefined && menuAction.ifUserIsOwnerOrManagerOfRowItem !== eActionArgs.userIsOwnerOrManagerOfRowItem) {return false;}
	
	if (eActionArgs.isPhantomRow !== undefined && menuAction.ifIsGroupRow !== undefined && menuAction.ifIsGroupRow !== eActionArgs.isPhantomRow) {return false;}

	if (eActionArgs.rowItemIsCurrent !== undefined && menuAction.ifItemIsCurrentVersion !== undefined && menuAction.ifItemIsCurrentVersion !== eActionArgs.rowItemIsCurrent) {return false;}
	
	if (eActionArgs.rowItemIsReleased !== undefined && menuAction.ifRowItemIsReleased !== undefined && menuAction.ifRowItemIsReleased !== eActionArgs.rowItemIsReleased) {return false;}
	
	if (eActionArgs.lockStatus !== undefined && menuAction.ifRowItemIsLocked !== undefined && menuAction.ifRowItemIsLocked === true && eActionArgs.lockStatus !== 1) {return false;}

	if (eActionArgs.lockStatus !== undefined && menuAction.ifRowItemIsLocked !== undefined && menuAction.ifRowItemIsLocked === false && eActionArgs.lockStatus !== 0) {return false;}
	
	if (eActionArgs.effectivityMode !== undefined && menuAction.ifEffectivityMode !== undefined && menuAction.ifEffectivityMode !== eActionArgs.effectivityMode) {return false;}

	var menuActionName = menuAction.name;
	// check for core actions (not allowed on phantom rows)
	if (!menuAction.ifIsGroupRow) {
		if (menuActionName === "view_item") {return true;}
		if (menuActionName === "where_used") {return true;}
		if (menuActionName === "structure_browser") {return true;}
		if (menuActionName === "add_to_change") {return true;}
		if (eActionArgs.effectivityMode === "current_config" || eActionArgs.effectivityMode === "is_current") {
			if (menuActionName === "lock" && eActionArgs.lockStatus === 0) {return true;}
			if (menuActionName === "unlock" && eActionArgs.lockStatus === 1) {return true;}
		}
	}
	// is system action to execute defined ?
	if (menuAction.executeThisAction && menuAction.executeThisAction !== "") {return true;}
	//^^^^^ Common Rules
	
	//+++++ Custom Rules
	if (this.customMenuHandler && this.customMenuHandler.isShowOnMenuCustom) {return this.customMenuHandler.isShowOnMenuCustom (eActionArgs, menuAction);}
	
	return false;	
  },

  handleValidateAction: function(eActionArgs, menuAction) {
    var callCustomHandler = true;
	
	//+++ your custom actions
	if (callCustomHandler && this.customMenuHandler && this.customMenuHandler.validateAction) {return this.customMenuHandler.validateAction (eActionArgs, menuAction);}
	return "";
  },

  handleExecuteAction: function(eActionArgs, menuActionName) {
   // dispatches the menu action to local handlers
   //debugger;
   var actionId = eActionArgs.actionSource + "." + menuActionName;
   // maps doubleclick action
   if (eActionArgs.actionSource === "doubleclick") {actionId = "doubleclick.view_item";}
    var callCustomHandler = false;
	switch(actionId)
	{
	  //+++ core actions
	  case "hyperlink.view_item":
	  case "doubleclick.view_item":
	  case "toolbar.view_item":
	  case "menu.view_item":
	     fn_onOpenRowItem(eActionArgs);
	  	 break;
	  case "menu.where_used":
		 Dependencies.View(eActionArgs.rowItemType, eActionArgs.rowItemId, true); // true = where used 
	  	 break;
	  case "menu.structure_browser":
		 Dependencies.View(eActionArgs.rowItemType, eActionArgs.rowItemId, false); // false = structure browser 
	  	 break;
	  case "menu.lock":
	     fn_onLockThisItem (eActionArgs);
	  	 break;
	  case "menu.unlock":
	     fn_onUnLockThisItem (eActionArgs);
	  	 break;
	  default:
		 callCustomHandler = true;
	  //^^^ core actions
	}
	//+++ your custom actions
	if (callCustomHandler && this.customMenuHandler && this.customMenuHandler.executeAction) {this.customMenuHandler.executeAction (eActionArgs, menuActionName);}
  },

  handleDummy: function() {}
};

// =======  Menu Action Handlers Functions ========
fn_executeConfiguredMenuAction = function (configuredActionName, eRowArgs) {
	var itemToDoActionOnId = eRowArgs.rowItemId;
	var itemToDoActionOnType = eRowArgs.rowItemType;

	if (configuredActionName.indexOf("(") > 0 ) {
		var actionParams = configuredActionName.split("(")[1];
		actionParams = actionParams.replace(/\)/g,"");
		configuredActionName = configuredActionName.split("(")[0];
		if (actionParams.indexOf(",") > 0) {
			itemToDoActionOnType = actionParams.split(",")[1];
			var idPropName = actionParams.split(",")[0];
			var rowItem = innovator.getItemById(eRowArgs.rowItemType,eRowArgs.rowItemId);
			if (rowItem.isError()) {return;}
			itemToDoActionOnId = rowItem.getProperty(idPropName, "");
			if (itemToDoActionOnId === "") {return;}
		}	
	}

	var action = top.aras.newIOMItem('Action','get');
	action.setProperty("name",configuredActionName);
	action.setAttribute("select","name,method(name,method_type,method_code),type,target,location,body,on_complete(name,method_type,method_code),item_query");
	action = action.apply();
	if (!action.isError()) {
		var itemTypeItem = top.aras.newIOMItem('ItemType','get');
		itemTypeItem.setProperty("name",itemToDoActionOnType);
		itemTypeItem.setAttribute("select","id");
		itemTypeItem = itemTypeItem.apply();

		var actType = action.getProperty('type');
		var itID = itemTypeItem.getProperty('id',"");
		
		if (itemToDoActionOnId === "" || actType === 'generic' || actType === 'itemtype') {
			if (itID === "") {
				top.aras.invokeAction(action.node, undefined, '');}
			else {
				top.aras.invokeAction(action.node, itID, '');}
		}
		else {
			top.aras.invokeAction(action.node, itID, itemToDoActionOnId);
		}
	}
};

//+++ local action handlers for menu or toolbar clicks
fn_onOpenRowItem = function (eRowArgs) {
  //debugger;
  if ( eRowArgs.isPhantomRow){return;}
 
  top.aras.uiShowItem(eRowArgs.rowItemType, eRowArgs.rowItemId);
};

fn_onLockThisItem = function (eRowArgs) {
    fn_LockThisItem (eRowArgs.rowItemType, eRowArgs.rowItemId);
	
	// update lock cell of row 
    var col = eRowArgs.gridHandler.lockIconColumnNo;
	if (col && col !== undefined)
      {eRowArgs.gridHandler.gridSetCellValue(eRowArgs.rowId,col,fn_GetLockedCellIconFormatByStatusCode(eRowArgs.gridHandler.icons,1));}
};

fn_onUnLockThisItem = function (eRowArgs) {
    fn_UnLockThisItem (eRowArgs.rowItemType, eRowArgs.rowItemId);
	
	// update lock cell of row 
    var col = eRowArgs.gridHandler.lockIconColumnNo;
	if (col && col !== undefined)
      {eRowArgs.gridHandler.gridSetCellValue(eRowArgs.rowId,col,fn_GetLockedCellIconFormatByStatusCode(eRowArgs.gridHandler.icons,0));}
};

