// -------------------------------------------
// Product Helpers
// -------------------------------------------

export function getProductVariant(product, color) {
  return product.variants.find(
    (variant) =>
      variant.color.toLowerCase() === color.toLowerCase(),
  );
}

export function hasDesign(productVariant) {
  return (
    productVariant &&
    Array.isArray(productVariant.designs) &&
    productVariant.designs.length > 0
  );
}

// -------------------------------------------
// Inventory Helpers
// -------------------------------------------

export function getInventoryVariant(inventory, color) {
  let variant = inventory.variants.find(
    (v) => v.color.toLowerCase() === color.toLowerCase(),
  );

  if (!variant) {
    inventory.variants.push({
      color,
      sizes: [],
      designs: [],
    });

    variant = inventory.variants[inventory.variants.length - 1];
  }

  return variant;
}

export function getDesign(variant, design) {
  let designNode = variant.designs.find(
    (d) => d.design.toLowerCase() === design.toLowerCase(),
  );

  if (!designNode) {
    variant.designs.push({
      design,
      sizes: [],
    });

    designNode =
      variant.designs[variant.designs.length - 1];
  }

  return designNode;
}

export function getSize(parent, size) {
  let sizeNode = parent.sizes.find(
    (s) => s.size.toLowerCase() === size.toLowerCase(),
  );

  if (!sizeNode) {
    parent.sizes.push({
      size,
      quantity: 0,
      reorderLevel: 10,
      reorderQuantity: 50,
    });

    sizeNode = parent.sizes[parent.sizes.length - 1];
  }

  return sizeNode;
}

// -------------------------------------------
// Quantity Helpers
// -------------------------------------------

export function calculateTotalQuantity(inventory) {
  let total = 0;

  for (const variant of inventory.variants) {
    // Product with Designs
    if (
      variant.designs &&
      variant.designs.length > 0
    ) {
      for (const design of variant.designs) {
        total += design.sizes.reduce(
          (sum, size) => sum + size.quantity,
          0,
        );
      }
    }

    // Product without Designs
    else {
      total += variant.sizes.reduce(
        (sum, size) => sum + size.quantity,
        0,
      );
    }
  }

  return total;
}

// -------------------------------------------
// Stock Validation
// -------------------------------------------

export function validateStock(sizeNode, quantity) {
  if (!sizeNode) {
    throw new Error("Size not found.");
  }

  if (sizeNode.quantity < quantity) {
    throw new Error(
      `Insufficient stock. Available: ${sizeNode.quantity}`,
    );
  }
}