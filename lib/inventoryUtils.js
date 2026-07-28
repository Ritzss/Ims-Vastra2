export function calculateTotalQuantity(inventory) {
  let total = 0;

  for (const variant of inventory.variants) {
    // Product without designs
    if (!variant.designs || variant.designs.length === 0) {
      total += variant.sizes.reduce(
        (sum, size) => sum + size.quantity,
        0,
      );
    }

    // Product with designs
    else {
      for (const design of variant.designs) {
        total += design.sizes.reduce(
          (sum, size) => sum + size.quantity,
          0,
        );
      }
    }
  }

  return total;
}