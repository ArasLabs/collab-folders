--------------------------------------------
Packages Import Instructions
--------------------------------------------
Author:
  Rolf Laudenbach (rlaudenbach@aras.com)


Version:
--------

v2-1 (October 2013)
 - reduced server calls from Navigator grid to load folder related items (Files, Documents) -> 30% performance increase.
 - fixed loading of related items for root folder
 - added Owner column to Navigator grid


=========================
Installation Instructions
=========================

NOTE: If you already have a previous version of "Item Folders" or "Collaboration Folders" installed, then you MUST run installation Stage0 and Stage7 !!!
      If you install collaboration Folders the first time. DO NOT run Stage0 and start with Stage1 and skip Stage7 !!!

--------------------------------------------
Stage - 0  Updates Flags existing Folders Items 

--> Nash update
--> you only need this if a previous version of Item Folders is in use in your DB !!!


- use text editor and open file 
      .\0-nash update\Remove PackageDefinitions (Item Folders).xml

  Select all and paste to Nash input box "XML"

  then, click submit button

- use text editor and open file --> you only need this if you have a package "PLM Common Utilities" in your DB. Else it will fail, which is ok.
      .\0-nash update\Rename PackageDefinitions (Common Utilties).xml

  Select all and paste to Nash input box "XML"

  then, click submit button  (Error 'Common Utilities' already exists may occur. This is OK. rename was done before)


  done. Close the Nash tool


--> Use the Aras import utiltity tool "import.exe" log on as "admin"

  Select Mainfest file from folder .\0-xItemFolder LifeCycle correction\imports (admin).mf and set option "Merge"

  then, click the "import" button on top tool bar


--------------------------------------------
Stage - 1 Import subset of "Common Utilities"

--> Use the Aras import utiltity tool "import.exe" log on as "admin"


Select Mainfest file from folder .\1-Common Utilties v1-9 (partial)\imports.mf and set option "Merge"

then, click the "import" button on top tool bar


--------------------------------------------
Stage - 2  Import extensions to core and PLM item types

--> Use the Aras import utiltity tool "import.exe" log on as "admin"


Select Mainfest file from folder .\2-Innovator Core and PLM extensions\imports (admin).mf and set option "Merge"

then, click the "import" button on top tool bar


--------------------------------------------
Stage - 3  Import next parts of Collaboration Folder add-on

--> Use the Aras import utiltity tool "import.exe" log on as "admin"

Select Mainfest file from folder .\3-Collaboration Folders\imports (admin).mf and set option "Merge"

then, click the "import" button on top tool bar


--------------------------------------------
Stage - 4  Import final parts of Collaboration Folder add-on

--> Use the Aras import utiltity tool "import.exe" log on as "admin"

Select Mainfest file from folder .\4-Collaboration Folders\imports (admin).mf and set option "Merge"

then, click the "import" button on top tool bar


--------------------------------------------
Stage - 5  Adds Folder Features to standard Program ItemType

--> Use the Aras import utiltity tool "import.exe" log on as "admin"


Select Mainfest file from folder .\5-Folders On Program And Project\1_Add Folder To Program\imports (admin).mf and set option "Merge"
then, click the "import" button on top tool bar

Select Mainfest file from folder .\5-Folders On Program And Project\2_Add Folder To Project\imports (admin).mf and set option "Merge"
then, click the "import" button on top tool bar


------------------------------------------------------------------------------------------------------
Stage - 6 Copy code tree overlay files to the code tree of the the target Aras System

- open folder "_CodeTreeOverlays" and select "innovator" and copy this folder
- on the target Aras System go to the installation folders and paste the copy over the "innovator" folder
- confirm to add or overwrite folders and files.

- additional grid icons and language xml files are added.


--------------------------------------------
Stage - 7  Updates Flags existing Folders Items 

--> Nash update
--> you only need this if a previous version of Item Folders is in use and there are existing folder structres in your DB

start Nash.aspx tool on the target Aras System and log on as "admin"
(the url to nash.aspy tool could be like this: http://localhost/InnovatorServer/Client/scripts/nash.aspx )

- use text editor and open file 
      .\7-nash update\UpdateFlagsOnExistigFolderItems.xml

  Select all and paste to Nash input box "XML"

  then, click submit button

  done. Close the Nash tool


------------------------------------------------------------------------------------------------------
Stage - 8 (Optional) SetPackage version - Will fail, if you do not have the Package Utiltities v1-4 or higher loaded !!!



================
Version History:
================

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
- Copy form Folder Templates: Improved logic for "Reference" or "Copy" option on relatinships to Controlled Items.
   - Files of documents are now physically copied in vault.
- Copy from Folder Templates: Attached files on template folders are physically copied to new folder in vault.

