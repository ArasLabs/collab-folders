Notice of Liability
-------------------
The information contained in this document and the import packages are distributed on an "As Is" basis, 
without warranty of any kind, express or implied, including, but not limited to, the implied warranties 
of merchantability and fitness for a particular purpose or a warranty of non-infringement. Aras shall have 
no liability to any person or entity with respect to any loss or damage caused or alleged to be caused 
directly or indirectly by the information contained in this document or by the software or hardware products 
described herein.


--------------------------------------------
Packages Import Instructions
--------------------------------------------
Author:
  Rolf Laudenbach (rlaudenbach@aras.com)


Version:
--------
v5-0 (Oct 2016)
- upgraded to work with 11SP7 and Chrome (still some issues with Chrome, creating new controlled item on treeGrid)
- now uses updated versions of "common Utitlties(v-3-0)" and "common Grid Utiltities(v3-1)" (partial)

- Moved grid configuration to xml file read from a code tree location.
  The filename of this configuration file must be defined in a "Variable"
  with this naming convention: "tGridCfg <item type name>"
  where <item type name> is the item types using the collaboration folder navigator grid (i.e "tGridCfg cFolder")

- CodeTreeOverlay now contain Grid config XML and javascript library modules of "common Grid Utitltites"
- added structure grid handler (logik) specific to Colloboration Folder (instead of generic from common Grid Utitities)

- a logic to inherit related_project setting from root folder to sub folders and controlled items a can be enables
  by setting the variable "cFolder Check Root related Proj" to "1".. (default = "0")

Known Issues
------------
- right click menu actions don't always fire first time. second time works.
- Folder Navigator: action "cut_folder" not implemented, yet. 
- Folder Navigator: action "paste_folder" not implemented, yet. 
- File Drag n Drop not yet implemented (can be cloned from "relatioshipsgrid.js") !
- Loading by level no longer supported. For large structures loading can take a while. Future release may re-introduce loading by levels
. where used & structure browser base actions no longer work.  check new way of using Dependencies module (JS)


=========================
Installation Instructions
=========================
	(1) Start the Aras Packing "Import Tool" and login as "admin". 

	The imports will require multiple steps that need to be run exactly in the sequence listed below. Use option MERGE for all steps !!!

	1-Other Dependent Packages:
		Select this manifest File "…\1-Other Dependent Packages\1-Common Utilties v2-1 (partial)\imports (admin).mf"
		"Common Utilities" <-- place check mark in this option and start the import.

		Select this manifest File "…\1-Other Dependent Packages\2-Common Grid Utilities v3-0\1-Grid Utilities\imports (admin).mf"
		"Common Grid Utilities" <-- place check mark in this option and start the import.

	2-Innovator Core and PLM extensions:
		Select this manifest File "…\2-Innovator Core and PLM extensions\1-imports - PLM (admin).mf"
		"com.aras.innovator.solution.PLM" <-- place check mark in this option and start the import.

		Select this manifest File "…\2-Innovator Core and PLM extensions\2-imports - CF (admin).mf"
		"Collaboration Folders" <-- place check mark in this option and start the import.

		Select this manifest File "…\2-Innovator Core and PLM extensions\3-imports - core (admin).mf"
		"com.aras.innovator.core" <-- place check mark in this option and start the import.

	3-Collaboration Folders:
		(Optional) Select this manifest File "…\3-Collaboration Folders\1-imports (admin) - Renaming.mf"
		"Collaboration Folders" <-- place check mark in this option and start the import.

		Select this manifest File "…\3-Collaboration Folders\2-imports (admin).mf"
		"Collaboration Folders" <-- place check mark in this option and start the import.

	4-Collaboration Folders on TOC:
		Select this manifest File "…\4-Collaboration Folders on TOC\imports (admin).mf"
		"Collaboration Folders" <-- place check mark in this option and start the import.

    (Optional) 6-Folders On Program And Project:
		Select this manifest File "…\6-Folders On Program And Project\1_AddToProgram\1-imports - CF (admin).mf"
		"Collaboration Folders" <-- place check mark in this option and start the import.

		Select this manifest File "…\6-Folders On Program And Project\1_AddToProgram\2-imports - Program (admin).mf"
		"com.aras.innovator.solution.Project" <-- place check mark in this option and start the import.
			
		Select this manifest File "…\6-Folders On Program And Project\2_AddToProject\1-imports - CF (admin).mf"
		"Collaboration Folders" <-- place check mark in this option and start the import.

		Select this manifest File "…\6-Folders On Program And Project\2_AddToProject\2-imports - Project (admin).mf"
		"com.aras.innovator.solution.Project" <-- place check mark in this option and start the import.
	
	(Optional) Configuration Data:
		Select this manifest File "…\5-Configuration Data\imports (admin).mf"
		"Collaboration Folders" <-- place check mark in this option and start the import.
		## this import will fail, if you do not have the grid configurations from package "Common Grid Utilities" loaded already ##
		
	(Optional) SetPackageVersion :
		Select this manifest File "…\SetPackageVersion (optional)\imports (admin).mf"
		"Collaboration Folders" <-- place check mark in this option and start the import.
		## this import will fail, if you do not have the package "Package Utilities v1-6(A11)" loaded already ##
		
	(OUTDATED) 5-Configuration Data:
		Select this manifest File "…\5-Configuration Data\imports (admin).mf"
		"Collaboration Folders" <-- place check mark in this option and start the import.
		## This import will break Collab Folders on newer versions of innovator##


	(2) After all imports have finished the final step is to copy some add-on "images" and "ui_resource"(for multi-language messages) files
		into the "CodeTree" of your Aras installation.

		Open folder "…\_CodeTreeOverlays" then copy folder "Innovator". Navigate to your CodeTree and paste the "Innovator" folder to the installation root.
		Choose option "overwrite", if older versions of any file are found.




################
Version History:
################

V4-0 (Oct 2015)
- added flexible "Grid Configurations" based on "CommonBase Grid Utiltities" (package)
- added new folder relationship "cFolder URL" that allows 

- context menus are defined in "Grid Configurations" - total rework of previous menus
- added inheritance of "owner" and "manager" and "team" to all subfolders (used to be "team" only).

- major rework of "grid loading" - based on "Grid Configurations" now.

- added concept or "TOC Folders" - "Dummy" Item Types exposed on TOC can have "cFolder Structure" form in their TOC view.
	--> configuration can point to a folder identified by its "config_id" to be displayed in a TOC Folder
	--> configuration can have "config_id" = "root:*" so all root folder accessible by user are displayed in a TOC Folder
	--> configuration can have "config_id" = "root:owner" so all root folder directly owned by user "My Folders" are displayed in a TOC Folder

V3-1 (May 2014)
- added dynamic grid context menu logic
- added/improved related projects property on folder and Document/CAD (if folder connected to project, property is filled)

V3-0 (May 2014)

- Made compatible with Aras10 - IE and Firefox - (90% but still some minor issues)
- Reworked loading of folder tree with controlled items and files. Uses "RepeatItemConfig" action now, 
  which allows to load full structure with "released" or "current" effectivity condition at once
  at acceptable performance.
- Folder navigator javascript is more object oriented now (major rework) (cloned this from latest impact matrix grid)
- New common utiltiy "Common Grid Utilities" added - method "CommonBaseTreeGridFuncs"  (cloned and enhanced from BaseTreeGrid of standard PE)
- Loading of full structure will allow search feature in the future -- but not implemented, yet
- Needed separate toolbar xml for Aras10 and Aras9 (because of differnt icon paths)
- Some forms have html field with value set to "Aras9" or "Aras10" to drive conditional code of Folder Navigator Grid
- Code tree overlay has grid icons (.gif) from Aras9 added to GridIcons folder
- Added fields "related_projects" to Document, CAD, and Part item types.
- If folders used on Project or Program, then new logic will copy the keyed_name of project/program to new folder property "related_project_keyed_name"
  all sub folder will also inherit the value for "related_project_keyed_name" from their parent folder
  all controlled items added to a folder will get this project/program keyed_name copy to their property "related_projects"
    (if connected to more folders the different project/program names get listed in a comma separated list)
    on main grid documents can then be search for by "project name"

v2-1 (October 2013)
 - reduced server calls from Navigator grid to load folder related items (Files, Documents) -> 30% performance increase.
 - fixed loading of related items for root folder
 - added Owner column to Navigator grid

v2-0 (August 2013)
 - Remamed package name from "Item Folders" to "Collaboration Folders"

 - Common Grid handler (utiltities) improvements

 - Changed folder structure loading strategy:
    Loads single levels only.  if sub_folder_flag is "1" then adds a dummy folder (to be able to get openNode event)
    onOpenNode event next level is loaded and dummy folder is removed, if exists.

    This improves loading large structures considerably.

 - Added more context menu actions on folder grid (if top folder parent item is locked)
    - Add Sub Folder

 - Reworked messages while "Busy" for initial loading and expand all

 - Reworked status to show "rows in view: ##" - after loading and on expand an collapse.

 - Added i18n support for toolbar, menus and messages. (language files in: Client/Solutions/ItemFolders/xml)


v1-7  (June 2013)
- Improved Life-Cycle on "Item Folder"
  - Folders now start with state "Planning"
  - Promotion to "Active" or "Archived" can be done by folder's owner.
  - Separeate permission sets for "Planning", "Active" and "Archived" (can be updated to your oranization's groups to hide "Archived" folders for example)
  - Once Folder is in state "Archived" all relationships to "Files" and "Controlled Items" are "fixed" to their genaration at this time.
   
- Added actions to promote "Folders" to the "Folder Navigator Grid"
  - if current user is owner of top folder, then 2 more actions are presented:
     - Promote Folders to Active (down)   - promotes all folders from selected folder down to "Active"
     - Promote Folders to Archived (down) - promotes all folders from selected folder down to "Archived"

- Features of previous versions are described under "Version History" at the bottom of this ReadMe

- promotes all folders from selected folder down to "Active"

v1-6  (May 2013)
 - updated grid html and logic to adjust to Innovator 10 (TreeGridContainer)
 - made folder related item number show as link
 - Common Grid handler (utiltities) improvements
 - Added context menu actions on folder grid (if top folder parent item is locked)
    - lock, unlock
    - Add Folder Attachment
    - Add Folder Controlled Item

- Added phantom rows for grouping Attachments and Controlled Item
- Added drag and drop for one or more files onto Folder grid ('Folder rows', if locked)
- Added is_shared icon display for shared files on folder grid
- Added effectivity modes and filter drop down on folder grid ("current" and "latest released" view of controlled items)
- Folder Templates: Added null relationship to register method for auto numbers of folder controlled items (poly item)
- Copy form Folder Templates: Improved logic for "Reference" or "Copy" option on relationships to Controlled Items.
   - Files of documents are now physically copied in vault.
- Copy from Folder Templates: Attached files on template folders are physically copied to new folder in vault.

