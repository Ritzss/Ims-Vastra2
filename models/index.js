import mongoose, { Schema } from "mongoose";

// ========================
// EXISTING VASTRADROBE SCHEMAS (Read-only references)
// ========================

// Product Schema (Existing - DO NOT MODIFY STRUCTURE)
const ProductSchema = new mongoose.Schema(
  {
    productId: { type: Number, unique: true, index: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number },
    category: { type: String, required: true },
    subcategory: { type: String },
    variants: [
      {
        color: {
          type: String,
          required: true,
        },
        images: {
          type: [String],
          default: [],
        },
        sizes: {
          type: [String],
          default: [],
        },
        designs: [
          {
            design: {
              type: String,
              required: true,
            },

            images: {
              type: [String],
              default: [],
            },

            sizes: {
              type: [String],
              default: [],
            },

            sku: String,
            price: Number,
            mrp: Number,
          },
        ],
      },
    ],
    description: { type: String },

    // Optional fields that IMS can add without breaking VastraDrobe
    sku: { type: String },
    brand: { type: String },
    stock: { type: Number, default: 0 },
    isActive: {
      type: Boolean,
      default: true,
    },

    // 🔥 NEW FIELDS (Clean Extensions)

    sizeChartType: {
      type: String,
      enum: [
        "kidstopbottom",
        "kidsFleeceHoodie",
        "fullSleeveTop",
        "ribbedTop",
        "formalTopBottom",
        "generalTopBottom",
        "MensShirt",
        "MensKurta",
        "menBottom",
      ],
    },

    productDetails: {
      material: { type: String },
      closureType: { type: String },
      careInstructions: { type: String },
      style: { type: String },
      pattern: { type: String },
      countryOfOrigin: { type: String },
      manufacturer: { type: String },
      manufacturerContact: { type: String },
      packer: { type: String },
      packerContact: { type: String },
      unitCount: { type: String },
    },
  },
  { timestamps: true },
);

const OrderSchema = new mongoose.Schema(
  {
    // Customer
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Order Identifiers
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },

    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
    },

    // Ordered Products
    items: [
      {
        productId: {
          type: Number,
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        sku: String,

        color: String,

        size: {
          type: String,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        total: {
          type: Number,
          required: true,
        },

        image: [String],
      },
    ],

    // Delivery Address
    deliveryAddress: {
      name: String,

      email: String,

      phone: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      city: String,

      state: String,

      pincode: String,

      country: {
        type: String,
        default: "India",
      },
    },

    // Pricing
    subtotal: {
      type: Number,
      required: true,
    },

    shippingCharge: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    // Payment
    paymentMethod: {
      type: String,
      enum: ["COD", "Razorpay", "UPI", "Card", "Net Banking"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },

    payment: {
      provider: String,
      orderId: String,
      paymentId: String,
      signature: String,
    },

    // Order Status
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "packing",
        "shipping",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "return_requested",
        "return_approved",
        "return_rejected",
        "returned",
        "refund_initiated",
        "refunded",
      ],
      default: "pending",
    },

    // Cancellation
    cancelDetails: {
      isCancelled: {
        type: Boolean,
        default: false,
      },

      reason: String,

      customReason: String,

      cancelledBy: {
        type: Schema.Types.ObjectId,
        ref: "IMSAdminUser",
      },

      cancelledAt: Date,
    },

    // Return
    returnDetails: {
      requested: {
        type: Boolean,
        default: false,
      },

      approved: {
        type: Boolean,
        default: false,
      },

      rejected: {
        type: Boolean,
        default: false,
      },

      reason: String,

      rejectionReason: String,

      requestedAt: Date,

      approvedAt: Date,

      receivedAt: Date,

      approvedBy: {
        type: Schema.Types.ObjectId,
        ref: "IMSAdminUser",
      },
    },

    // Refund
    refund: {
      status: {
        type: String,
        enum: ["none", "pending", "initiated", "completed", "failed"],
        default: "none",
      },

      amount: Number,

      transactionId: String,

      reason: String,

      refundedBy: {
        type: Schema.Types.ObjectId,
        ref: "IMSAdminUser",
      },

      refundedAt: Date,
    },

    // Admin Notes
    adminNotes: [
      {
        note: {
          type: String,
          required: true,
        },

        addedBy: {
          type: Schema.Types.ObjectId,
          ref: "IMSAdminUser",
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Order Timeline
    history: [
      {
        action: String,

        status: String,

        description: String,

        performedBy: {
          type: Schema.Types.ObjectId,
          ref: "IMSAdminUser",
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Email Log
    emails: [
      {
        type: String,

        subject: String,

        recipient: String,

        status: {
          type: String,
          enum: ["success", "failed"],
        },

        sentAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Attachments (Return Images, Proof, etc.)
    attachments: [
      {
        type: String,

        url: String,

        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Invoice
    invoiceUrl: String,
  },
  {
    timestamps: true,
  },
);

// export default mongoose.models.Order || mongoose.model("Order", OrderSchema);

// Customer User Schema (Existing - Read-only)
const CustomerUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cart: [
      {
        productId: { type: Number, required: true },
        qty: { type: Number, required: true },
      },
    ],
    deliveryAddress: {
      address: String,
      phone: String,
    },
  },
  { timestamps: true },
);

// Counter Schema
const CounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
});

export const Counter =
  mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

const TransactionSchema = new Schema(
  {
    transactionNumber: {
      type: String,
      unique: true,
      required: true,
    },

    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    provider: {
      type: String,
      default: "razorpay",
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    subtotal: {
      type: Number,
      required: true,
    },

    shippingCharge: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentMethod: String,

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "paid",
    },

    invoiceNumber: String,

    invoiceUrl: String,

    currency: {
      type: String,
      default: "INR",
    },

    notes: String,
  },
  {
    timestamps: true,
  },
);

export const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
// ========================
// IMS-SPECIFIC SCHEMAS (New collections)
// ========================

// IMS Admin Users (Internal staff only)
const IMSAdminUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // bcrypt hashed
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "inventory_manager", "store_manager"],
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// IMS Warehouses
const IMSWarehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // e.g., "WH-DEL-01"
    location: { type: String, required: true },
    type: { type: String, enum: ["warehouse", "store"], default: "warehouse" },
    contactPerson: String,
    phone: String,
    address: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// IMS Inventory (Warehouse-wise, Size-wise stock)
const IMSInventorySchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      required: true,
      ref: "Product",
    },

    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IMSWarehouse",
      required: true,
    },

    variants: [
      {
        color: {
          type: String,
          required: true,
          trim: true,
        },

        // Products WITHOUT designs
        sizes: [
          {
            size: {
              type: String,
              required: true,
            },

            quantity: {
              type: Number,
              default: 0,
            },

            reorderLevel: {
              type: Number,
              default: 10,
            },

            reorderQuantity: {
              type: Number,
              default: 50,
            },
          },
        ],

        // Products WITH designs
        designs: [
          {
            design: {
              type: String,
              required: true,
            },

            sizes: [
              {
                size: {
                  type: String,
                  required: true,
                },

                quantity: {
                  type: Number,
                  default: 0,
                },

                reorderLevel: {
                  type: Number,
                  default: 10,
                },

                reorderQuantity: {
                  type: Number,
                  default: 50,
                },
              },
            ],
          },
        ],
      },
    ],

    totalQuantity: {
      type: Number,
      default: 0,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IMSAdminUser",
    },
  },
  {
    timestamps: true,
  },
);

IMSInventorySchema.index(
  {
    productId: 1,
    warehouseId: 1,
  },
  {
    unique: true,
  },
);

// IMS Stock Movements (Audit trail)
const IMSStockMovementSchema = new mongoose.Schema(
  {
    // Product
    productId: {
      type: Number,
      required: true,
      ref: "Product",
    },

    color: {
      type: String,
      required: true,
      trim: true,
    },

    design: {
      type: String,
      default: null,
      trim: true,
    },

    size: {
      type: String,
      required: true,
      trim: true,
    },

    // Warehouse
    fromWarehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IMSWarehouse",
      default: null,
    },

    toWarehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IMSWarehouse",
      default: null,
    },

    // Stock Change
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    previousQuantity: {
      type: Number,
      default: 0,
    },

    newQuantity: {
      type: Number,
      default: 0,
    },

    // Movement Type
    type: {
      type: String,
      enum: [
        "in",
        "out",
        "transfer",
        "sale",
        "return",
        "damaged",
        "adjustment",
      ],
      required: true,
    },

    reason: {
      type: String,
      trim: true,
    },

    referenceNumber: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    // Audit
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IMSAdminUser",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Useful indexes
IMSStockMovementSchema.index({
  productId: 1,
  color: 1,
  size: 1,
});

IMSStockMovementSchema.index({
  type: 1,
  createdAt: -1,
});

IMSStockMovementSchema.index({
  referenceNumber: 1,
});

// IMS Activity Logs
const IMSActivityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "IMSAdminUser",
  },
  action: { type: String, required: true }, // 'create', 'update', 'delete'
  entityType: { type: String, required: true }, // 'product', 'inventory', etc.
  entityId: { type: String, required: true },
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  timestamp: { type: Date, default: Date.now },
});

// ========================
// MODEL EXPORTS
// ========================

// Existing VastraDrobe models (read/write carefully)
export const Product =
  mongoose.models.Product ||
  mongoose.model("Product", ProductSchema, "products");
export const Orders =
  mongoose.models.Orders || mongoose.model("Orders", OrderSchema, "orders");
export const CustomerUser =
  mongoose.models.CustomerUser ||
  mongoose.model("CustomerUser", CustomerUserSchema, "users");

// IMS-specific models (new collections)
export const IMSAdminUser =
  mongoose.models.IMSAdminUser ||
  mongoose.model("IMSAdminUser", IMSAdminUserSchema, "ims_admin_users");
export const IMSWarehouse =
  mongoose.models.IMSWarehouse ||
  mongoose.model("IMSWarehouse", IMSWarehouseSchema, "ims_warehouses");
export const IMSInventory =
  mongoose.models.IMSInventory ||
  mongoose.model("IMSInventory", IMSInventorySchema, "ims_inventory");
export const IMSStockMovement =
  mongoose.models.IMSStockMovement ||
  mongoose.model(
    "IMSStockMovement",
    IMSStockMovementSchema,
    "ims_stock_movements",
  );
export const IMSActivityLog =
  mongoose.models.IMSActivityLog ||
  mongoose.model("IMSActivityLog", IMSActivityLogSchema, "ims_activity_logs");
