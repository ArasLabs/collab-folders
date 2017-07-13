// ModuleName:  CommonBaseTreeGridCfgHandler
// version: 	v1-0
// date:		16-Aug-2016
// innovator code tree location: ../Client/Solutions/CommonUtilities/javascript


// =======  Configurations of grid headers and columns layout, colors, icons, etc. =======
//  of tree grid configurations  (read from an XML file in code tree, or from ItemType/Relationships
//  a variable "tgc_[itemTypeName]" defines xml config file name, to read from file (else config is read from DB)

//==================================================================================
//=== BASE CONFIG Class ===
GridConfigurationBase = function GridConfigurationBaseFunc() {
};

//++++ BASE CONFIG INTERFACE API +++++

//## keep for backward compatibility
GridConfigurationBase.prototype.initGridConfig = function GridConfigurationBase_initGridConfig() {
};

GridConfigurationBase.prototype.isConfigItemLoaded = function GridConfigurationBase_isConfigItemLoaded() {
	return this.configItemIsLoaded;
};
GridConfigurationBase.prototype.setValue = function GridConfigurationBase_setValue(name, value) {
	this.configValues[name] = value;
};
GridConfigurationBase.prototype.getValue = function GridConfigurationBase_getValue(name, defaultValue) {
	if (!this.configValues[name]) {return defaultValue;}
	return this.configValues[name];
};
GridConfigurationBase.prototype.getToolbarXML = function GridConfigurationBase_getToolbarXML() {
	return this.buildToolbarXml();
};
GridConfigurationBase.prototype.getToolbarElements = function GridConfigurationBase_getToolbarElements() {
	return this.toolbarElements;
};
GridConfigurationBase.prototype.getNumberOfVisibleColumns = function GridConfigurationBase_getNumberOfVisibleColumns() {
	return this.visibleGridColumns.length;
};
GridConfigurationBase.prototype.getAllMenuActions = function GridConfigurationBase_getAllMenuActions() {
    // viewName support TBD
  return this.allMenuActions;
};
GridConfigurationBase.prototype.getGridTableColumnIndexByName = function GridConfigurationBase_getGridTableColumnIndexByName(columnName) {
  for (var idx=0;idx < this.visibleGridColumns.length; idx++)
  {
    if (this.visibleGridColumns[idx].Name === columnName) {return idx;}
  }
  return -1;
};
GridConfigurationBase.prototype.buildToolbarXml = function GridConfigurationBase_buildToolbarXml() {
	var toolbarConfigRel = "fgc_Toolbar Element";
	if (this.isTreeGrid) {toolbarConfigRel = "tgc_Toolbar Element";}
	var toolbarXML = '<toolbarapplet buttonstyle="windows" buttonsize="26,25">';
	toolbarXML += '<toolbar';
	if (this.toolbarId && this.toolbarId !== "") {toolbarXML += ' id="'+this.toolbarId+'"';}
	toolbarXML += ' >';
	var toolbarElements = this.configItem.getItemsByXPath("//Item/Relationships/Item[@type='"+toolbarConfigRel+"']");
	this.toolbarElements = [];
	for (var i = 0; i < toolbarElements.getItemCount(); i++) {
		var toolbarElement = toolbarElements.getItemByIndex(i);
		var elementType = toolbarElement.getProperty("element_type","");
		var elementId = toolbarElement.getProperty("element_id","");
		var elementText = toolbarElement.getProperty("element_text","");
		elementText = this.excapeXML(elementText);
		var elementLabel = toolbarElement.getProperty("element_label","");
		elementLabel = this.excapeXML(elementLabel);
		var elementStyle = toolbarElement.getProperty("element_style","");
		var elementSize = toolbarElement.getProperty("element_size","");
		var elementImage = toolbarElement.getProperty("element_image","");
		var elementTooltip = toolbarElement.getProperty("element_tooltip","");
		var elementDisabled = "false";
		if (toolbarElement.getProperty("element_disabled","0") === "1") {elementDisabled = "true";}
		
		this.toolbarElements[elementId] = {};
		this.toolbarElements[elementId].id = elementId;
		this.toolbarElements[elementId].type = elementType;
		this.toolbarElements[elementId].disabledOnLoad = elementDisabled;
	
		if (toolbarElement.getProperty("is_ignore_element","0") !== "1") {
			var XMLtag = "";
			switch(elementType) {
			  case "separator":
				XMLtag = '<separator';
				if (elementId !== "") {XMLtag += ' id="'+elementId+'"';} 
				XMLtag += ' />';
				break;
			  case "button":
				XMLtag = '<button';
				XMLtag += ' id="'+elementId+'" text="'+elementText+'" disabled="'+elementDisabled+'" tooltip="'+elementTooltip+'" image="'+elementImage+'"'; 
				XMLtag += ' />';
				break;
			  case "choice":
				XMLtag = '<choice';
				XMLtag += ' id="'+elementId+'" label="'+elementLabel+'" disabled="'+elementDisabled+'" tooltip="'+elementTooltip+'" >'; 
				toolbarConfigRel = "fgc_Toolbar Element Choice";
				if (this.isTreeGrid) {toolbarConfigRel = "tgc_Toolbar Element Choice";}
				var choiceElements = toolbarElement.getRelationships(toolbarConfigRel);
				for (c=0; c<choiceElements.getItemCount(); c++) {
					var cE = choiceElements.getItemByIndex(c);
					XMLtag += '<choiceitem id="'+cE.getProperty("choice_id","")+'" >'+this.excapeXML(cE.getProperty("choice_text_value",""))+'</choiceitem>';
				}
				XMLtag += '</choice>';
				break;
			  case "edit":
				XMLtag = '<edit';
				XMLtag += ' id="'+elementId+'" label="'+elementLabel+'" text="'+elementText+'" disabled="'+elementDisabled+'" style="'+elementStyle+'" >'; 
				XMLtag += '</edit>';
				break;
			}
			
			toolbarXML += XMLtag;
		}
	}
	toolbarXML += '</toolbar></toolbarapplet>';
	return toolbarXML;
};

//^^^^^ BASE INTERFACE API ^^^^^

GridConfigurationBase.prototype.excapeXML = function GridConfigurationBase_excapeXML(inString) {
	/*
	escapes	"   &quot;
			'   &apos;
			<   &lt;
			>   &gt;
			&   &amp;
	*/
	if (!inString || inString === "") {return inString;}
	inString = inString.replace(/"/,"&quot;");
	inString = inString.replace(/'/,"&apos;");
	inString = inString.replace(/</,"&lt;");
	inString = inString.replace(/>/,"&gt;");
	inString = inString.replace(/&/,"&amp;");
	return inString;
};

GridConfigurationBase.prototype.setPropertyMappingsConfig = function GridConfigurationBase_setPropertyMappingsConfig(propMappings, columnMappings, baselineColumnMappings) {
	// results get returned as arrays in columnMappings and baselineColumnMappings;
	var i = 0;
	for (i = 0; i < propMappings.getItemCount(); i++) {
		var colMappingNd = propMappings.getItemByIndex(i);
		var colName = colMappingNd.getProperty("col_name","");
		var AttrValue =  "";
		var mappedProp;
		if (!this.isColumnBaselineColumn || !this.isColumnBaselineColumn(colName)) {
		  mappedProp = colMappingNd.getProperty("mapped_property","");
		  if (mappedProp !== "") {
			columnMappings[colName] = {};
			columnMappings[colName].PropName = mappedProp;
			AttrValue = colMappingNd.getProperty("is_rel_property","");
			if (AttrValue !== "") {columnMappings[colName].isRelProp = (AttrValue ==="1");}
			AttrValue = colMappingNd.getProperty("cell_value_type","");
			if (AttrValue !== "") {
				if (AttrValue === "other") {
					AttrValue = colMappingNd.getProperty("cell_value_type_other","");
					if (AttrValue !== "") {columnMappings[colName].CellValueType = AttrValue;}
				}
				else {
					columnMappings[colName].CellValueType = AttrValue;
				}
			}
			AttrValue = colMappingNd.getProperty("cell_bg_color","");
			if (AttrValue !== "") {columnMappings[colName].CellBg = AttrValue;}
			AttrValue = colMappingNd.getProperty("cell_text_color","");
			if (AttrValue !== "") {columnMappings[colName].CellTextColor = AttrValue;}
			AttrValue = colMappingNd.getProperty("cell_link_key","");
			if (AttrValue !== "") {columnMappings[colName].CellLinkKey = "{"+AttrValue+"}";}
			AttrValue = colMappingNd.getProperty("cell_link_item_type","");
			if (AttrValue !== "") {columnMappings[colName].CellLinkKey += "+"+AttrValue;}
			AttrValue = colMappingNd.getProperty("cell_is_editable","");
			if (AttrValue !== "") {columnMappings[colName].isEditable = (AttrValue === "1");}
		  }
		  else {
			columnMappings[colName] = {};
			AttrValue = colMappingNd.getProperty("cell_static_value","");
			if (AttrValue !== "") {columnMappings[colName].CellStaticValue = AttrValue;}
			AttrValue = colMappingNd.getProperty("cell_value_type","");
			if (AttrValue === "row_icon") {columnMappings[colName].CellValueType = AttrValue;}

			AttrValue = colMappingNd.getProperty("cell_bg_color","");
			if (AttrValue !== "") {columnMappings[colName].CellBg = AttrValue;}			
			AttrValue = colMappingNd.getProperty("cell_text_color","");
			if (AttrValue !== "") {columnMappings[colName].CellTextColor = AttrValue;}
		  }
		}
		else {  // write to baselineCols array
		  mappedProp = colMappingNd.getProperty("mapped_property","");
		  if (mappedProp !== "") {
			baselineColumnMappings[colName] = {};
			baselineColumnMappings[colName].PropName = mappedProp;

			AttrValue = colMappingNd.getProperty("is_rel_property","");
			if (AttrValue !== "") {baselineColumnMappings[colName].isRelProp = (AttrValue ==="1");}

			AttrValue = colMappingNd.getProperty("cell_value_type","");
			if (AttrValue !== "") {
				if (AttrValue === "other") {
					AttrValue = colMappingNd.getProperty("cell_value_type_other","");
					if (AttrValue !== "") {baselineColumnMappings[colName].CellValueType = AttrValue;}				}
				else {
					baselineColumnMappings[colName].CellValueType = AttrValue;
				}
			}

			AttrValue = colMappingNd.getProperty("cell_bg_color","");
			if (AttrValue !== "") {baselineColumnMappings[colName].CellBg = AttrValue;}
			AttrValue = colMappingNd.getProperty("cell_text_color","");
			if (AttrValue !== "") {baselineColumnMappings[colName].CellTextColor = AttrValue;}
			AttrValue = colMappingNd.getProperty("cell_link_key","");
			if (AttrValue !== "") {baselineColumnMappings[colName].CellLinkKey = "{"+AttrValue+"}";}
			AttrValue = colMappingNd.getProperty("cell_link_item_type","");
			if (AttrValue !== "") {baselineColumnMappings[colName].CellLinkKey += "+"+AttrValue;}
			AttrValue = colMappingNd.getProperty("cell_is_editable","");
			if (AttrValue !== "") {baselineColumnMappings[colName].isEditable = (AttrValue === "1");}
		  }
		  else {
			baselineColumnMappings[colName] = {};
			AttrValue = colMappingNd.getProperty("cell_static_value","");
			if (AttrValue !== "") {baselineColumnMappings[colName].CellStaticValue = AttrValue;}
			AttrValue = colMappingNd.getProperty("cell_value_type","");
			if (AttrValue === "row_icon") {baselineColumnMappings[colName].CellValueType = AttrValue;}

			AttrValue = colMappingNd.getProperty("cell_bg_color","");
			if (AttrValue !== "") {baselineColumnMappings[colName].CellBg = AttrValue;}			
			AttrValue = colMappingNd.getProperty("cell_text_color","");
			if (AttrValue !== "") {baselineColumnMappings[colName].CellTextColor = AttrValue;}
		  }
		}
	}
	return i;
};

GridConfigurationBase.prototype.addActionMenuItemConfig = function GridConfigurationBase_addActionMenuItemConfig(actionMenuItems, menuGroupName) {
	var menuIdx = this.allMenuActions.length; // append to end of list
	for (var i = 0; i < actionMenuItems.getItemCount(); i++) {
		var menuActionNd = actionMenuItems.getItemByIndex(i);
		var actionName = menuActionNd.getProperty("name","");
		var isSeparator = (menuActionNd.getProperty("is_separator","0") === "1");

		var coreActions = "lock, unlock, where_used, view_item";
		var AttrValue =  "";
		this.allMenuActions[menuIdx] = {};
		this.allMenuActions[menuIdx].relQueryName = menuGroupName;

		if (isSeparator) {
			this.allMenuActions[menuIdx].separator = true;
		}
		else {
			this.allMenuActions[menuIdx].name = actionName;
		
			AttrValue = menuActionNd.getProperty("label","");
			if (AttrValue !== "") {this.allMenuActions[menuIdx].label = AttrValue;}
			else{this.allMenuActions[menuIdx].label = actionName;}
		
			AttrValue = menuActionNd.getProperty("execute_this_action","");
			if (AttrValue !== "") {this.allMenuActions[menuIdx].executeThisAction = AttrValue;}

			AttrValue = menuActionNd.getProperty("allow_on_group_rows","");
			if (AttrValue !== "") {
				AttrValue = AttrValue.replace(/ /g,"");  //strip all spaces
				this.allMenuActions[menuIdx].allowOnGroupRows = AttrValue;
			}

			AttrValue = menuActionNd.getProperty("is_disabled","");
			if (AttrValue !== "") {this.allMenuActions[menuIdx].isDisabled = (AttrValue === "1");}
			AttrValue = menuActionNd.getProperty("if_started_from_tab","");
			if (AttrValue !== "") {this.allMenuActions[menuIdx].ifStartedFromTab = (AttrValue === "true");}
			AttrValue = menuActionNd.getProperty("if_grid_is_editable","");
			if (AttrValue !== "") {this.allMenuActions[menuIdx].ifGridIsEditable = (AttrValue === "true");}
			AttrValue = menuActionNd.getProperty("if_is_user_is_admin","");
			if (AttrValue !== "") {this.allMenuActions[menuIdx].ifUserIsAdmin = (AttrValue === "true");}
			AttrValue = menuActionNd.getProperty("if_is_owner_of_context_item","");
			if (AttrValue !== "") {this.allMenuActions[menuIdx].ifUserIsOwnerOfContextItem = (AttrValue === "true");}
			AttrValue = menuActionNd.getProperty("if_is_owner_of_row_item","");
			if (AttrValue !== "") {this.allMenuActions[menuIdx].ifUserIsOwnerOfRowItem = (AttrValue === "true");}
			AttrValue = menuActionNd.getProperty("if_is_owner_manager_of_row_item","");
			if (AttrValue !== "") {this.allMenuActions[menuIdx].ifUserIsOwnerOrMangerOfRowItem = (AttrValue === "true");}
			AttrValue = menuActionNd.getProperty("if_row_item_is_current","");
			if (AttrValue !== "") {this.allMenuActions[menuIdx].ifItemIsCurrentVersion = (AttrValue === "true");}
			AttrValue = menuActionNd.getProperty("if_is_group_row","");
			if (AttrValue !== "") {this.allMenuActions[menuIdx].ifIsGroupRow = (AttrValue === "true");}
			AttrValue = menuActionNd.getProperty("if_effectivity_mode","");
			if (AttrValue !== "") {
				if (AttrValue === "current_config") {this.allMenuActions[menuIdx].ifEffectivityMode="current_config"; }
				if (AttrValue === "latest_released") {this.allMenuActions[menuIdx].ifEffectivityMode="latest_released"; }
			}
			AttrValue = menuActionNd.getProperty("if_row_item_is_released","");
			if (AttrValue !== "") {this.allMenuActions[menuIdx].ifRowItemIsReleased = (AttrValue === "true");}
			AttrValue = menuActionNd.getProperty("if_row_item_is_locked","");
			if (AttrValue !== "") {this.allMenuActions[menuIdx].ifRowItemIsLocked = (AttrValue === "true");}
			AttrValue = menuActionNd.getProperty("if_apply_to_parent_item","");
			if (AttrValue !== "") {this.allMenuActions[menuIdx].applyToParentItem = (AttrValue === "true");}

		}
		menuIdx++;
	}
};

GridConfigurationBase.prototype.setVisibleColumns = function GridConfigurationBase_setVisibleColumns(colNames, showBaselineCols) {
	this.visibleGridColumns = [];
	var idx = 0;
	for (var i = 0; i < colNames.getItemCount(); i++) {
		var nd = colNames.getItemByIndex(i);
		var colName = nd.getProperty("col_name","");

		//## logic for showViews needs re-design and re-work !!!
		var showColumn=false;
		var hideOnBaselineView = (nd.getProperty("is_hide_on_baseline","0") === "1");
		var isBaselineColumn = (nd.getProperty("is_baseline_column","0") === "1");

        if (showBaselineCols && !isBaselineColumn) {showColumn=true;}
        if (showBaselineCols && isBaselineColumn) {showColumn=true;}
        if (!showBaselineCols && !isBaselineColumn) {showColumn=true;}
        if (!showBaselineCols && isBaselineColumn) {showColumn=false;}
        if (showBaselineCols && hideOnBaselineView) {showColumn=false;}

		if (showColumn === true) {
		  if (nd.getProperty("is_lock_column","0") === "1") {this.lockColumnIndex = idx;}
		  if (nd.getProperty("is_change_action_column","0") === "1") {this.changeActionColumnIndex = idx;}

		  // register column config
		  this.visibleGridColumns[idx]= {
			Name: colName,
			Title: nd.getProperty("col_heading_label",""),
			Width: nd.getProperty("col_width",""),
			Align: nd.getProperty("col_align",""),
			HeadCellAlign: nd.getProperty("col_heading_align",""),
			EditType: nd.getProperty("col_edit_type",""),
			FilterEdit: nd.getProperty("col_filter_edit_type",""),
			isBaselineColumn: (nd.getProperty("is_baseline_column","0")==="1")
		  };
		  idx++;
		}
    }
};

GridConfigurationBase.prototype.getGridXML = function GridConfigurationBase_getGridXML(hasInputRow) {
	//Build empty grid XML
	var drawGrid = "false";
	if (this.getValue("drawGrid") === "1" || this.getValue("drawGrid") === "true") {drawGrid = "true";}
	var drawTreeLines = "false";
	if (this.getValue("drawTreeLines") === "1" || this.getValue("drawTreeLines") === "true") {drawTreeLines = "true";}

	var xml = '<table ';
	xml += 'font="'+this.getValue("gridFont","Microsoft Sans Serif-8")+'" ';
	xml += 'backgroundColor="'+this.getValue("gridBgColor","#000000")+'" ';
	xml += 'sel_bgColor="'+this.getValue("gridSelectorBgColor","#33ADD6")+'" ';
	xml += 'sel_TextColor="'+this.getValue("gridSelectorTextColor","#000000")+'" ';
	xml += 'delim ="|" ';
	xml += 'editable="'+this.getValue("gridIsEditable","true")+'" ';
	xml += 'draw_grid="'+drawGrid+'" ';
	xml += 'treelines="'+drawTreeLines+'" ';
	xml += 'column_draggable="'+this.getValue("columnsDragable","true")+'" ';
	xml += 'multiselect="'+this.getValue("allowMultiSelect","false")+'" ';
	xml += 'enableHtml="'+this.getValue("enableHtml","false")+'" ';
//	xml += 'zebra="'+this.getValue("enableZebraRows","false")+'" ';
	xml += 'enterAsTab="false" ';
//	xml += 'bgInvert="true" ';
	xml += 'bgInvert="false" ';
	xml += 'expandroot="true" ';
	xml += 'expandall="false" ';
	xml += '> <thead>';

	for(var columnIndex = 0; columnIndex < this.visibleGridColumns.length; columnIndex++) {
	  var colTitle;
	  if (this.visibleGridColumns[columnIndex].Title) {
	    colTitle = this.visibleGridColumns[columnIndex].Title;
	  }
	  else {
	    colTitle = this.visibleGridColumns[columnIndex].Name;
	  }
	  xml += ' <th align="'+this.visibleGridColumns[columnIndex].HeadCellAlign+'">' + colTitle + '</th>';
	}
	xml += '' +
	' </thead>' +
	' <columns>';	
	for(columnIndex = 0; columnIndex < this.visibleGridColumns.length; columnIndex++) {
		xml += ' <column width="' + this.visibleGridColumns[columnIndex].Width + '" align="' + this.visibleGridColumns[columnIndex].Align + '" edit="' + 
				this.visibleGridColumns[columnIndex].EditType + '" order="' + columnIndex + '" colname="' + this.visibleGridColumns[columnIndex].Name + '" />';
	}	
	xml += '' +
	' </columns>' +
	'<menu><emptytag/></menu>';

	if (hasInputRow) {
      xml += '<inputrow>';
	  for(columnIndex = 0; columnIndex < this.visibleGridColumns.length; columnIndex++) {
		xml += '  <td edit="FIELD" bgColor="#BDDEF7"/>';
	  }
      xml += '</inputrow>';
	}

	xml += '</table>';
	return xml;
};


//==================================================================================
//==== TREE GRID CLASS ====
// reads TreeGrid configuration from item of type "tgc_Configuration" into memory

//Data model: (with NULL relationships only)
//
//				[tgc_Configuration]  (state: New, In Review, Released) has Revisions: A,B,C
//					|
//					+->		[tgc_Constant]
//					+->		[tgc_Toolbar Element]
//					|			|
//					|			+->		[tgc_Toolbar Element Choice]
//					+->		[tgc_View]
//					|			|
//					|			+->		[tgc_View ColumnDef]
//					|			+->		[tgc_View MenuAction]
//					|			+->		[tgc_StructRelQuery MenuAction] ... query of structure only
//					|			+->		[tgc_Struct Prop MappingDef]
//					|			+->		[tgc_View Node RelQuery]   ... queries and grouping
//					|						|
//					|						+->		[tgc_Prop MappingDef]
//					|						+->		[tgc_RelQuery MenuAction]
//					|
//					+->		[tgc_Apply to Item Types]

//++++ Configurations Class (holds all configuration parameter)
TreeGridConfiguration = function TreeGridConfigurationFunc(configName,applyToItemType) {
  this.configurationName = this.excapeXML(configName);
  this.configItem = null;
  
  if (!applyToItemType || applyToItemType === undefined) {applyToItemType="";}
  this.applyToItemType = applyToItemType;
  this.configValues = {}; // holds simple parameter values
  this.isTreeGrid = true;

  this.gridLayoutViews = [];  //array
  this.relshipColumnMappings = [];  //array
  this.relshipBaselineColumnMappings = [];  //array

  this.toolbarId = "";
  this.toolbarElements = [];

  this.structureRelationship = {};
  this.structureRelationship.relName = ""; //init
  this.changeActionColumnIndex = -1;  
  this.lockColumnIndex = -1;
  this.configItemIsLoaded = false;

  if (this.configurationName && this.configurationName !== undefined && this.configurationName !== "") {
	this.loadConfigItem(this.configurationName);
  }
};
TreeGridConfiguration.prototype = new GridConfigurationBase();

//++++ TREE GRID CONFIG INTERFACE API +++++
TreeGridConfiguration.prototype.getGridStructureRelShipName = function TreeGridConfiguration_getGridStructureRelShipName() {
	return this.structureRelationship.relName;
};
TreeGridConfiguration.prototype.getGridStructureLevelsToLoad = function TreeGridConfiguration_getGridStructureLevelsToLoad() {
	return this.structureRelationship.levelsToLoad;
};
TreeGridConfiguration.prototype.getGridStructureNodeName = function TreeGridConfiguration_getGridStructureNodeName() {
	return this.structureRelationship.relatedItemType;
};
TreeGridConfiguration.prototype.getGridStructureNodeItemSelect = function TreeGridConfiguration_getGridStructureNodeItemSelect(viewName) {
	if (viewName === null || viewName === undefined) {return this.structureRelationship.nodeItemSelect;}

	var viewConfig = this.configItem.getItemsByXPath("//Item/Relationships/Item[@type='tgc_View' and name='"+viewName+"']");
	var relItemSelect = viewConfig.getProperty("structure_rel_item_select_prop",""); relItemSelect=relItemSelect.replace(/ /g,"");
	this.structureRelationship.nodeItemSelect = relItemSelect;
	return this.structureRelationship.nodeItemSelect;
};
TreeGridConfiguration.prototype.getGridStructureRelshipSelect = function TreeGridConfiguration_getGridStructureRelshipSelect() {
	return this.structureRelationship.relshipSelect;
};
TreeGridConfiguration.prototype.getGridStructureRowBgColor = function TreeGridConfiguration_getGridStructureRowBgColor() {
	return this.structureRelationship.rowBgColor;
};
TreeGridConfiguration.prototype.addStructureItemReleasedCondition = function TreeGridConfiguration_addStructureItemReleasedCondition(queryItem) {
	fn_setReleasedConditionOnItem (queryItem, this.structureReleasedCondition);
};
TreeGridConfiguration.prototype.isDisallowDuplicateItems = function TreeGridConfiguration_isDisallowDuplicateItems() {
	return this.structureRelationship.disallowDuplicateItems;
};
TreeGridConfiguration.prototype.isApplyChildBgColorUpToRoot = function TreeGridConfiguration_isApplyChildBgColorUpToRoot() {
	return this.structureRelationship.applyChildBgColorUpToRoot;
};
TreeGridConfiguration.prototype.getBgColorOfStructItemWithChildren = function TreeGridConfiguration_getBgColorOfStructItemWithChildren() {
	return this.structureRelationship.rowWithChildrenBgColor;
};
TreeGridConfiguration.prototype.getGridStructureRowIcon = function TreeGridConfiguration_getGridStructureRowIcon() {
	return this.structureRelationship.rowIcon;
};
TreeGridConfiguration.prototype.viewConfigExists = function TreeGridConfiguration_viewConfigExists(viewName) {
	if (this.gridLayoutViews[viewName]) {return true;}
	return false;
};
TreeGridConfiguration.prototype.getGridStructureRowRelShipDefinitions = function TreeGridConfiguration_getGridStructureRowRelShipDefinitions(viewName) {
	return this.gridLayoutViews[viewName].structureRowRelationshipDefs;
};
TreeGridConfiguration.prototype.getGridStructureRowRelShipName = function TreeGridConfiguration_getGridStructureRowRelShipName(viewName, relQueryName) {
	return this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].relationshipName;
};

TreeGridConfiguration.prototype.getChangeActionColumnIndex = function TreeGridConfiguration_getChangeActionColumnIndex() {
    return this.changeActionColumnIndex;
};
TreeGridConfiguration.prototype.isColumnBaselineColumn = function TreeGridConfiguration_isColumnBaselineColumn(columnName) {
  for (var idx=0;idx < this.visibleGridColumns.length; idx++)
  {
    if (this.visibleGridColumns[idx].Name === columnName) {
		if (this.visibleGridColumns[idx].isBaselineColumn) {return true;}
		else {return false;}
	}
  }
  return false;
};

TreeGridConfiguration.prototype.loadConfigItem = function TreeGridConfiguration_loadConfigItem(configItemName) {
	if (this.configItemIsLoaded) {return;}  // config is loaded already
	
	if (!configItemName || configItemName === undefined) {configItemName="";}
	// call server method to find grid configuration - if configItemName = "", then the server methods finds it from variable settings
	//alert(this.applyToItemType);
	var configItem = top.aras.newIOMItem("");
	configItem.loadAML('<Item type="'+this.applyToItemType+'" action="CommonBase GetGridConfigItem" configName="'+configItemName+'" />');
	configItem = configItem.apply();
	if (configItem.isError()) {
		top.aras.AlertError(top.aras.getResource("CommonUtilities","commonUtilities.message.cannot_load_grid_configuration").format(configItemName)+" - "+configItem.getErrorString());
		return false;
	}
	this.configItem = configItem;
	
	this.configurationName = this.excapeXML(configItem.getProperty("name"));
	this.setValue("GridConfigItem", this.configurationName);

	this.toolbarId = configItem.getProperty("toolbar_id","");
	
	this.structureRelationship.relName = configItem.getProperty("structure_relationship","");
	this.structureRelationship.levelsToLoad = configItem.getProperty("structure_levels_to_load","");
	this.structureRelationship.relatedItemType = configItem.getProperty("structure_item_type","");
	var val;
	val = configItem.getProperty("structure_row_bg_color","");	if (val === "") {val = "";} //default
	this.structureRelationship.rowBgColor = val;
	val = configItem.getProperty("is_disallow_duplicate_items","");	if (val === "") {val = "";} //default
	this.structureRelationship.disallowDuplicateItems = (val === "1");
	val = configItem.getProperty("apply_child_bg_color_up_to_root","0");
	this.structureRelationship.applyChildBgColorUpToRoot = false;
	if (val === "1") {this.structureRelationship.applyChildBgColorUpToRoot = true;}
		
	this.structureRelationship.rowWithChildrenBgColor  = configItem.getProperty("structure_row_w_chldren_bg_color","");

	val = configItem.getProperty("structure_row_icon_path","");
	if (val !== "") {this.structureRelationship.rowIcon = val;}

	// get config of optional link to a structure's root item
	this.rootItemPropertyName = configItem.getProperty("root_item_property_name","");
	this.rootItemConfigId = configItem.getProperty("root_item_config_id","");
	this.rootItemGeneration = configItem.getProperty("root_item_generation","");
	var rels = configItem.getItemsByXPath("//Item/Relationships/Item[@type='tgc_Apply to Item Types' and item_type_name='"+this.applyToItemType+"']");
	if (rels.getItemCount() === 1) {
		this.rootItemPropertyName = rels.getProperty("root_item_property_name",this.rootItemPropertyName);
		this.rootItemConfigId = rels.getProperty("root_item_config_id",this.rootItemConfigId);
		this.rootItemGeneration = rels.getProperty("root_item_generation",this.rootItemGeneration);
		this.rootItemEffectivity = rels.getProperty("root_item_effectivity",this.rootItemEffectivity);
		this.rootItemType = rels.getProperty("root_item_type",this.rootItemType);
		this.isStartedFromTOCview = (rels.getProperty("is_used_with_toc_view","0") === "1");
	}
	
	// read all constant values
	rels = configItem.getItemsByXPath("//Item/Relationships/Item[@type='tgc_Constant']");
	//var rels = configItem.getRelationships("tgc_Constant");
	for(var i = 0; i < rels.getItemCount(); i++) {
		var constName = rels.getItemByIndex(i).getProperty("name","");
		var constValue = rels.getItemByIndex(i).getProperty("value","");
		this.setValue(constName,constValue);
	}

	// init layoutViews
	rels = configItem.getItemsByXPath("//Item/Relationships/Item[@type='tgc_View']");
	if (rels.getItemCount() === 0)
		{top.aras.AlertError(top.aras.getResource("CommonUtilities","commonUtilities.message.config_of_grid_no_enabled_view_defs").format(this.configurationName)); return false;}

	for(i = 0; i < rels.getItemCount(); i++) {
		var viewName = rels.getItemByIndex(i).getProperty("name","");
		if (viewName !== "") {
			this.gridLayoutViews[viewName] = {};
			this.gridLayoutViews[viewName].name = viewName;
			
			this.gridLayoutViews[viewName].structureRowRelationshipDefs = [];
			var relShipQueries = configItem.getItemsByXPath("//Item/Relationships/Item[@type='tgc_View' and name='"+viewName+"']/Relationships/Item[@type='tgc_View Node RelQuery' and is_disabled != '1']");
			// it is OK, if no relQueries found. Config has just structure relationship defined.
			for(j = 0; j < relShipQueries.getItemCount(); j++) {
				var relNd = relShipQueries.getItemByIndex(j);
				var relQueryName = relNd.getProperty("name","");	

				if (this.structureRelationship.relName !== "" && relQueryName !== this.structureRelationship.relName) {
					this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName] = {};
					this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].name = relQueryName;
					val = relNd.getProperty("relationship_name","");				
					if (val !== "") {this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].relationshipName = val;}
					val = relNd.getProperty("group_name",""); 		
					this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].groupName = val;
					val = relNd.getProperty("group_label","");	if (val === "") {val = relQueryName;} //default				
					this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].groupLabel = val;
					val = relNd.getProperty("group_icon_path","");	if (val === "") {val = "../images/RightArrow.svg";} //default				
					this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].groupIcon = val;
					val = relNd.getProperty("row_icon_path","");
					if (val !== "") {this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].rowIcon = val;}
					val = relNd.getProperty("group_row_bg_color");	if (val === "") {val = "";} //default
					this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].groupRowBgColor = val;
					val = relNd.getProperty("row_bg_color","");	if (val === "") {val = "";} //default
					this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].rowBgColor = val; 
					val = relNd.getProperty("is_disallow_duplicate_items","0");
					if (val !== "") {this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].disallowDuplicateItems = (val==="1");}
					val = relNd.getProperty("is_reverse_query","");
					if (val !== "") {this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].isReverseQuery = (val==="1");}
					val = relNd.getProperty("is_disconnected_query","");
					if (val !== "") {this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].isDisconnectedQuery = (val==="1");}

					if (this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].isReverseQuery || this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].isDisconnectedQuery) {
						val = relNd.getProperty("related_item_property","");
						if (val !== "") {this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].relatedItemProperty = val;}
						val = relNd.getProperty("related_item_type_name","");
						if (val !== "") {this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].relatedItemType = val;}
						val = relNd.getProperty("relationship_select_properties","");
						if (val !== "") {this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].relationshipSelectProperties = val;}
						val = relNd.getProperty("related_item_select_properties","");
						if (val !== "") {this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].relatedItemSelectProperties = val;}
						val = relNd.getProperty("related_item_released_condition","");
						if (val !== "") {this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].relatedItemReleasedCondition = val;}
						val = relNd.getProperty("related_item_condition","");
						if (val !== "") {this.gridLayoutViews[viewName].structureRowRelationshipDefs[relQueryName].relatedItemCondition = val;}
					}
				}
			}
		}
	}
	this.configItemIsLoaded = true;
};

TreeGridConfiguration.prototype.buildGridDataQueryAML = function TreeGridConfiguration_buildGridDataQueryAML(viewName, rootItemType, rootItemId, isReleased, getStructureOnly) {
    if (viewName === null || viewName === undefined) {viewName="default";}
	if (getStructureOnly === null || getStructureOnly === undefined) {getStructureOnly=false;}
   
    if (this.structureRelationship.relName === "") 
	{top.aras.AlertError(top.aras.getResource("CommonUtilities","commonUtilities.message.config_of_grid_is_missing_def_of_struct_rel").format(this.configurationName,viewName)); return;}

	var viewConfig = this.configItem.getItemsByXPath("//Item/Relationships/Item[@type='tgc_View' and name='"+viewName+"']");
	
	var relItemSelect = viewConfig.getProperty("structure_rel_item_select_prop",""); relItemSelect=relItemSelect.replace(/ /g,"");
	var relShipSelect = viewConfig.getProperty("structure_rel_select_properties",""); relShipSelect=relShipSelect.replace(/ /g,"");
	var relShipOrderBy = viewConfig.getProperty("structure_rel_order_by",""); relShipOrderBy=relShipOrderBy.replace(/ /g,"");
	this.structureRelationship.nodeItemSelect = relItemSelect;
	this.structureRelationship.relshipSelect = relShipSelect;
	var relName = viewConfig.getProperty("structure_relationship","");
	var relItemName = viewConfig.getProperty("structure_item_type",""); 
	var isReleasedCondition  = viewConfig.getProperty("structure_itm_released_condition","");
	this.structureReleasedCondition = isReleasedCondition;
	var repeatProp = "related_id";
	var repeatTimes = viewConfig.getProperty("structure_rel_levels","0");
	if (repeatTimes === "All") {repeatTimes = "0";}

    // build query root item
	var queryItem = top.aras.newIOMItem(rootItemType,"");
	queryItem.setAttribute("select",relItemSelect);
	queryItem.setAttribute("isStructureNode","1");
	
	queryItem.setID(rootItemId);
	queryItem.setAction("GetItemRepeatConfig");
	
	//build structure relationship query
	var relShipItem = top.aras.newIOMItem(relName,"");
	relShipItem.setAttribute("select",relShipSelect);
	if (relShipOrderBy !== "") {relShipItem.setAttribute("orderBy",relShipOrderBy);}
	relShipItem.setAttribute("repeatProp",repeatProp);
	relShipItem.setAttribute("repeatTimes",repeatTimes);

	var relItem = top.aras.newIOMItem(relItemName,"get");
	relItem.setAttribute("select",relItemSelect);
	if (isReleased) {
		fn_setReleasedConditionOnItem (relItem, isReleasedCondition);
	}
	
	relShipItem.setRelatedItem(relItem);
	queryItem.addRelationship(relShipItem);	

    // build structure node relationships query items
	if (!getStructureOnly) {
		var rels = this.configItem.getItemsByXPath("//Item/Relationships/Item[@type='tgc_View' and name='"+viewName+"']/Relationships/Item[@type='tgc_View Node RelQuery']");
		for(i = 0; i < rels.getItemCount(); i++) {
			var rel = rels.getItemByIndex(i);
			if (rel.getProperty("is_reverse_query","0") !== "1" && rel.getProperty("is_disconnected_query","0") !== "1") {  // skip reverse and disconnected query definitions
				var relQueryName = rel.getProperty("name","");
				relName = rel.getProperty("relationship_name","");
				var relCustomAction = rel.getProperty("relationship_custom_action","get");
				if (relName === "") 
					{top.aras.AlertError(top.aras.getResource("CommonUtilities","commonUtilities.message.config_of_grid_def_of_rel_name_of_rel_query_not_set").format(viewName));return;}
				relShipSelect = rel.getProperty("relationship_select_properties",""); relShipSelect=relShipSelect.replace(/ /g,"");
				relShipOrderBy = rel.getProperty("relationship_select_properties",""); relShipOrderBy=relShipOrderBy.replace(/ /g,"");
				relItemProperty = rel.getProperty("related_item_property","");
				relItemName = rel.getProperty("related_item_type_name","");
				relItemSelect = rel.getProperty("related_item_select_properties",""); relItemSelect=relItemSelect.replace(/ /g,"");
			
				relShipItem = top.aras.newIOMItem(relName,relCustomAction);
				relShipItem.setAttribute("select",relShipSelect);
				if (relShipOrderBy !== "") {relShipItem.setAttribute("orderBy",relShipOrderBy);}

				isReleasedCondition = rel.getProperty("related_item_released_condition","");
				if (relItemName !== "") {
					relItem = top.aras.newIOMItem(relItemName,"get");
					relItem.setAttribute("select",relItemSelect);
					if (isReleased) {
						fn_setReleasedConditionOnItem (relItem, isReleasedCondition);
					}
					relShipItem.setPropertyItem(relItemProperty,relItem);
				}
				else {  // for NULL relship - apply condition to relship item
					if (isReleased) {
						fn_setReleasedConditionOnItem (relShipItem, isReleasedCondition);
					}
				}
				queryItem.addRelationship(relShipItem);
			}
		}
	}
	return queryItem.node.xml;
};

TreeGridConfiguration.prototype.buildGridDataRelShipQueryAML = function TreeGridConfiguration_buildGridDataRelShipQueryAML(viewName, relQueryName, sourceItemId, relatedItemId, isReleased, isStructureRel) {
	return this.buildGridDataRelShipQueryAML_ex(viewName, relQueryName, null, sourceItemId, relatedItemId, isReleased, isStructureRel);
};

TreeGridConfiguration.prototype.buildGridDataRelShipQueryAMLbyId = function TreeGridConfiguration_buildGridDataRelShipQueryAMLbyId(viewName, relQueryName, relshipId, isReleased, isStructureRel) {
	return this.buildGridDataRelShipQueryAML_ex(viewName, relQueryName, relshipId, null, null, isReleased, isStructureRel);
};

TreeGridConfiguration.prototype.buildGridDataRelShipQueryAML_ex = function TreeGridConfiguration_buildGridDataRelShipQueryAML_ex(viewName, relQueryName, relshipId, sourceItemId, relatedItemId, isReleased, isStructureRel) {
   if (!viewName || viewName === undefined) {viewName="default";}
 
	var viewConfig = this.configItem.getItemsByXPath("//Item/Relationships/Item[@type='tgc_View' and name='"+viewName+"']");
	if (viewConfig.isError())
		{top.aras.AlertError(top.aras.getResource("CommonUtilities","commonUtilities.message.config_of_grid_error_reading_view_config").format(viewName,this.configurationName)+" - "+
		viewConfig.getErrorString()); return false;}
 
	var rels,rel;
	var itm,relName,relItemSelect,relShipSelect,relItemName,isReleasedCondition,relItemProperty;
	if (isStructureRel && isStructureRel === true) {
		relItemSelect = viewConfig.getProperty("structure_rel_item_select_prop","");
		relShipSelect = viewConfig.getProperty("structure_rel_select_properties","");
		relName = viewConfig.getProperty("structure_relationship","");
		relItemName = viewConfig.getProperty("structure_structure_item",""); 
		isReleasedCondition  = viewConfig.getProperty("structure_itm_released_condition",""); 
		relItemProperty = "related_id";
	}
	else {
		rels = viewConfig.getItemsByXPath("Relationships/Item[@type='tgc_View Node RelQuery' and name='"+relQueryName+"']");
		if (rels.getItemCount() === 0) {return false;}
		rel = rels.getItemByIndex(0); // should only be 1 relationship with name of relQueryName !!!
		relName = rel.getProperty("relationship_name",""); 
		relShipSelect = rel.getProperty("relationship_select_properties","");
		relItemName = rel.getProperty("related_item_type_name","");
		relItemSelect = rel.getProperty("related_item_select_properties","");
		isReleasedCondition = rel.getProperty("related_item_released_condition","");
		relItemProperty = rel.getProperty("related_item_property","");
	}
	var relShipItem = top.aras.newIOMItem(relName,"get");
	relShipItem.setAttribute("select",relShipSelect);

	if (relItemName !== "") {  //could be null relationship
		var relItem = top.aras.newIOMItem(relItemName,"get");
		relItem.setAttribute("select",relItemSelect);
		if (relatedItemId && relatedItemId !== undefined && !relshipId) {relItem.setID(relatedItemId);}

		if (isReleased) {
			fn_setReleasedConditionOnItem (relItem, isReleasedCondition);
		}
		relShipItem.setPropertyItem(relItemProperty,relItem);
	}
	var sel = relShipItem.getAttribute("select","");
	if (sel.indexOf("source_id") < 0) {
		sel += ",source_id(config_id,generation)";
		relShipItem.setAttribute("select",sel);
	}
	relShipItem.setAction("get");
	
	if (!relshipId) {relShipItem.setProperty("source_id",sourceItemId);}

	if (relshipId) {relShipItem.setID(relshipId);}
		
	return relShipItem.node.xml;
};
//## for backward compatbility
TreeGridConfiguration.prototype.buildGridLayoutXml = function TreeGridConfiguration_buildGridLayoutXml(viewName, showBaselineCols, hasInputRow) {
	return this.getGridDefinitionXml(viewName, showBaselineCols, hasInputRow);
};

TreeGridConfiguration.prototype.getGridDefinitionXml = function TreeGridConfiguration_getGridDefinitionXml(viewName, showBaselineCols, hasInputRow) {
	var viewConfig = this.configItem.getItemsByXPath("//Item/Relationships/Item[@type='tgc_View' and name='"+viewName+"']");
	if (viewConfig.isError())
		{top.aras.AlertError(top.aras.getResource("CommonUtilities","commonUtilities.message.config_of_grid_error_reading_view_config").format(viewName,this.configurationName)+" - "+
		viewConfig.getErrorString()); return false;}

	this.allMenuActions = [];  // clear previous menu actions
	this.addActionMenuItemConfigToAllActions(viewName); // default menu
	var colNames = viewConfig.getItemsByXPath("Relationships/Item[@type='tgc_View ColumnDef' and is_disabled != '1']");
	this.setVisibleColumns(colNames, showBaselineCols);

	// read relationship column mappings
	this.setConfigOfRelShipPropertyMappings(viewName, this.structureRelationship.relName, showBaselineCols, true);
	this.addActionMenuItemConfigToAllActions(viewName,this.structureRelationship.relName, true); // structure rel specific menu
	var childItemRelNames = this.getGridStructureRowRelShipDefinitions(viewName);
	for (var relName in childItemRelNames) {
		this.setConfigOfRelShipPropertyMappings(viewName, relName, showBaselineCols);
		this.addActionMenuItemConfigToAllActions(viewName,relName); // rel specific menu
	}
	return this.getGridXML(hasInputRow);
};
//^^^^^ TREE GRID CONFIG INTERFACE API ^^^^^

TreeGridConfiguration.prototype.setConfigOfRelShipPropertyMappings = function TreeGridConfiguration_setConfigOfRelShipPropertyMappings(viewName, relQueryName, showBaselineCols, isStructureRel) {
	// mapping config will be placed into arrays: this.relshipColumnMappings[relQueryName], this.relshipBaselineColumnMappings[relQueryName]
	
	var viewConfig = this.configItem.getItemsByXPath("//Item/Relationships/Item[@type='tgc_View' and name='"+viewName+"']");
	if (viewConfig.isError())
		{top.aras.AlertError(top.aras.getResource("CommonUtilities","commonUtilities.message.config_of_grid_error_reading_view_config").format(viewName,this.configurationName)+" - "+
		viewConfig.getErrorString()); return false;}

	var propMappings;
	if (isStructureRel && isStructureRel === true) {
		propMappings = viewConfig.getItemsByXPath("Relationships/Item[@type='tgc_Struct Prop MappingDef' and is_disabled != '1']");
	}
	else {
		propMappings = viewConfig.getItemsByXPath("Relationships/Item[@type='tgc_View Node RelQuery' and name='"+relQueryName+"']/Relationships/Item[@type='tgc_Prop MappingDef' and is_disabled != '1']");
	}
	this.relshipColumnMappings[relQueryName] = [];
	this.relshipBaselineColumnMappings[relQueryName] = [];
	this.setPropertyMappingsConfig(propMappings, this.relshipColumnMappings[relQueryName], this.relshipBaselineColumnMappings[relQueryName]);
};

TreeGridConfiguration.prototype.addActionMenuItemConfigToAllActions = function TreeGridConfiguration_addActionMenuItemConfigToAllActions(viewName, relQueryName, isStructureRel) {
	if (!relQueryName || relQueryName === undefined) {relQueryName = "default";}

	var viewConfig = this.configItem.getItemsByXPath("//Item/Relationships/Item[@type='tgc_View' and name='"+viewName+"']");
	if (viewConfig.isError())
		{top.aras.AlertError(top.aras.getResource("CommonUtilities","commonUtilities.message.config_of_grid_error_reading_view_config").format(viewName,this.configurationName)+" - "+
		viewConfig.getErrorString()); return false;}

	var actionMenuItems;
	if (relQueryName === "default") {
		actionMenuItems = viewConfig.getItemsByXPath("Relationships/Item[@type='tgc_View MenuAction']");
	}
	else {

		if (isStructureRel && isStructureRel === true) {
			actionMenuItems = viewConfig.getItemsByXPath("Relationships/Item[@type='tgc_StructRelQuery MenuAction']");
		}
		else {
			actionMenuItems = viewConfig.getItemsByXPath("Relationships/Item[@type='tgc_View Node RelQuery' and name='"+relQueryName+"']/Relationships/Item[@type='tgc_RelQuery MenuAction']");
		}
	}
	this.addActionMenuItemConfig(actionMenuItems, relQueryName);
};

// include more GridConfig prototypes from different js file to handle flat Grids  (skips the include, if file does not exits)
try {
   window.eval(top.aras.getFileText(top.aras.getBaseURL() + "/Solutions/CommonUtilities/javascript/CommonBaseFlatGridCfgHandler.js"));
}finally {}

//==================================================================================
//+++++ misc Helper Functions +++++
fn_setReleasedConditionOnItem = function (itm, amlConditions) {
	if (amlConditions === "") {return;}
	var conditions = amlConditions.split(";");
	for (var c=0;c<conditions.length;c++) {
		var pos = conditions[c].indexOf(">");
		var pos2 = conditions[c].indexOf("</");
		if (pos >=0) {
			var propName = conditions[c].substring(1,pos);
			var propVal = conditions[c].substring(pos+1,pos2);
			itm.setProperty(propName,propVal);
			itm.setPropertyAttribute(propName,"isReleasedQueryCondition","1");  // tag the property to indicate condition was added by rules
		}	
	}
};
