-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "productname" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
