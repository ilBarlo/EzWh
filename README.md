# EzWh
EzWh project for Web Applications I - PoliTo

EZWH is a software application to:

- manage suppliers and restock orders;
- manage the reception of ordered items;
- manage internal orders and deliveries.

A warehouse stores physical items, in a dedicated space (could be several hundred square meters of surface, on 10-15 meters height). Each item is described by an SKU (Stock Keeping Unit). An SKU corresponds to a product descriptor in UML patterns seen at lesson, and has a unique ID. The ID is specific to the company that manages the warehouse.  The item (we will call it SKUitem in the following) is an instance described by an SKU, and is identified by a unique ID, written inside an RFID label physically attached to the SKUitem. This assures that each item can be traced throughout its lifecycle in the warehouse, and later.
The physical space of the warehouse is organized in aisles. An aisle has a unique ID, and corresponds to a parallelepiped structure (usally made of a metallic frame). The aisle is further organised in rows and columns. A position (identified by aisle, row, column) corresponds to a smaller parallelepiped. A position will store a number of SKUitems of one SKU only.  The dimension of the parallelepiped depends on the size of SKUitems that will be stored in it. Clearly there is a limit to the number of SKUitems that can be stored in a position, depending on the volume of the SKUitem and of the position. Further, there is a also constraint coming from the weight of SKUitems, and the weight that the metallic structure can support.
The basic information to be managed by an application to support a WH is the association SKUitem - position, answering to the question, where is an SKUitem?
The two operations related to this are store an SKUitem in a position, collect an SKUitem from a position.
A prerequisite to this is to decide where an SKU will be stored, so allocating one (or more than one) positions to an SKU.
Besides, there is a wider flow to be considered. SKUitems come from external suppliers, and are requested by internal customers. Internal customers are roles within the company who need one or more SKUitems (ex internal customer could be the factory that assembles SKU items to produce a certain product). The application supports this flow with restock orders and internal orders.
A manager (or a similar role inside the company, ex purchase office) places a restock order to a supplier, ordering a certain number of SKUitems. The supplier will send them, the warehouse will receive the parcel (ex with a truck, after days or weeks). At reception a clerk has to check that the items received correspond to a restock order, and if yes accepts them. This check is done using the transport note. A transport note is a document issued by the supplier, that describes what is shipped in a parcel, mentioning the restock order number. If the check is ok the items are received, and each of them is tagged with an RFID.
A certain SKU can be provided by many suppliers. For doing a restock order the manager has to select one supplier (this selection is not supported by the application but is a decision taken by the manager). However, a certain SKU has, in general, a different ID for each supplier. So the correspondence between the internal ID of an SKU, and the ID for each supplier must be managed. In fact the restock order must mention the id of the SKU as given by the supplier.
Items are not immediately stored in the WH after they are received. Beforehand they must undergo a quality check. A quality employee performs one or more quality tests, on some or all of the SKUitems received with a restock order. The list of tests to be executed on an SKU has to be defined upfront, and similarly for the acceptance policy (which tests must or should be passed). SKUitems that do not pass one or more tests are returned to the supplier, defining  a return order to the supplier. SKU items that pass the tests are stored in the WH.
An item is collected by the WH after an internal order is received. An internal order (similarly to a restock order) refers to one or more items belonging to one or more SKUs. The internal order refers to SKUs, using SKUs ids. A clerk receives the internal order, and collects the requested items. Items should be collected FIFO, to avoid that some items 'age' more than others. After physical collection of the items the application records they are not anymore in the Wh and releases the place they were occupying.
