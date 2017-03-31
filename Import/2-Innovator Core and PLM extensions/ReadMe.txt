Core Extensions:
---------------

ItemType: "Team"  new properties:
- private_team_item_id_string
- Allowed Permission: cFolder Private Team Update


PLM Extensions
---------------

ItemType: "Document"  new properties:
- allow_team_change_logic
- has_files_icon

ItemType: "Document"  new Server Events:
-onBeforeGet: Select Doc Grid Icon Props
-onAfterGet: Show Doc Grid Icons

ItemType: "Part" new properties:
- allow_team_change_logic


Modified Permissions:
-New Document
-In Review Document
-Released Document
-New Part
-In Review Part
-Released Part