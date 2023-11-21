Inventory management system

Group: 50

Name:

Kwan Siu Chiu

Lee Wai Yip

Chu Yin Hang

Li Kai Ip


Application link: https://comps381f-project-yb5a.onrender.com

********************************************
# Login
Each user can access the inventory management system with their personal account.
The accounts are as follows:

[
	{userid: bryan, password: 1234},
	{userid: sam, password: 1234},
	{userid: ryan, password: 1234},
	{userid: eric, password: 1234}
]

After successful login, userid is stored in cookie seesion.

********************************************
# Logout
In any page, user can logout their account by clicking logout button on the upper right corner.

********************************************
# CRUD service
- Create
  
	A item document contains the following attributes, and an example is created already: 
	1)	Item ID (C309)
	2)	Item Name (Sprite)
	3)	Type (beverage)
	4)	Quantity (20)
	5)	Owner ID (bryan)

All attributes requires user input. Except owner id, it is automatically inserted by getting the current session user id.

Create operation is using post request, and all information is in body of request.

********************************************
# CRUD service
- Read

  There are two options, to read view all items or search by restaurant item ID, item name or type.

1) List all items
	By clicking list item on the navigation bar, user will be directed to display.ejs and all item details will be displayed.

2) Searching by selected criteria and input value
	By clicking search item on the navigation bar, you will be directed to searchitem.ejs and a form will be shown.
	User may select the search criteria, by item ID, item name or type.
	Both criteria and input value must match in order to get the item information.
	Else, no item will be shown in the list.

********************************************
# CRUD service
- Update

	The user can choose to update the target item information by clicking the corresponding edit button in the inventory table.

	Only item name, type and quantity can be updated. 

	For testing, user may either create an new item (Item ID:C310, Item name:Cola, Type:beverage, Quantity:10),

	Or select the example provided above in the item list.

********************************************
# CRUD service
- Delete

	The user can remove an item by clicking the corresponding delete button on the list.

	Only the owner of the item can remove the items that they created.

	Other users deleting items which do not belong to them will be denied.

********************************************
# Restful
In this project, there are three HTTP request types, post, get and delete.
- Post

	Post request is used for insert and update item.

	*Insert item
  
	Path URL: /api/insert

	Test: curl -X POST -H "Content-Type: application/json" -d '{"itemID": "C313", "itemname": "chocolate", "type": "snacks", "quantity":"7", "ownerID":"sam"}' http://localhost:8099/api/insert

	*Update item
  
  	Path URL: /api/update
  
  	Test: curl -X POST -H "Content-Type: application/json" -d '{"itemID":"C313","itemname": "chocolate-bar", "type": "snacks", "quantity":"15"}' http://localhost:8099/api/update

- Get

	Get request is used for searching the item.

	Path URL: /api/search/:itemID

	Test: curl -X GET localhost:8099/api/search/:C311

- Delete

	Delete request is used for deletion.

	Path URL: /api/delete/:_id/:ownerID

	Test: curl -X DELETE localhost:8099/api/delete/:655c324fd9b87347d5b9b557/:ryan

