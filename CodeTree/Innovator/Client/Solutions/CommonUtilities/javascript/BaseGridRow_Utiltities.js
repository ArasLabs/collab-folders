// ModuleName:  BaseGridRow_Utiltities
// version: 	v3-1
// date:		Sept-2016
// innovator code tree location: ../Client/Solutions/CommonUtilities/javascript/BaseGridRow_Utiltities.js

/// Part of package: "commonBase Grid Utilities"
/// use with your own JS logic that connects to Form Event "onload". Example code below shows how to include into your logic
/// SAMPLE:  if (typeof RowClass != 'function') {eval(top.aras.getFileText(top.aras.getBaseURL() + "/Solutions/CommonUtilities/javascript/BaseGridRow_Utiltities.js"));}

/// requires BaseGridMain_Utiltities.js to be included first !!!
//

// global variable "I18Ncntx"   must be declared before loading this method !!!

//-------- local row class
RowClass = function (gridCtxt, data, gridColumnsDef, cellsMappingClasses ) {
	this.gridCtxt = gridCtxt;
	this.data = data;
	this.columnsDef = gridColumnsDef;
	this.length = gridColumnsDef.length; //all cols of grid
	
	this.cells = [];
	if (cellsMappingClasses && cellsMappingClasses !== undefined) {
		fn_SetAllCellsMappingClasses(this, this.columnsDef, cellsMappingClasses);
	}
};

RowClass.prototype = {
	gridCtxt: null,
	length: 0,
	data: null,
	
	setRowData: function(data) {
		this.data = data;
	},
	
	setAllCellsMappingClasses: function(cellsMappingClasses) {
		fn_SetAllCellsMappingClasses(this, this.columnsDef, cellsMappingClasses);
	},
	
	getValues: function() {
		var rowText = [];
		for(var cellName in this.cells)
		{
			var cell = this.cells[cellName];
			var domValue = cell.getValueFromDom();
			if (!domValue || domValue === undefined) {domValue="";}
			var uiValue="";
			if (domValue || domValue ==="") {uiValue = cell.convertValueForUI(domValue);}
			rowText.push(uiValue);
		}
		var values = rowText.join("|");
/* ### grid cell does not support <mark> html ###	- fix this when supported 
		var highlightText = "Proj";
		if (highlightText && highlightText !== undefined && highlightText !== "") {
			re = new RegExp(highlightText,"gi");
			values = values.replace(re,"<mark>"+highlightText+"</mark>");
		}
*/
		return values;
	},
	
	setGridRowUserData : function(rowId,itemType,itemId) {
		if (!rowId || rowId === "") {return;}
		if (!this.gridCtxt.gridRowUserData[rowId] && this.gridCtxt.gridRowUserData[rowId] === undefined) {this.gridCtxt.gridRowUserData[rowId] = [];}

		this.gridCtxt.gridRowUserData[rowId]["rowItemType"] =  itemType;
		this.gridCtxt.gridRowUserData[rowId]["rowItemID"] =  itemId;
	},
	
	bind: function(rowId,rowDefaultBg,itemType,itemId) {  //add links and bg colors
	  return this.bindWithColors(rowId,null,rowDefaultBg,itemType,itemId);
	},
	
	bindWithColors: function(rowId,rowDefaultTextColor,rowDefaultBg,itemType,itemId) {  //add links and bg colors
		if (itemType && itemId) {
			if (!rowId || rowId === "") {return;}
			if (!this.gridCtxt.gridRowUserData[rowId] && this.gridCtxt.gridRowUserData[rowId] === undefined) {this.gridCtxt.gridRowUserData[rowId] = [];}

			this.gridCtxt.gridRowUserData[rowId]["rowItemType"] =  itemType;
			this.gridCtxt.gridRowUserData[rowId]["rowItemID"] =  itemId;
		}
		var col=0;
		for(var cellName in this.cells) {
			var cell = this.cells[cellName];
			if(cell.cellLinkKey) {
				this.gridCtxt.setLink(rowId, cell.columnIndex, cell.cellLinkKey, cell.propname, cell.getValueFromDom());
			}
			
			var BgColor = cell.getBackgroundColor();
			if (rowDefaultBg && rowDefaultBg !== undefined && !BgColor) {BgColor = rowDefaultBg;}
			var gridCell = this.gridCtxt.grid.cells(rowId, col);
			if (BgColor !== "") {
				//if (this.gridCtxt.isTreeGrid) {gridCell.setBgColor(BgColor);}
				//else {gridCell.SetBgColor_Experimental(BgColor);}
				//#TODO - replace _Experimental call# else {gridCell.SetBgColor(BgColor);}
				gridCell.SetBgColor_Experimental(BgColor);
			}
			if (rowDefaultTextColor && rowDefaultTextColor !== undefined && rowDefaultTextColor !== "") {
				if (this.gridCtxt.isTreeGrid) {gridCell.setTextColor(rowDefaultTextColor);}
				else {gridCell.SetCellTextColor(rowDefaultTextColor);}
			}
			col++;
		}
	}
};

// default cell class used if not overwritten by column definitions
DefaultCellClass = function() {
};

DefaultCellClass.prototype = {
	gridCtxt: null,
	columnIndex: null,
	row: null,

	initialize: function(columnIndex, columnName, gridCtxt, row, propname, isRelProp, cellValueType, cellStaticValue, cellBg, cellLinkKey) {
		this.gridCtxt = gridCtxt;
		this.row = row;
		this.columnIndex = columnIndex;
		this.name = columnName;
		this.propname = propname;
		this.isRelProp = isRelProp;
		this.cellValueType = cellValueType;
		this.cellStaticValue = cellStaticValue;
		this.cellBg = cellBg;
		this.cellLinkKey = cellLinkKey;
	},

	getBackgroundColor: function() {
	    if (!this.cellBg) {
		  return "";
		}
		// Resolve cellBg keywords
		var cellBg = this.cellBg.split("+");
		if (cellBg[0] === "{propCSS}") {
		  var propName = this.propname;
		  var css = "";
	      if (this.isRelProp) {
		    if (this.row.data.relationshipNode) {css = this.row.data.relationshipNode.getProperty("css","");}
	      }
	      else {
	       if(this.row.data.itemNode) {css = this.row.data.itemNode.getProperty("css","");}
	      }
		  var colVal = "";
		  if (css !== "") {
		   if (propName.indexOf("state") >=0 ) {propNmae = "state";}
           var pos1 = css.indexOf("."+propName);
	       if (pos1 >=0) {
	        var cssSub = css.substring(pos1,css.length);
	        var pos2 = cssSub.indexOf("}");
	        if (pos2 > 0) {
	         cssSub = cssSub.substring(0,pos2);
		     pos1 = cssSub.indexOf("background-color");
	         if (pos1 >=0) {
		      cssSub = cssSub.substring(pos1,cssSub.length);
	          pos2 = cssSub.indexOf("#");
		      if (pos2 > 0) {
		       colVal = cssSub.substring(pos2,pos2+7);
		      }
		     }
	        } 
	       }
          }
		  if (colVal !== "") {return colVal;}
		  if (cellBg.length === 2) {return cellBg[1];}
		  return "";
		}
	    // assume cellBg has valid color value (i.e. "#ff0000" )
		return cellBg[0];
	},
	
	getLink: function() {
	  if (this.cellLinkKey) {  //## no longer in use
		return null;	
	  }
	  return null;
	},

	convertValueForUI: function(value) {
	    if (this.isRelProp) {
			value = fn_formatCellValueByValueType (this.gridCtxt, value, this.cellValueType, this.propname, this.row.data.relationshipNode, this.row.data.rowIcon);
	    }
	    else {
			value = fn_formatCellValueByValueType (this.gridCtxt, value, this.cellValueType, this.propname, this.row.data.itemNode, this.row.data.rowIcon);
	    }
		return value;
	},

	getValueFromDom: function() {
	 if (this.cellStaticValue) {
	   return this.cellStaticValue;
	 }
	
	 if(this.propname) {
	  var propName = this.propname.replace(/ /g,"");  // strip spaces
	  
	  // evaluate concatenation rule of properties within the same item type
	  var propNames = [];
	  if (propName.indexOf("+") > 0) {
	    propNames = propName.split("+");
	  }
	  else {
	    propNames[0] = propName;
	  }
	  var propValue = "";
	  var sep = "";
	  // loop - concatenated props
	  for (var i=0;i<propNames.length; i++) {
	    var isRelProp = this.isRelProp;
		
		propName = propNames[i];
		if (propName.indexOf("rel.") >=0) {
		  isRelProp = true;
		  propName = propName.replace(/rel./,"");
		}
	    var val;
	    if (isRelProp) {
		  if (this.row.data.relationshipNode) {val = this.row.data.relationshipNode.getProperty(propName,"");}
	    }
	    else {
	     if(this.row.data.itemNode) {val = this.row.data.itemNode.getProperty(propName,"");}
	    }
		if (this.cellValueType === "class_leaf") {
		  val = fn_GetClassLeafFromClassPath(propName,val);
	    }
		if (!val || val === undefined) {val="";}
		propValue += sep + val;
		sep = " - ";
	  }
	  if (this.row.data.itemNode && this.cellValueType === "append_rev_gen") {
	     propValue += " (" + this.row.data.itemNode.getProperty("major_rev","") + "." + this.row.data.itemNode.getProperty("generation","") + ")";
	  }
	  return propValue;
	 }
	 else {
	  return "";
	 }
	 return "";
	}
};

//==================================
fn_SetAllCellsMappingClasses = function(rowCtxt, gridColumnsDef, cellsMappingClasses)
{
	rowCtxt.cells = [];
	for(var cellIndex = 0; cellIndex < gridColumnsDef.length; cellIndex++) {		
		var cellName = gridColumnsDef[cellIndex].Name;
		var column = cellsMappingClasses[cellName];
		
		var cell;
		if(column) {
			if (column.Class) {
				cell = new column.Class();
			}
			else {
			   cell = new DefaultCellClass();
			}
			cell.initialize(cellIndex, cellName, rowCtxt.gridCtxt, rowCtxt, column.PropName, column.isRelProp, column.CellValueType, column.CellStaticValue, column.CellBg, column.CellLinkKey);
		}
		else {
			cell = new DefaultCellClass();
			cell.initialize(cellIndex, cellName, rowCtxt.gridCtxt, rowCtxt);
		}

		rowCtxt.cells[cellName] = cell;
	}
};

//-----
fn_formatCellValueByValueType = function(gridCntxt, cellValue, cellValueType, propName, dataItem, rowIcon)
{
  if (!cellValueType || cellValueType === undefined) {return cellValue;}

  if (cellValueType.indexOf("trueImage:") >= 0 || cellValueType.indexOf("falseImage:") >= 0) {
  	cellValue = fn_GetTrueOrFalseImage(cellValueType,cellValue);
  }
  else {
    switch(cellValueType)
	{
	case "row_icon":
	  //cellValue = rowIcon;
	  cellValue = "<img src='"+rowIcon+"' />";
	  break;
	case "lock":
	  cellValue = fn_GetLockedCellFormatFromLockedById(gridCntxt,cellValue);
	  break;
	case "check":
	  cellValue = fn_GetCheckBoxCellFormat(gridCntxt,cellValue);
	  break;
	case "not_current_gen":
	  cellValue = fn_GetNotCurrentGenImageFormat(gridCntxt,cellValue);
	  break;
	case "image":
	  cellValue = "<img src='"+cellValue+"' />";
	  break;
	case "date":
	  cellValue = fn_GetI18NShortDate(cellValue,"--");
	  break;
	case "decimal":
	  cellValue = fn_GetI18NDecimal(cellValue,"--","decimal");
	  break;
	case "float":
	  cellValue = fn_GetI18NDecimal(cellValue,"--","float");
	  break;
	case "keyed_name":
	case "item(keyed_name)":
	  cellValue = dataItem.getPropertyAttribute(propName,"keyed_name","");
	  break;  
	}
  }
  return cellValue;
};	  

// MISC ROW HELPER FUNCTIONS

//==================================
//injects .trim method to String class, if browser does not support it
if(!String.prototype.trim) {  
  String.prototype.trim = function () {  
	return this.replace(/^[ ]+|[ ]+$/g,'');  
  };  
} 

//==================================
fn_GetTrueOrFalseImage = function (cellValueType,cellValue)   {
	// expects cellValue to be from boolean property with "0" or "1" set.
    // syntax to parse:  "trueImage: filename ; falseImage: filename"
	var arr = cellValueType.split(";");
	if (arr[0]==="") {return cellValue;}
	for (var i=0; i<arr.length; i++) {
		var rule = arr[i].trim();
		var ruleA = rule.split(":");
		rule = ruleA[0].trim();
		var imgVal = "";
		if (ruleA.length === 2) {imgVal = ruleA[1].trim();}
		if (rule === "trueImage" && cellValue === "1") {return "<img src='"+imgVal+"' />";}
		if (rule === "falseImage" && (cellValue === "0" || cellValue === "")) {return "<img src='"+imgVal+"' />";}
	}
	return ""; //no image
};
//==================================
fn_GetCheckBoxCellFormat = function (gridCntxt, on_off_value)   {
  var checked_icon = "<img src='"+gridCntxt.icons["item_chk0"]+"' />";
  if (on_off_value === "1") {checked_icon = "<img src='"+gridCntxt.icons["item_chk1"]+"' />";}
  return checked_icon;
};
//==================================
fn_GetNotCurrentGenImageFormat = function (gridCntxt,on_off_value)   {
  var newer_gen_icon = "";
  if (on_off_value === "0") {newer_gen_icon = "<img src='"+gridCntxt.icons["newerItemGen"]+"' />";}
  return newer_gen_icon;
};
//==================================
fn_GetI18NShortDate = function (dateString, defaultVal)   {
  if (dateString && dateString !== "" && dateString !== defaultVal) {
	   return I18Ncntx.ConvertFromNeutral(dateString,"date","short_date");
  }
  else {
    return defaultVal;
  }
};
fn_GetI18NDecimal = function (decimalString, defaultVal, fromType)   {
  if (decimalString && decimalString !== "" && decimalString !== defaultVal) {
	   return I18Ncntx.ConvertFromNeutral(decimalString,fromType);
  }
  else {
    return defaultVal;
  }
};
//==================================
fn_GetOpenIconOfItemType = function (itemType)   {
  var qryIcon = top.aras.newIOMItem();
  qryIcon.loadAML("<Item type='ItemType' action='get' select='name,open_icon'><name>"+itemType+"</name></Item>");
  qryIcon = qryIcon.apply();
  var smallIcon = "";
  if (qryIcon.getItemCount() === 1) {smallIcon = qryIcon.getProperty("open_icon",smallIcon);}
  return smallIcon;
};
//==================================
fn_GetLockedCellFormatFromLockedById = function (gridCntxt,lockedById)   {
	if (!lockedById || typeof(lockedById) == "undefined" || lockedById === "") {
	   return "";
	}
    var currUserId = top.aras.getUserID();
	if (lockedById === currUserId) {
	   return "<img src='"+gridCntxt.icons["locked"]+"' />"; // locked by this user
	}
    return "<img src='"+gridCntxt.icons["locked_else"]+"' />"; // locked by other  user
};
//==================================
fn_GetClassLeafFromClassPath = function (propName,classPath)   {
	if (!classPath || typeof(classPath) == "undefined" || classPath === "") {
	   return "";
	}
	if (propName !== "classification") {return classPath;}
    var pos1 = classPath.lastIndexOf("/");
	if (pos1 >= 0) {
		var val = classPath.substring(pos1+1,classPath.length);
		return val;
	}
    return classPath;
};
//===OLD============================
fn_GetLockedCellFormatByStatusCode = function (gridCntxt, statusCode)   {
  switch (statusCode)
  {
   case 0:
     return "";
   case 1:
     return "<img src='"+gridCntxt.icons["locked"]+"' />";
  }
  return "<img src='"+gridCntxt.icons["locked_else"]+"' />";
};
//==================================
fn_GetLockedCellIconFormatByStatusCode = function (icons, statusCode)   {
  switch (statusCode)
  {
   case 0:
     return "";
   case 1:
     return "<img src='"+icons["locked"]+"' />";
  }
  return "<img src='"+icons["locked_else"]+"' />";
};
