-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 20,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Inventory_userId_guildId_fkey" FOREIGN KEY ("userId", "guildId") REFERENCES "User" ("userId", "guildId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inventoryId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemRarity" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "durability" INTEGER,
    "maxDurability" INTEGER,
    "enchantments" TEXT,
    "customData" TEXT,
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,
    "equippedSlot" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryItem_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemRarity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "baseValue" INTEGER NOT NULL DEFAULT 0,
    "maxStack" INTEGER NOT NULL DEFAULT 1,
    "maxDurability" INTEGER,
    "baseStats" TEXT,
    "effects" TEXT,
    "requirements" TEXT,
    "isTradeable" BOOLEAN NOT NULL DEFAULT true,
    "isDroppable" BOOLEAN NOT NULL DEFAULT true,
    "isConsumable" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Inventory_userId_guildId_idx" ON "Inventory"("userId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_userId_guildId_key" ON "Inventory"("userId", "guildId");

-- CreateIndex
CREATE INDEX "InventoryItem_inventoryId_idx" ON "InventoryItem"("inventoryId");

-- CreateIndex
CREATE INDEX "InventoryItem_itemId_idx" ON "InventoryItem"("itemId");

-- CreateIndex
CREATE INDEX "InventoryItem_itemType_idx" ON "InventoryItem"("itemType");

-- CreateIndex
CREATE INDEX "InventoryItem_itemRarity_idx" ON "InventoryItem"("itemRarity");

-- CreateIndex
CREATE INDEX "InventoryItem_isEquipped_idx" ON "InventoryItem"("isEquipped");

-- CreateIndex
CREATE UNIQUE INDEX "ItemTemplate_itemId_key" ON "ItemTemplate"("itemId");

-- CreateIndex
CREATE INDEX "ItemTemplate_itemId_idx" ON "ItemTemplate"("itemId");

-- CreateIndex
CREATE INDEX "ItemTemplate_itemType_idx" ON "ItemTemplate"("itemType");

-- CreateIndex
CREATE INDEX "ItemTemplate_itemRarity_idx" ON "ItemTemplate"("itemRarity");

-- CreateIndex
CREATE INDEX "ItemTemplate_category_idx" ON "ItemTemplate"("category");
