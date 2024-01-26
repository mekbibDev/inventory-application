const Category = require("../model/category");
async function addGadgetToCategories(categoryIds, gadgetId) {
  for await (const categoryId of categoryIds) {
    const {
      gadgets: [...gadgetIds],
    } = await Category.findById(categoryId, "gadgets");
    const gadgetIdStrings = gadgetIds.map((gadgetId) => gadgetId.toString());
    if (!gadgetIdStrings.includes(gadgetId.toString())) {
      gadgetIds.push(gadgetId);
      await Category.findByIdAndUpdate(categoryId, { gadgets: gadgetIds });
    }
  }
}

async function removeGadgetFromCategories(
  gadget,
  categoryIds,
  gadgetId,
  deletedCategoryId,
) {
  for (const categoryId of gadget.categories) {
    if (deletedCategoryId && categoryId.toString() === deletedCategoryId)
      continue;
    if (!categoryIds.includes(categoryId.toString())) {
      let {
        gadgets: [...gadgetIds],
      } = await Category.findById(categoryId, "gadgets");
      const filteredGadgetIds = gadgetIds.filter(
        (gadgetRef) => gadgetRef.toString() !== gadgetId,
      );
      gadgetIds = filteredGadgetIds;
      await Category.findByIdAndUpdate(categoryId, { gadgets: gadgetIds });
    }
  }
}

module.exports = { removeGadgetFromCategories, addGadgetToCategories };
