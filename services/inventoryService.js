import mongoose from "mongoose";
import { IMSInventory, IMSStockMovement, Product } from "../models/index.js";
import {
  getProductVariant,
  hasDesign,
  getInventoryVariant,
  getDesign,
  getSize,
  calculateTotalQuantity,
  validateStock,
} from "@/lib/inventoryHelpers";

/**
 * Inventory Service with Transaction Support
 * Prevents overselling and ensures data consistency
 */

// Get all inventory for a product across warehouses
export async function getInventory(productId, warehouseId) {
  return IMSInventory.findOne({
    productId,
    warehouseId,
  });
}

export async function getProductInventory(productId) {
  return IMSInventory.find({
    productId,
  })
    .populate("warehouseId")
    .lean();
}

export function findVariant(inventory, color) {
  return inventory.variants.find(
    (v) => v.color.toLowerCase() === color.toLowerCase(),
  );
}

export function findDesign(variant, design) {
  return variant.designs.find(
    (d) => d.design.toLowerCase() === design.toLowerCase(),
  );
}

export function findSize(parent, size) {
  return parent.sizes.find((s) => s.size.toLowerCase() === size.toLowerCase());
}

//

// Add stock (IN operation)
export async function addStock(
  productId,
  warehouseId,
  color,
  design,
  size,
  quantity,
  userId,
  reason = "",
  referenceNumber = "",
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const node = await getInventoryNode(
      session,
      productId,
      warehouseId,
      color,
      design,
      size,
      true,
    );

    const previousQuantity = node.sizeNode.quantity;

    node.sizeNode.quantity += quantity;

    node.inventory.totalQuantity = calculateTotalQuantity(node.inventory);

    node.inventory.updatedBy = userId;

    node.inventory.lastUpdated = new Date();

    node.inventory.markModified("variants");

    await node.inventory.save({
      session,
    });

    await IMSStockMovement.create(
      [
        {
          productId,

          color,

          design: node.hasDesigns ? design : null,

          size,

          toWarehouseId: warehouseId,

          quantity,

          previousQuantity,

          newQuantity: node.sizeNode.quantity,

          type: "in",

          reason,

          referenceNumber,

          performedBy: userId,
        },
      ],
      {
        session,
      },
    );

    await updateProductTotalStock(productId, session);

    await session.commitTransaction();

    return node.inventory;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export async function removeStock(
  productId,
  warehouseId,
  color,
  design,
  size,
  quantity,
  userId,
  reason = "",
  referenceNumber = "",
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const node = await getInventoryNode(
      session,
      productId,
      warehouseId,
      color,
      design,
      size,
      false,
    );

    validateStock(node.sizeNode, quantity);

    const previousQuantity = node.sizeNode.quantity;

    node.sizeNode.quantity -= quantity;

    node.inventory.totalQuantity = calculateTotalQuantity(node.inventory);

    node.inventory.lastUpdated = new Date();

    node.inventory.updatedBy = userId;

    await node.inventory.save({
      session,
    });

    await IMSStockMovement.create(
      [
        {
          productId,

          color,

          design: node.hasDesigns ? design : null,

          size,

          fromWarehouseId: warehouseId,

          quantity,

          previousQuantity,

          newQuantity: node.sizeNode.quantity,

          type: "out",

          reason,

          referenceNumber,

          performedBy: userId,
        },
      ],
      {
        session,
      },
    );

    await updateProductTotalStock(productId, session);

    await session.commitTransaction();

    return node.inventory;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}
// Transfer stock between warehouses
export async function transferStock(
  productId,
  fromWarehouseId,
  toWarehouseId,
  color,
  design,
  size,
  quantity,
  userId,
  reason = "",
  referenceNumber = "",
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Source Warehouse
    const source = await getInventoryNode(
      session,
      productId,
      fromWarehouseId,
      color,
      design,
      size,
      false,
    );

    // Destination Warehouse
    const destination = await getInventoryNode(
      session,
      productId,
      toWarehouseId,
      color,
      design,
      size,
      true,
    );

    // Validate stock
    validateStock(source.sizeNode, quantity);

    const sourcePrevious = source.sizeNode.quantity;
    const destinationPrevious = destination.sizeNode.quantity;

    // Transfer
    source.sizeNode.quantity -= quantity;
    destination.sizeNode.quantity += quantity;

    source.inventory.totalQuantity = calculateTotalQuantity(source.inventory);

    destination.inventory.totalQuantity = calculateTotalQuantity(
      destination.inventory,
    );

    source.inventory.updatedBy = userId;
    destination.inventory.updatedBy = userId;

    source.inventory.lastUpdated = new Date();
    destination.inventory.lastUpdated = new Date();

    await source.inventory.save({ session });
    await destination.inventory.save({ session });

    await IMSStockMovement.create(
      [
        {
          productId,

          color,

          design: source.hasDesigns ? design : null,

          size,

          fromWarehouseId,
          toWarehouseId,

          quantity,

          previousQuantity: sourcePrevious,
          newQuantity: source.sizeNode.quantity,

          type: "transfer",

          reason,
          referenceNumber,

          performedBy: userId,
        },
      ],
      {
        session,
      },
    );

    await updateProductTotalStock(productId, session);

    await session.commitTransaction();

    return {
      success: true,
      sourceInventory: source.inventory,
      destinationInventory: destination.inventory,
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

// Record sale (deducts stock and logs as sale)
export async function recordSale(
  productId,
  warehouseId,
  color,
  design,
  size,
  quantity,
  userId,
  orderNumber,
) {
  return removeStock(
    productId,
    warehouseId,
    color,
    design,
    size,
    quantity,
    userId,
    "Sale",
    orderNumber,
  );
}

// Record return (adds stock back)
export async function recordReturn(
  productId,
  warehouseId,
  color,
  design,
  size,
  quantity,
  userId,
  orderNumber,
) {
  return addStock(
    productId,
    warehouseId,
    color,
    design,
    size,
    quantity,
    userId,
    "Customer Return",
    orderNumber,
  );
}

// Update denormalized total stock in products collection
async function updateProductTotalStock(productId, session = null) {
  const inventories = await IMSInventory.find({
    productId,
  }).session(session);

  let total = 0;

  for (const inventory of inventories) {
    total += calculateTotalQuantity(inventory);
  }

  await Product.updateOne(
    {
      productId,
    },
    {
      $set: {
        stock: total,
      },
    },
    {
      session,
    },
  );
}

// Get low stock items
export async function getLowStockItems() {
  const inventories = await IMSInventory.find().populate("warehouseId").lean();

  const lowStock = [];

  for (const inventory of inventories) {
    for (const variant of inventory.variants) {
      for (const size of variant.sizes) {
        if (size.quantity <= size.reorderLevel) {
          lowStock.push({
            productId: inventory.productId,
            warehouse: inventory.warehouseId,
            color: variant.color,
            size: size.size,
            quantity: size.quantity,
            reorderLevel: size.reorderLevel,
            reorderQuantity: size.reorderQuantity,
          });
        }
      }
    }
  }

  return lowStock;
}

// Get stock movements with filters
// Build the MongoDB query from the movement filters.
// Keeping this in one place ensures the list and count queries
// always use exactly the same filters.
async function buildStockMovementQuery(filters = {}) {
  const query = {};
  const andConditions = [];

  if (filters.productId) {
    query.productId = filters.productId;
  }

  if (filters.color) {
    query.color = filters.color;
  }

  if (filters.size) {
    query.size = filters.size;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  // Warehouse filter
  if (filters.warehouseId) {
    andConditions.push({
      $or: [
        { fromWarehouseId: filters.warehouseId },
        { toWarehouseId: filters.warehouseId },
      ],
    });
  }

  // Date filter
  if (filters.startDate && filters.endDate) {
    query.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  }

  // Search filter
  if (filters.search) {
    const search = filters.search.trim();

    const searchRegex = {
      $regex: search,
      $options: "i",
    };

    // If the search is a number, allow exact Product ID matching.
    const numericProductId = Number(search);

    let productIdMatches = [];

    if (Number.isInteger(numericProductId)) {
      productIdMatches.push(numericProductId);
    }

    // Search Product collection for product names.
    const matchingProducts = await Product.find({
      name: searchRegex,
    })
      .select("productId")
      .lean();

    productIdMatches.push(
      ...matchingProducts.map(
        (product) => product.productId,
      ),
    );

    // Remove duplicate product IDs.
    productIdMatches = [
      ...new Set(productIdMatches),
    ];

    andConditions.push({
      $or: [
        // Product name / Product ID
        ...(productIdMatches.length > 0
          ? [
              {
                productId: {
                  $in: productIdMatches,
                },
              },
            ]
          : []),

        // Movement details
        { color: searchRegex },
        { design: searchRegex },
        { size: searchRegex },
        { reason: searchRegex },
        { referenceNumber: searchRegex },
        { notes: searchRegex },
      ],
    });
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  return query;
}

// Get paginated stock movements with filters.
export async function getStockMovements(
  filters = {},
  limit = 50,
  skip = 0,
) {
  const query = await buildStockMovementQuery(filters);

  return IMSStockMovement.find(query)
    .populate("fromWarehouseId")
    .populate("toWarehouseId")
    .populate("performedBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

// Get total number of movements matching the filters.
// This intentionally does not apply skip/limit because the frontend
// needs the complete count to calculate the number of pages.
export async function getStockMovementsCount(filters = {}) {
  const query = await buildStockMovementQuery(filters);

  return IMSStockMovement.countDocuments(query);
}

async function getInventoryNode(
  session,
  productId,
  warehouseId,
  color,
  design,
  size,
  createIfMissing = false,
) {
  const product = await Product.findOne({
    productId,
  }).session(session);

  if (!product) {
    throw new Error("Product not found.");
  }

  let inventory = await IMSInventory.findOne({
    productId,
    warehouseId,
  }).session(session);

  if (!inventory) {
    if (!createIfMissing) {
      throw new Error("Inventory not found.");
    }

    inventory = new IMSInventory({
      productId,
      warehouseId,
      variants: [],
    });
  }

  const productVariant = getProductVariant(product, color);

  if (!productVariant) {
    throw new Error("Color not found.");
  }

  const variant = getInventoryVariant(inventory, color);

  let sizeNode;
  let designNode = null;

  if (hasDesign(productVariant)) {
    designNode = getDesign(variant, design);

    sizeNode = getSize(designNode, size);
  } else {
    sizeNode = getSize(variant, size);
  }

  return {
    inventory,
    product,
    productVariant,
    variant,
    designNode,
    sizeNode,
    hasDesigns: hasDesign(productVariant),
  };
}
