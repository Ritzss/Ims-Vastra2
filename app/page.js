"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  Boxes,
  ChevronDown,
  Download,
  FileText,
  PackageSearch,
  PackageX,
  RefreshCcw,
  RefreshCw,
  ShoppingBag,
  X,
} from "lucide-react";
import {
  MoreHorizontal,
  Package,
  Truck,
  Bike,
  CheckCircle2,
  Wallet,
  Ban,
  RotateCcw,
  IndianRupee,
  Mail,
  History,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Warehouse,
  ArrowLeftRight,
  ShoppingCart,
  BarChart3,
  Users,
  LogOut,
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Edit,
  Pencil,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

const API_BASE = "/api/ims";

export default function VastraDrobeIMS() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [inventorySearch, setInventorySearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelNote, setCancelNote] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineOrder, setTimelineOrder] = useState(null);

  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Dashboard state
  const [dashboardStats, setDashboardStats] = useState(null);

  // Products state
  const [productPage, setProductPage] = useState(1);
  const [productLimit] = useState(10);
  const [productTotal, setProductTotal] = useState(0);
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    color: "",
    design: "",
    brand: "",
    price: 0,
    mrp: 0,
    sizes: "",
    images: [],
    sizeChartType: "",
    productDetails: {
      material: "",
      closureType: "",
      careInstructions: "",
      style: "",
      pattern: "",
      countryOfOrigin: "",
      manufacturer: "",
      manufacturerContact: "",
      packer: "",
      packerContact: "",
      unitCount: "",
    },
  });
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);

  const STATUS_COLORS = {
    pending: "secondary",
    paid: "default",
    packing: "warning",
    shipping: "outline",
    delivered: "success",
  };

  const STATUS_LABELS = {
    pending: "Pending",
    paid: "Paid",
    packing: "Packing",
    shipping: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    returned: "Returned",
    refunded: "Refunded",
  };

  // Variants state
  // const [variants, setVariants] = useState([]);
  // const [variantForm, setVariantForm] = useState({
  //   id: "",
  //   productId: "",
  //   sku: "",
  //   barcode: "",
  //   size: "",
  //   color: "",
  //   additionalPrice: 0,
  // });
  // const [showVariantDialog, setShowVariantDialog] = useState(false);
  // const [isEditingVariant, setIsEditingVariant] = useState(false);

  // Warehouses state
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseForm, setWarehouseForm] = useState({
    id: "",
    name: "",
    location: "",
    type: "warehouse",
    contactPerson: "",
    phone: "",
    address: "",
  });
  const [showWarehouseDialog, setShowWarehouseDialog] = useState(false);
  const [isEditingWarehouse, setIsEditingWarehouse] = useState(false);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    type: "men",
    parentCategory: "",
  });

  // Inventory state
  const [inventory, setInventory] = useState([]);
  const [inventoryFilter, setInventoryFilter] = useState("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [showEditInventoryDialog, setShowEditInventoryDialog] = useState(false);
  // const [selectedInventorySizes, setSelectedInventorySizes] = useState({});
  const [inventorySelections, setInventorySelections] = useState({});
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryLimit] = useState(10);
  const [inventoryTotal, setInventoryTotal] = useState(0);
  const [editInventoryForm, setEditInventoryForm] = useState({
    inventoryId: "",
    color: "",
    design: "",
    size: "",
    quantity: 0,
    reorderLevel: 10,
    reorderQuantity: 50,
  });

  // Add Inventory state
  const [showAddInventoryDialog, setShowAddInventoryDialog] = useState(false);
  const [addInventoryForm, setAddInventoryForm] = useState({
    productId: "",
    warehouseId: "",
    color: "",
    design: "",
    size: "",
    quantity: 0,
    reorderLevel: 10,
    reorderQuantity: 50,
    reason: "",
  });

  // Stock Movements state
  const [stockMovements, setStockMovements] = useState([]);
  const [movementPage, setMovementPage] = useState(1);
  const [movementLimit] = useState(20);
  const [movementTotal, setMovementTotal] = useState(0);
  const [movementSearch, setMovementSearch] = useState("");
  const [movementTypeFilter, setMovementTypeFilter] = useState("all");
  const [movementWarehouseFilter, setMovementWarehouseFilter] = useState("all");
  const [movementForm, setMovementForm] = useState({
    productId: "",
    color: "",
    design: "",
    size: "",
    quantity: 0,
    type: "in",
    fromWarehouseId: "",
    toWarehouseId: "",
    reason: "",
    referenceNumber: "",
    notes: "",
  });
  const [showMovementDialog, setShowMovementDialog] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [orderPage, setOrderPage] = useState(1);
  const [orderLimit] = useState(10);
  const [orderTotal, setOrderTotal] = useState(0);
  const [openOrderItems, setOpenOrderItems] = useState(null);
  const [orderSearch, setOrderSearch] = useState("");
const [orderStatusFilter, setOrderStatusFilter] =
  useState("all");
const [orderPaymentFilter, setOrderPaymentFilter] =
  useState("all");
  const [orderForm, setOrderForm] = useState({
    orderNumber: "",
    items: [],
    totalAmount: 0,
    warehouseId: "",
  });

  // Users state
  const [users, setUsers] = useState([]);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addingUser, setAddingUser] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "inventory_manager",
  });

  // Activity logs
  const [activityLogs, setActivityLogs] = useState([]);
  const [logPage, setLogPage] = useState(1);
  const [logLimit] = useState(10);
  const [logTotal, setLogTotal] = useState(0);

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  const apiCall = async (endpoint, method = "GET", body) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    };

    const response = await fetch(`${API_BASE}${endpoint}`, options);

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "API request failed");
    }

    return data;
  };

  // Auth functions
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await apiCall("/auth/login", "POST", { email, password });
      setToken(data.token);
      setCurrentUser(data.user);
      setIsLoggedIn(true);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Login successful!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
  };

  const openCancelDialog = (order) => {
    setSelectedOrder(order);
    setCancelDialogOpen(true);
  };

  const openReturnDialog = (order) => {
    setSelectedOrder(order);
    setReturnDialogOpen(true);
  };

  const openRefundDialog = (order) => {
    setSelectedOrder(order);
    setRefundDialogOpen(true);
  };

  const openEmailDialog = (order) => {
    setSelectedOrder(order);
    setEmailDialogOpen(true);
  };

  const openNotesDialog = (order) => {
    setSelectedOrder(order);
    setNotesDialogOpen(true);
  };

  const downloadInvoice = (orderId) => {
    window.open(`/api/orders/${orderId}/invoice`, "_blank");
  };

  // Load data functions
  const loadDashboardStats = async () => {
    try {
      const data = await apiCall("/dashboard/stats");
      setDashboardStats(data);
    } catch (error) {
      toast.error("Failed to load dashboard stats");
    }
  };

  const loadProducts = async () => {
    try {
      const data = await apiCall(
        `/products/list?page=${productPage}&limit=${productLimit}&search=${encodeURIComponent(searchTerm)}`,
      );

      // console.log("PRODUCT PAGE:", productPage);
      // console.log("PRODUCT DATA:", data.products);

      setProducts(data.products);
      setProductTotal(data.total);
    } catch (error) {
      toast.error("Failed to load products");
    }
  };

  const loadWarehouses = async () => {
    try {
      const data = await apiCall("/warehouses/list");
      setWarehouses(data.warehouses);
    } catch (error) {
      toast.error("Failed to load warehouses");
    }
  };

  const loadCategories = async () => {
    try {
      const data = await apiCall("/categories/list");
      setCategories(data.categories);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  // const loadInventory = async () => {
  //   try {
  //     const lowStock = inventoryFilter === "low" ? "true" : "false";
  //     const warehouseParam = selectedWarehouse
  //       ? `&warehouseId=${selectedWarehouse}`
  //       : "";
  //     const data = await apiCall(
  //       `/inventory/list?page=${inventoryPage}&limit=${inventoryLimit}&lowStock=${lowStock}${warehouseParam}`,
  //     );
  //     setInventory(data.inventory);
  //   } catch (error) {
  //     toast.error("Failed to load inventory");
  //   }
  // };

  const loadInventory = async () => {
    try {
      const params = new URLSearchParams({
        page: String(inventoryPage),
        limit: String(inventoryLimit),
      });

      // Only request low-stock records when the Low Stock filter is selected.
      if (inventoryFilter === "low") {
        params.set("lowStock", "true");
      }

      // "all" means no warehouse filter should be sent to the API.
      if (selectedWarehouse && selectedWarehouse !== "all") {
        params.set("warehouseId", selectedWarehouse);
      }

      const data = await apiCall(`/inventory/list?${params.toString()}`);

      // console.log("INVENTORY PAGE:", inventoryPage);
      // console.log("INVENTORY REQUEST:", params.toString());
      // console.log("INVENTORY RESPONSE:", data);

      setInventory(data.inventory || []);
      setInventoryTotal(data.total || 0);
    } catch (error) {
      console.error("INVENTORY ERROR:", error);
      toast.error("Failed to load inventory");
    }
  };

  const loadStockMovements = async () => {
    try {
      const params = new URLSearchParams({
        page: String(movementPage),
        limit: String(movementLimit),
      });

      if (movementSearch.trim()) {
        params.set("search", movementSearch.trim());
      }

      if (movementTypeFilter !== "all") {
        params.set("type", movementTypeFilter);
      }

      if (movementWarehouseFilter !== "all") {
        params.set("warehouseId", movementWarehouseFilter);
      }

      const data = await apiCall(`/stock-movements/list?${params.toString()}`);

      setStockMovements(data.movements || []);
      setMovementTotal(data.total || 0);
    } catch (error) {
      console.error("STOCK MOVEMENTS ERROR:", error);
      toast.error("Failed to load stock movements");
    }
  };

  const loadOrders = async () => {
  try {
    const params = new URLSearchParams({
      page: String(orderPage),
      limit: String(orderLimit),
    });

    if (orderSearch.trim()) {
      params.set("search", orderSearch.trim());
    }

    if (orderStatusFilter !== "all") {
      params.set("status", orderStatusFilter);
    }

    if (orderPaymentFilter !== "all") {
      params.set("payment", orderPaymentFilter);
    }

    const data = await apiCall(
      `/orders/list?${params.toString()}`,
    );

    setOrders(data.orders || []);
    setOrderTotal(data.total || 0);
  } catch (error) {
    console.error("ORDERS ERROR:", error);
    toast.error("Failed to load orders");
  }
};

  const loadUsers = async () => {
    try {
      const data = await apiCall("/admin-users/list");
      setUsers(data.users);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  const loadActivityLogs = async () => {
    try {
      const data = await apiCall(
        `/activity-logs/list?page=${logPage}&limit=${logLimit}`,
      );

      setActivityLogs(data.logs);
      setLogTotal(data.total);
    } catch (error) {
      console.error("ACTIVITY LOG ERROR:", error);
      toast.error("Failed to load activity logs");
    }
  };

  // CRUD operations
  const createProduct = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", productForm.name);
      formData.append("description", productForm.description);
      formData.append("category", productForm.category);
      formData.append("subcategory", productForm.subcategory);
      formData.append("brand", productForm.brand);
      formData.append("price", productForm.price);
      formData.append("mrp", productForm.mrp);

      // 🔥 VARIANT FIELDS
      formData.append("color", productForm.color); // single string
      formData.append("design", productForm.design || "");
      formData.append("sizes", productForm.sizes); // comma separated string

      formData.append("sizeChartType", productForm.sizeChartType || "");
      formData.append(
        "productDetails",
        JSON.stringify(productForm.productDetails || {}),
      );

      productForm.images.forEach((file) => {
        formData.append("images", file);
      });

      const res = await fetch("/api/ims/products/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed");

      toast.success(data.message);

      setShowProductDialog(false);

      setProductForm({
        productId: "",
        name: "",
        description: "",
        category: "",
        subcategory: "",
        brand: "",
        price: 0,
        mrp: 0,
        sizes: "",
        color: "",
        design: "",
        images: [],
        sizeChartType: "",
        productDetails: {
          material: "",
          closureType: "",
          careInstructions: "",
          style: "",
          pattern: "",
          countryOfOrigin: "",
          manufacturer: "",
          manufacturerContact: "",
          packer: "",
          packerContact: "",
          unitCount: "",
        },
      });

      loadProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const updateProduct = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("productId", productForm.productId);
      formData.append("name", productForm.name);
      formData.append("description", productForm.description);
      formData.append("category", productForm.category);
      formData.append("subcategory", productForm.subcategory);
      formData.append("brand", productForm.brand);
      formData.append("price", productForm.price);
      formData.append("mrp", productForm.mrp);
      formData.append("sizeChartType", productForm.sizeChartType || "");
      formData.append(
        "productDetails",
        JSON.stringify(productForm.productDetails || {}),
      );

      const res = await fetch("/api/ims/products/update", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed");

      toast.success("Product updated successfully");

      setShowProductDialog(false);
      setIsEditingProduct(false);

      loadProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const editProduct = (product) => {
    setProductForm({
      productId: product.productId,
      name: product.name,
      description: product.description || "",
      category: product.category,
      subcategory: product.subcategory || "",
      brand: product.brand || "",
      price: product.price,
      mrp: product.mrp || product.price,
      sizeChartType: product.sizeChartType || "",
      productDetails: product.productDetails || {},
      sizes: "", // new variant will define this
      color: "", // new variant will define this
      images: [],
    });

    setIsEditingProduct(true);
    setShowProductDialog(true);
  };

  // const createVariant = async (e) => {
  //   e.preventDefault();
  //   try {
  //     if (isEditingVariant) {
  //       await apiCall("/variants/update", "POST", variantForm);
  //       toast.success("Variant updated successfully");
  //     } else {
  //       await apiCall("/variants/create", "POST", variantForm);
  //       toast.success("Variant created successfully");
  //     }
  //     setShowVariantDialog(false);
  //     setVariantForm({
  //       id: "",
  //       productId: "",
  //       sku: "",
  //       barcode: "",
  //       size: "",
  //       color: "",
  //       additionalPrice: 0,
  //     });
  //     setIsEditingVariant(false);
  //     loadProducts();
  //   } catch (error) {
  //     toast.error(error.message);
  //   }
  // };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Session expired. Please login again.");
        return;
      }

      const res = await fetch("/api/ims/orders/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, newStatus }),
      });

      // 👇 handle NON-JSON responses safely
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Server error");
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to update order");
      }

      toast.success(`Order moved to ${newStatus}`);
      loadOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    }
  };

  // const editVariant = (variant) => {
  //   setVariantForm({
  //     id: variant.id,
  //     productId: variant.productId,
  //     sku: variant.sku,
  //     barcode: variant.barcode,
  //     size: variant.size,
  //     color: variant.color,
  //     additionalPrice: variant.additionalPrice || 0,
  //   });
  //   setIsEditingVariant(true);
  //   setShowVariantDialog(true);
  // };

  const createWarehouse = async (e) => {
    e.preventDefault();
    try {
      if (isEditingWarehouse) {
        await apiCall("/warehouses/update", "POST", warehouseForm);
        toast.success("Warehouse updated successfully");
      } else {
        await apiCall("/warehouses/create", "POST", warehouseForm);
        toast.success("Warehouse created successfully");
      }
      setShowWarehouseDialog(false);
      setWarehouseForm({
        id: "",
        name: "",
        location: "",
        type: "warehouse",
        contactPerson: "",
        phone: "",
        address: "",
      });
      setIsEditingWarehouse(false);
      loadWarehouses();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const editWarehouse = (warehouse) => {
    setWarehouseForm({
      id: warehouse.id,
      name: warehouse.name,
      location: warehouse.location,
      type: warehouse.type,
      contactPerson: warehouse.contactPerson,
      phone: warehouse.phone,
      address: warehouse.address,
    });
    setIsEditingWarehouse(true);
    setShowWarehouseDialog(true);
  };

  const createCategory = async (e) => {
    e.preventDefault();
    try {
      await apiCall("/categories/create", "POST", categoryForm);
      toast.success("Category created successfully");
      setCategoryForm({ name: "", type: "men", parentCategory: "" });
      loadCategories();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const createStockMovement = async (e) => {
    e.preventDefault();

    try {
      await apiCall("/stock-movements/create", "POST", {
        productId: Number(movementForm.productId),
        color: movementForm.color,
        design: movementForm.design,
        size: movementForm.size,
        fromWarehouseId: movementForm.fromWarehouseId || null,
        toWarehouseId: movementForm.toWarehouseId || null,
        quantity: Number(movementForm.quantity),
        type: movementForm.type,
        reason: movementForm.reason,
        referenceNumber: movementForm.referenceNumber,
        notes: movementForm.notes,
      });

      if (
        (movementForm.type === "sale" || movementForm.type === "return") &&
        !movementForm.referenceNumber.trim()
      ) {
        toast.error(`Reference number is required for ${movementForm.type}.`);

        return;
      }

      toast.success("Stock movement recorded successfully");
      setShowMovementDialog(false);

      // Reset Form
      setMovementForm({
        productId: "",
        color: "", // ✅ Added
        design: "",
        size: "",
        fromWarehouseId: "",
        toWarehouseId: "",
        quantity: 0,
        type: "in",
        reason: "",
        referenceNumber: "",
        notes: "",
      });

      loadStockMovements();
      loadInventory();
      loadDashboardStats();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const exportExcel = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/ims/stock-movements/export", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Export failed");
      }

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;
      a.download = "Stock-Movement-Report.xlsx";

      document.body.appendChild(a);

      a.click();

      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const createUser = async () => {
    try {
      setAddingUser(true);

      const res = await fetch("/api/ims/admin-users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setAddUserOpen(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "inventory_manager",
      });

      loadUsers(); // refresh table
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingUser(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`${API_BASE}/admin-users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      loadUsers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const editInventory = (inventory, color, design, sizeData, size) => {
    setEditInventoryForm({
      inventoryId: inventory._id,

      color,

      design: design || "",

      size,

      quantity: sizeData.quantity,

      reorderLevel: sizeData.reorderLevel,

      reorderQuantity: sizeData.reorderQuantity,
    });

    setShowEditInventoryDialog(true);
  };

  const updateInventory = async (e) => {
    e.preventDefault();

    try {
      await apiCall("/inventory/update", "POST", {
        inventoryId: editInventoryForm.inventoryId,

        color: editInventoryForm.color,

        design: editInventoryForm.design || null,

        size: editInventoryForm.size,

        quantity: Number(editInventoryForm.quantity),

        reorderLevel: Number(editInventoryForm.reorderLevel),

        reorderQuantity: Number(editInventoryForm.reorderQuantity),
      });

      toast.success("Inventory updated successfully");

      setShowEditInventoryDialog(false);

      loadInventory();

      loadDashboardStats();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addInventory = async (e) => {
    e.preventDefault();

    try {
      await apiCall("/inventory/add-stock", "POST", {
        productId: Number(addInventoryForm.productId),

        warehouseId: addInventoryForm.warehouseId,

        color: addInventoryForm.color,

        design: addInventoryForm.design || null,

        size: addInventoryForm.size,

        quantity: Number(addInventoryForm.quantity),

        reorderLevel: Number(addInventoryForm.reorderLevel),

        reorderQuantity: Number(addInventoryForm.reorderQuantity),

        reason: addInventoryForm.reason || "Direct inventory addition",

        referenceNumber: `INV-${Date.now()}`,
      });

      toast.success("Inventory added successfully");

      setShowAddInventoryDialog(false);

      setAddInventoryForm({
        productId: "",

        warehouseId: "",

        color: "",

        design: "",

        size: "",

        quantity: 0,

        reorderLevel: 10,

        reorderQuantity: 50,

        reason: "",
      });

      loadInventory();

      loadDashboardStats();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const selectedProduct = products.find(
    (p) => p.productId === Number(addInventoryForm.productId),
  );

  const availableColors = selectedProduct?.variants ?? [];

  const selectedColor = availableColors.find(
    (v) => v.color === addInventoryForm.color,
  );
  const hasDesigns = selectedColor?.designs && selectedColor.designs.length > 0;

  const availableDesigns = hasDesigns ? selectedColor.designs : [];

  const selectedDesign = availableDesigns.find(
    (design) => design.design === addInventoryForm.design,
  );

  const availableSizes = hasDesigns
    ? (selectedDesign?.sizes ?? [])
    : (selectedColor?.sizes ?? []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const generateInvoice = async (order) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/ims/orders/generate-invoice", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate invoice");
      }

      window.open(data.invoiceUrl, "_blank");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortField) return 0;

    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === "createdAt") {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    }

    if (typeof aValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
  });

  const selectedMovementProduct = products.find(
    (p) => String(p.productId) === movementForm.productId,
  );

  const selectedMovementVariant = selectedMovementProduct?.variants?.find(
    (v) => v.color === movementForm.color,
  );

  const movementHasDesigns =
    (selectedMovementVariant?.designs?.length ?? 0) > 0;

  const selectedMovementDesign = movementHasDesigns
    ? selectedMovementVariant.designs.find(
        (d) => d.design === movementForm.design,
      )
    : null;

  const availableMovementSizes = movementHasDesigns
    ? (selectedMovementDesign?.sizes ?? [])
    : (selectedMovementVariant?.sizes ?? []);

  const filteredInventory = inventory.filter((inv) => {
    const search = inventorySearch.toLowerCase().trim();

    if (!search) return true;

    return (
      inv.product?.name?.toLowerCase().includes(search) ||
      String(inv.productId).includes(search) ||
      inv.size?.toLowerCase().includes(search) ||
      inv.warehouseId?.name?.toLowerCase().includes(search) ||
      inv.warehouse?.name?.toLowerCase().includes(search)
    );
  });

  // useEffect(() => {
  //   const loadProducts = async () => {
  //     const data = await apiCall("/products/list");
  //     setProducts(data.products);
  //   };

  //   loadProducts();
  // }, []);

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    loadStockMovements();
  }, [
    movementPage,
    movementLimit,
    movementSearch,
    movementTypeFilter,
    movementWarehouseFilter,
  ]);

  useEffect(() => {
  loadOrders();
}, [
  orderPage,
  orderLimit,
  orderSearch,
  orderStatusFilter,
  orderPaymentFilter,
]);

  // Load data when logged in and tab changes
  useEffect(() => {
    if (isLoggedIn && token) {
      if (activeTab === "dashboard") {
        loadDashboardStats();
      } else if (activeTab === "products") {
        loadProducts();
        loadCategories();
      } else if (activeTab === "inventory") {
        loadInventory();
        loadWarehouses();
      } else if (activeTab === "movements") {
        loadStockMovements();
        loadWarehouses();
      } else if (activeTab === "orders") {
        loadOrders();
      } else if (activeTab === "warehouses") {
        loadWarehouses();
      } else if (activeTab === "users") {
        loadUsers();
      } else if (activeTab === "logs") {
        loadActivityLogs();
      }
    }
  }, [
    isLoggedIn,
    token,
    activeTab,
    searchTerm,
    inventoryFilter,
    selectedWarehouse,
    productPage,
    inventoryPage,
    movementPage,
    orderPage,
    logPage,
    // userPage,
  ]);

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              VastraDrobe IMS
            </CardTitle>
            <CardDescription className="text-center">
              Inventory Management System
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="login">Login</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@vastradrobe.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <Toaster position="top-right" richColors />
      </div>
    );
  }

  const CANCEL_REASONS = [
    "Out of Stock",
    "Customer Requested",
    "Duplicate Order",
    "Payment Failed",
    "Address Not Serviceable",
    "Fraudulent Order",
    "Damaged Product",
    "Other",
  ];

  const cancelOrder = async () => {
    try {
      setCancelLoading(true);

      const response = await fetch("/api/ims/orders/cancel", {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          orderId: selectedOrder.id,
          reason: cancelReason,
          note: cancelNote,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      await loadOrders();

      setCancelDialogOpen(false);

      setCancelReason("");

      setCancelNote("");

      setSelectedOrder(null);

      toast.success("Order cancelled successfully");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  const openTimeline = async (order) => {
    try {
      setTimelineLoading(true);

      const response = await fetch(`/api/ims/orders/${order.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setTimelineOrder(data.order);

      setTimelineOpen(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTimelineLoading(false);
    }
  };

  // Main application
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">VastraDrobe IMS</h1>
            <p className="text-sm text-muted-foreground">
              Inventory Management System
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{currentUser?.name}</p>
              <p className="text-xs text-muted-foreground">
                {currentUser?.role}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-7 lg:grid-cols-8 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Warehouse className="w-4 h-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="movements" className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4" />
              <span className="hidden sm:inline">Movements</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="warehouses" className="flex items-center gap-2">
              <Warehouse className="w-4 h-4" />
              <span className="hidden sm:inline">Locations</span>
            </TabsTrigger>
            {currentUser?.role === "admin" && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
            )}
            {(currentUser?.role === "admin" ||
              currentUser?.role === "inventory_manager") && (
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Logs</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {/* Inventory Value */}
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Inventory Value
                      </p>

                      <h3 className="mt-2 text-2xl font-bold tracking-tight">
                        ₹
                        {dashboardStats?.totalStockValue?.toLocaleString() ||
                          "0"}
                      </h3>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Current stock valuation
                      </p>
                    </div>

                    {/* Inventory Value */}
                    <div className="rounded-lg bg-green-100 p-2.5 dark:bg-green-950/40">
                      <IndianRupee className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Units */}
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Units
                      </p>

                      <h3 className="mt-2 text-2xl font-bold tracking-tight">
                        {dashboardStats?.totalQuantity?.toLocaleString() || "0"}
                      </h3>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Across all inventory
                      </p>
                    </div>

                    {/* Total Units */}
                    <div className="rounded-lg bg-blue-100 p-2.5 dark:bg-blue-950/40">
                      <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Products */}
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Products
                      </p>

                      <h3 className="mt-2 text-2xl font-bold tracking-tight">
                        {dashboardStats?.uniqueProducts || 0}
                      </h3>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Active products
                      </p>
                    </div>

                    {/* Products */}
                    <div className="rounded-lg bg-purple-100 p-2.5 dark:bg-purple-950/40">
                      <Boxes className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stock Alerts */}
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Stock Alerts
                      </p>

                      <h3 className="mt-2 text-2xl font-bold tracking-tight">
                        {(dashboardStats?.lowStockCount || 0) +
                          (dashboardStats?.outOfStockCount || 0)}
                      </h3>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Items need attention
                      </p>
                    </div>

                    {/* Stock Alerts */}
                    <div className="rounded-lg bg-orange-100 p-2.5 dark:bg-orange-950/40">
                      <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* Inventory Health */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle>Inventory Health</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Current stock availability
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Health percentage */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold">
                        {dashboardStats?.stockHealthPercentage || 0}%
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Healthy inventory
                      </p>
                    </div>

                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>

                  {/* Progress bar */}
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all"
                      style={{
                        width: `${dashboardStats?.stockHealthPercentage || 0}%`,
                      }}
                    />
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        <p className="text-sm text-muted-foreground">Healthy</p>
                      </div>

                      <p className="mt-1 text-lg font-semibold">
                        {dashboardStats?.healthyStockCount || 0}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                        <p className="text-sm text-muted-foreground">
                          Low Stock
                        </p>
                      </div>

                      <p className="mt-1 text-lg font-semibold">
                        {dashboardStats?.lowStockCount || 0}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                        <p className="text-sm text-muted-foreground">
                          Out of Stock
                        </p>
                      </div>

                      <p className="mt-1 text-lg font-semibold">
                        {dashboardStats?.outOfStockCount || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stock Alerts */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle>Stock Alerts</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Items requiring attention
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Low stock */}
                  <div className="flex items-center justify-between rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-yellow-100 p-2.5 dark:bg-yellow-950/40">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>

                      <div>
                        <p className="font-medium">Low Stock</p>

                        <p className="text-xs text-muted-foreground">
                          Reorder recommended
                        </p>
                      </div>
                    </div>

                    <span className="text-2xl font-bold">
                      {dashboardStats?.lowStockCount || 0}
                    </span>
                  </div>

                  {/* Out of stock */}
                  <div className="flex items-center justify-between rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-red-100 p-2.5 dark:bg-red-950/40">
                        <PackageX className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>

                      <div>
                        <p className="font-medium">Out of Stock</p>

                        <p className="text-xs text-muted-foreground">
                          Currently unavailable
                        </p>
                      </div>
                    </div>

                    <span className="text-2xl font-bold">
                      {dashboardStats?.outOfStockCount || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* {dashboardStats?.lowStockCount > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Alert:</strong> {dashboardStats.lowStockCount} items
                  are running low on stock. Check inventory tab for details.
                </AlertDescription>
              </Alert>
            )} */}

            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Stock Movements</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Latest inventory transactions
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("movements")}
                  >
                    View all
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {dashboardStats?.recentMovements?.length ? (
                  <div className="divide-y">
                    {dashboardStats.recentMovements.map((movement, index) => {
                      const isStockIn = movement.type === "in";
                      const isStockOut = movement.type === "out";
                      const isTransfer = movement.type === "transfer";

                      const productName =
                        movement.product?.name || "Unknown Product";

                      const variantInfo = [
                        movement.color,
                        movement.design,
                        movement.size,
                      ]
                        .filter(Boolean)
                        .join(" • ");

                      const warehouse =
                        movement.type === "transfer"
                          ? `${movement.fromWarehouse || "Unknown"} → ${
                              movement.toWarehouse || "Unknown"
                            }`
                          : movement.toWarehouse ||
                            movement.fromWarehouse ||
                            "Warehouse not specified";

                      return (
                        <div
                          key={`${movement._id || movement.id}-${index}`}
                          className="flex items-center justify-between gap-4 px-6 py-4"
                        >
                          {/* Left side */}
                          <div className="flex min-w-0 items-center gap-3">
                            {/* Movement icon */}
                            <div
                              className={`shrink-0 rounded-lg p-2.5 ${
                                isStockIn
                                  ? "bg-green-100 dark:bg-green-950/40"
                                  : isStockOut
                                    ? "bg-red-100 dark:bg-red-950/40"
                                    : isTransfer
                                      ? "bg-blue-100 dark:bg-blue-950/40"
                                      : "bg-muted"
                              }`}
                            >
                              {isStockIn ? (
                                <ArrowDownToLine className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : isStockOut ? (
                                <ArrowUpFromLine className="h-4 w-4 text-red-600 dark:text-red-400" />
                              ) : isTransfer ? (
                                <ArrowLeftRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>

                            {/* Movement details */}
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate font-medium">
                                  {productName}
                                </p>

                                <Badge
                                  variant={
                                    isStockIn
                                      ? "default"
                                      : isStockOut
                                        ? "destructive"
                                        : "secondary"
                                  }
                                  className="text-[10px] uppercase"
                                >
                                  {movement.type}
                                </Badge>
                              </div>

                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                {variantInfo && <span>{variantInfo}</span>}

                                <span>{warehouse}</span>
                              </div>

                              <p className="mt-1 text-xs text-muted-foreground">
                                {new Date(movement.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Quantity */}
                          <div className="shrink-0 text-right">
                            <p
                              className={`text-lg font-semibold ${
                                isStockIn
                                  ? "text-green-600 dark:text-green-400"
                                  : isStockOut
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-foreground"
                              }`}
                            >
                              {isStockIn ? "+" : isStockOut ? "-" : ""}
                              {movement.quantity}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              units
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="rounded-full bg-muted p-3">
                      <Activity className="h-6 w-6 text-muted-foreground" />
                    </div>

                    <p className="mt-3 font-medium">No recent movements</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Stock transactions will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {/* Products Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Products</h2>

                <p className="text-sm text-muted-foreground">
                  Manage your product catalog and variants
                </p>
              </div>

              {/* Keep your existing Add Product Dialog here */}
              {currentUser?.role === "admin" && (
                <div className="flex gap-2">
                  <Dialog
                    open={showProductDialog}
                    onOpenChange={setShowProductDialog}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {isEditingProduct
                            ? "Edit Product"
                            : "Add New Product"}
                        </DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={
                          isEditingProduct ? updateProduct : createProduct
                        }
                        className="space-y-2"
                      >
                        <div>
                          <Label>Product Name</Label>
                          <Input
                            value={productForm.name}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                name: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={productForm.description}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Category</Label>
                            <Input
                              placeholder="e.g., Boys Clothing, Women Accessories"
                              value={productForm.category}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  category: e.target.value,
                                })
                              }
                              required
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Enter new or existing category name
                            </p>
                          </div>
                          <div>
                            <Label>Sub Category</Label>
                            <Input
                              placeholder="e.g., Boys Clothing, Women Accessories"
                              value={productForm?.subcategory ?? ""}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  subcategory: e.target.value,
                                })
                              }
                              required
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Enter new or existing subcategory name
                            </p>
                          </div>
                          <div>
                            <Label>Color</Label>
                            <Input
                              value={productForm.color}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  color: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Variant Design (Optional)</Label>
                            <Input
                              placeholder="Little Star, Leopard, Bicycle..."
                              value={productForm.design || ""}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  design: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Brand</Label>
                            <Input
                              value={productForm.brand}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  brand: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Price (₹)</Label>
                            <Input
                              type="number"
                              value={productForm.price}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  price: parseFloat(e.target.value),
                                })
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label>MRP (₹)</Label>
                            <Input
                              type="number"
                              value={productForm.mrp}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  mrp: parseFloat(e.target.value),
                                })
                              }
                              placeholder="Optional"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Sizes</Label>
                            <Input
                              placeholder="e.g., S,M,L,XL or 5-6Y,7-8Y,9-10Y"
                              value={productForm.sizes}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  sizes: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Size Chart Type</Label>
                            <Select
                              value={productForm.sizeChartType}
                              onValueChange={(value) =>
                                setProductForm({
                                  ...productForm,
                                  sizeChartType: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select size chart type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kidstopbottom">
                                  Kids Top-Bottom
                                </SelectItem>
                                <SelectItem value="kidsFleeceHoodie">
                                  Kids Hoodie
                                </SelectItem>
                                <SelectItem value="fullSleeveTop">
                                  Full Sleeve Top
                                </SelectItem>
                                <SelectItem value="MensShirt">
                                  Mens Shirt
                                </SelectItem>
                                <SelectItem value="MensKurta">
                                  Mens Kurta
                                </SelectItem>
                                <SelectItem value="Mensjacket">
                                  Mens Jacket
                                </SelectItem>
                                <SelectItem value="menBottom">
                                  Mens Bottom
                                </SelectItem>
                                <SelectItem value="ribbedTop">
                                  Ribbed Top
                                </SelectItem>
                                <SelectItem value="generalTopBottom">
                                  General Top/Bottom
                                </SelectItem>
                                <SelectItem value="formalTopBottom">
                                  Formal Top/Bottom
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Product Images</Label>
                          <Input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                images: e.target.files
                                  ? Array.from(e.target.files)
                                  : [],
                              })
                            }
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Upload product images (max 5)
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Product Details</h3>

                          <div className="grid grid-cols-4 gap-1">
                            <Input
                              placeholder="Material"
                              value={productForm.productDetails?.material}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  productDetails: {
                                    ...productForm.productDetails,
                                    material: e.target.value,
                                  },
                                })
                              }
                            />

                            <Input
                              placeholder="Closure Type"
                              value={productForm.productDetails?.closureType}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  productDetails: {
                                    ...productForm.productDetails,
                                    closureType: e.target.value,
                                  },
                                })
                              }
                            />

                            <Input
                              placeholder="Care Instructions"
                              value={
                                productForm.productDetails?.careInstructions
                              }
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  productDetails: {
                                    ...productForm.productDetails,
                                    careInstructions: e.target.value,
                                  },
                                })
                              }
                            />

                            <Input
                              placeholder="Style"
                              value={productForm.productDetails?.style}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  productDetails: {
                                    ...productForm.productDetails,
                                    style: e.target.value,
                                  },
                                })
                              }
                            />

                            <Input
                              placeholder="Pattern"
                              value={productForm.productDetails?.pattern}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  productDetails: {
                                    ...productForm.productDetails,
                                    pattern: e.target.value,
                                  },
                                })
                              }
                            />

                            <Input
                              placeholder="Country of Origin"
                              value={
                                productForm.productDetails?.countryOfOrigin
                              }
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  productDetails: {
                                    ...productForm.productDetails,
                                    countryOfOrigin: e.target.value,
                                  },
                                })
                              }
                            />

                            <Input
                              placeholder="Manufacturer"
                              value={productForm.productDetails?.manufacturer}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  productDetails: {
                                    ...productForm.productDetails,
                                    manufacturer: e.target.value,
                                  },
                                })
                              }
                            />

                            <Input
                              placeholder="Unit Count"
                              value={productForm.productDetails?.unitCount}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  productDetails: {
                                    ...productForm.productDetails,
                                    unitCount: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full">
                          {isEditingProduct
                            ? "Update Product"
                            : "Create Product"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
            {/* Product Search */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setProductPage(1);
                  }}
                  className="pl-9"
                />
              </div>

              <Button
                variant="outline"
                onClick={loadProducts}
                className="shrink-0"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Product Catalog</CardTitle>

                    <CardDescription>
                      {productTotal || 0} products in your catalog
                    </CardDescription>
                  </div>

                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead
                        className="cursor-pointer font-semibold"
                        onClick={() => handleSort("productId")}
                      >
                        Product ID{" "}
                        {sortField === "productId" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </TableHead>

                      <TableHead
                        className="cursor-pointer font-semibold"
                        onClick={() => handleSort("name")}
                      >
                        Product{" "}
                        {sortField === "name" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </TableHead>

                      <TableHead className="font-semibold">Category</TableHead>

                      <TableHead className="font-semibold">Brand</TableHead>

                      <TableHead
                        className="cursor-pointer font-semibold"
                        onClick={() => handleSort("price")}
                      >
                        Price{" "}
                        {sortField === "price" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </TableHead>

                      <TableHead className="font-semibold">Variants</TableHead>

                      <TableHead
                        className="cursor-pointer font-semibold"
                        onClick={() => handleSort("createdAt")}
                      >
                        Created{" "}
                        {sortField === "createdAt" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </TableHead>

                      {currentUser?.role === "admin" && (
                        <TableHead className="text-right font-semibold">
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProducts.length > 0 ? (
                      sortedProducts.map((product, ind) => {
                        return (
                          <React.Fragment key={`${product.id}-${ind}`}>
                            <TableRow
                              key={`${product.id}-${ind}`}
                              className="group hover:bg-muted/30"
                            >
                              {/* Product ID */}
                              <TableCell>
                                <span className="font-mono text-xs text-muted-foreground">
                                  #{product.productId}
                                </span>
                              </TableCell>

                              {/* Product */}
                              <TableCell>
                                <div className="min-w-0">
                                  <p className="font-medium">{product.name}</p>

                                  {product.description && (
                                    <p className="mt-1 max-w-[260px] truncate text-xs text-muted-foreground">
                                      {product.description}
                                    </p>
                                  )}
                                </div>
                              </TableCell>

                              {/* Category */}
                              <TableCell>
                                <div className="space-y-1">
                                  <p className="text-sm capitalize">
                                    {product.category}
                                  </p>

                                  {product.subcategory && (
                                    <p className="text-xs capitalize text-muted-foreground">
                                      {product.subcategory}
                                    </p>
                                  )}
                                </div>
                              </TableCell>

                              {/* Brand */}
                              <TableCell>
                                <span className="capitalize">
                                  {product.brand || "-"}
                                </span>
                              </TableCell>

                              {/* Price */}
                              <TableCell>
                                <span className="font-medium">
                                  ₹{product.price?.toLocaleString() || "0"}
                                </span>

                                {product.mrp && product.mrp > product.price && (
                                  <p className="text-xs text-muted-foreground line-through">
                                    ₹{product.mrp.toLocaleString()}
                                  </p>
                                )}
                              </TableCell>

                              {/* Variants */}
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2"
                                  onClick={() =>
                                    setExpandedProduct(
                                      expandedProduct === product.productId
                                        ? null
                                        : product.productId,
                                    )
                                  }
                                >
                                  <Boxes className="mr-2 h-4 w-4 text-muted-foreground" />

                                  {product.variants?.length || 0}

                                  <span className="ml-1 text-muted-foreground">
                                    variants
                                  </span>

                                  <ChevronDown
                                    className={`ml-2 h-4 w-4 transition-transform ${
                                      expandedProduct === product.productId
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  />
                                </Button>
                              </TableCell>

                              {/* Created */}
                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(
                                    product.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </TableCell>

                              {/* Actions */}
                              {currentUser?.role === "admin" && (
                                <TableCell className="text-right">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => editProduct(product)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>

                            {/* Expanded variants */}
                            {expandedProduct === product.productId &&
                              product.variants?.length > 0 && (
                                <TableRow>
                                  <TableCell
                                    colSpan={
                                      currentUser?.role === "admin" ? 8 : 7
                                    }
                                    className="bg-muted/20 p-0"
                                  >
                                    <div className="border-t px-6 py-5">
                                      <div className="mb-4 flex items-center justify-between">
                                        <div>
                                          <h4 className="font-semibold">
                                            Product Variants
                                          </h4>

                                          <p className="text-xs text-muted-foreground">
                                            {product.variants.length} color{" "}
                                            {product.variants.length === 1
                                              ? "variant"
                                              : "variants"}{" "}
                                            available
                                          </p>
                                        </div>

                                        <Badge variant="secondary">
                                          {product.variants.length} Variants
                                        </Badge>
                                      </div>

                                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                        {product.variants.map(
                                          (variant, variantIndex) => {
                                            const hasDesigns =
                                              variant.designs &&
                                              variant.designs.length > 0;

                                            return (
                                              <div
                                                key={`${variant.color}-${variantIndex}`}
                                                className="rounded-xl border bg-background p-4 shadow-sm"
                                              >
                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-2">
                                                    <div className="h-3 w-3 rounded-full border bg-muted" />

                                                    <span className="font-medium capitalize">
                                                      {variant.color}
                                                    </span>
                                                  </div>

                                                  <Badge variant="outline">
                                                    {hasDesigns
                                                      ? `${variant.designs.length} Designs`
                                                      : `${variant.sizes?.length || 0} Sizes`}
                                                  </Badge>
                                                </div>

                                                {!hasDesigns && (
                                                  <div className="mt-4">
                                                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                                                      Available Sizes
                                                    </p>

                                                    <div className="flex flex-wrap gap-2">
                                                      {variant.sizes?.length ? (
                                                        variant.sizes.map(
                                                          (size, sizeIndex) => (
                                                            <Badge
                                                              key={`${size}-${sizeIndex}`}
                                                              variant="secondary"
                                                              className="font-normal"
                                                            >
                                                              {size}
                                                            </Badge>
                                                          ),
                                                        )
                                                      ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                          No sizes configured
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                )}

                                                {hasDesigns && (
                                                  <div className="mt-4 space-y-3">
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                      Designs
                                                    </p>

                                                    {variant.designs.map(
                                                      (design, designIndex) => (
                                                        <div
                                                          key={`${design.design}-${designIndex}`}
                                                          className="rounded-lg bg-muted/50 p-3"
                                                        >
                                                          <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium">
                                                              {design.design}
                                                            </span>

                                                            <span className="text-xs text-muted-foreground">
                                                              {design.sizes
                                                                ?.length ||
                                                                0}{" "}
                                                              sizes
                                                            </span>
                                                          </div>

                                                          <div className="mt-2 flex flex-wrap gap-1.5">
                                                            {design.sizes
                                                              ?.length ? (
                                                              design.sizes.map(
                                                                (
                                                                  size,
                                                                  sizeIndex,
                                                                ) => (
                                                                  <Badge
                                                                    key={`${size}-${sizeIndex}`}
                                                                    variant="outline"
                                                                    className="text-xs font-normal"
                                                                  >
                                                                    {size}
                                                                  </Badge>
                                                                ),
                                                              )
                                                            ) : (
                                                              <span className="text-xs text-muted-foreground">
                                                                No sizes
                                                                configured
                                                              </span>
                                                            )}
                                                          </div>
                                                        </div>
                                                      ),
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          },
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={currentUser?.role === "admin" ? 8 : 7}
                          className="h-48"
                        >
                          <div className="flex flex-col items-center justify-center text-center">
                            <div className="rounded-full bg-muted p-3">
                              <PackageSearch className="h-6 w-6 text-muted-foreground" />
                            </div>

                            <p className="mt-3 font-medium">
                              No products found
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {searchTerm
                                ? `No products match "${searchTerm}".`
                                : "Your product catalog is empty."}
                            </p>

                            {searchTerm && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2"
                                onClick={() => {
                                  setSearchTerm("");
                                  setProductPage(1);
                                }}
                              >
                                Clear search
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {productTotal > 0 && (
              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {(productPage - 1) * productLimit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-foreground">
                    {Math.min(productPage * productLimit, productTotal)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {productTotal}
                  </span>{" "}
                  products
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={productPage === 1}
                    onClick={() => setProductPage((prev) => prev - 1)}
                  >
                    Previous
                  </Button>

                  <div className="flex h-9 min-w-9 items-center justify-center rounded-md border bg-muted px-3 text-sm font-medium">
                    {productPage}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      productPage >= Math.ceil(productTotal / productLimit)
                    }
                    onClick={() => setProductPage((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            {/* Inventory Header */}
            <div className="flex flex-col gap-5">
              {/* Title + Add Inventory */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Inventory
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Manage stock levels across your warehouses
                  </p>
                </div>

                <div className="flex gap-2">
                  {/* Add Inventory */}
                  <Dialog
                    open={showAddInventoryDialog}
                    onOpenChange={setShowAddInventoryDialog}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Inventory
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-xl">
                          Add Inventory
                        </DialogTitle>

                        <DialogDescription>
                          Add stock for a specific product, variant, and
                          warehouse.
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={addInventory} className="space-y-6">
                        {/* Product & Warehouse */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-semibold">
                              Location & Product
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Choose where this stock will be stored.
                            </p>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            {/* Product */}
                            <div className="space-y-2">
                              <Label>Product</Label>

                              <Select
                                value={String(addInventoryForm.productId || "")}
                                onValueChange={(val) =>
                                  setAddInventoryForm({
                                    ...addInventoryForm,
                                    productId: parseInt(val),
                                    color: "",
                                    design: "",
                                    size: "",
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>

                                <SelectContent>
                                  {products.map((product) => (
                                    <SelectItem
                                      key={product.productId}
                                      value={String(product.productId)}
                                    >
                                      {product.name} (#{product.productId})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Warehouse */}
                            <div className="space-y-2">
                              <Label>Warehouse</Label>

                              <Select
                                value={addInventoryForm.warehouseId}
                                onValueChange={(val) =>
                                  setAddInventoryForm({
                                    ...addInventoryForm,
                                    warehouseId: val,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select warehouse" />
                                </SelectTrigger>

                                <SelectContent>
                                  {warehouses.map((warehouse) => (
                                    <SelectItem
                                      key={warehouse._id}
                                      value={warehouse._id}
                                    >
                                      {warehouse.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        {/* Variant */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-semibold">
                              Product Variant
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Select the color, design, and size.
                            </p>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            {/* Color */}
                            <div className="space-y-2">
                              <Label>Color</Label>

                              <Select
                                value={addInventoryForm.color}
                                onValueChange={(value) =>
                                  setAddInventoryForm({
                                    ...addInventoryForm,
                                    color: value,
                                    design: "",
                                    size: "",
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select color" />
                                </SelectTrigger>

                                <SelectContent>
                                  {availableColors.map((variant) => (
                                    <SelectItem
                                      key={variant.color}
                                      value={variant.color}
                                    >
                                      {variant.color}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Design */}
                            {hasDesigns && (
                              <div className="space-y-2">
                                <Label>Design</Label>

                                <Select
                                  value={addInventoryForm.design}
                                  onValueChange={(value) =>
                                    setAddInventoryForm({
                                      ...addInventoryForm,
                                      design: value,
                                      size: "",
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select design" />
                                  </SelectTrigger>

                                  <SelectContent>
                                    {availableDesigns.map((design) => (
                                      <SelectItem
                                        key={design.design}
                                        value={design.design}
                                      >
                                        {design.design}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Size */}
                            <div className="space-y-2">
                              <Label>Size</Label>

                              <Select
                                value={addInventoryForm.size}
                                onValueChange={(value) =>
                                  setAddInventoryForm({
                                    ...addInventoryForm,
                                    size: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>

                                <SelectContent>
                                  {availableSizes.map((size) => (
                                    <SelectItem key={size} value={size}>
                                      {size}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        {/* Stock */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-semibold">
                              Stock Settings
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Set the initial quantity and reorder thresholds.
                            </p>
                          </div>

                          {/* Initial Quantity */}
                          <div className="space-y-2">
                            <Label>Initial Quantity</Label>

                            <Input
                              type="number"
                              value={addInventoryForm.quantity}
                              onChange={(e) =>
                                setAddInventoryForm({
                                  ...addInventoryForm,
                                  quantity: parseInt(e.target.value),
                                })
                              }
                              required
                              min="0"
                              placeholder="0"
                            />
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            {/* Reorder Level */}
                            <div className="space-y-2">
                              <Label>Reorder Level</Label>

                              <Input
                                type="number"
                                value={addInventoryForm.reorderLevel}
                                onChange={(e) =>
                                  setAddInventoryForm({
                                    ...addInventoryForm,
                                    reorderLevel: parseInt(e.target.value),
                                  })
                                }
                                required
                                min="0"
                                placeholder="5"
                              />

                              <p className="text-xs text-muted-foreground">
                                Alert when stock reaches this level.
                              </p>
                            </div>

                            {/* Reorder Quantity */}
                            <div className="space-y-2">
                              <Label>Reorder Quantity</Label>

                              <Input
                                type="number"
                                value={addInventoryForm.reorderQuantity}
                                onChange={(e) =>
                                  setAddInventoryForm({
                                    ...addInventoryForm,
                                    reorderQuantity: parseInt(e.target.value),
                                  })
                                }
                                required
                                min="0"
                                placeholder="20"
                              />

                              <p className="text-xs text-muted-foreground">
                                Suggested quantity when reordering.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-2 border-t pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddInventoryDialog(false)}
                          >
                            Cancel
                          </Button>

                          <Button type="submit">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Inventory
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {/* Refresh */}
                  <Button
                    onClick={loadInventory}
                    variant="outline"
                    size="icon"
                    title="Refresh inventory"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-4 md:flex-row md:items-center">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    placeholder="Search products..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Stock Filter */}
                <Select
                  value={inventoryFilter}
                  onValueChange={setInventoryFilter}
                >
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Stock status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All Stock</SelectItem>

                    <SelectItem value="low">Low Stock</SelectItem>
                  </SelectContent>
                </Select>

                {/* Warehouse Filter */}
                <Select
                  value={selectedWarehouse}
                  onValueChange={setSelectedWarehouse}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All Warehouses" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All Warehouses</SelectItem>

                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse._id} value={warehouse._id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Inventory Levels</CardTitle>

                    <CardDescription>
                      Current stock across all warehouses
                    </CardDescription>
                  </div>

                  <div className="rounded-lg bg-muted p-2.5">
                    <Boxes className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="font-semibold">Product</TableHead>

                      <TableHead className="font-semibold">Warehouse</TableHead>

                      <TableHead className="font-semibold">Variant</TableHead>

                      <TableHead className="font-semibold">Design</TableHead>

                      <TableHead className="font-semibold">Size</TableHead>

                      <TableHead className="text-right font-semibold">
                        Quantity
                      </TableHead>

                      <TableHead className="text-right font-semibold">
                        Reorder
                      </TableHead>

                      <TableHead className="font-semibold">Status</TableHead>

                      {(currentUser?.role === "admin" ||
                        currentUser?.role === "inventory_manager") && (
                        <TableHead className="text-right font-semibold">
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.length > 0 ? (
                      filteredInventory.map((inventory) => {
                        const variants = inventory.variants || [];

                        if (variants.length === 0) return null;

                        const inventoryKey = inventory._id;

                        const currentSelection =
                          inventorySelections[inventoryKey];

                        // Default to the first available color.
                        const selectedColor =
                          currentSelection?.color || variants[0].color;

                        const selectedVariant =
                          variants.find(
                            (variant) =>
                              variant.color.toLowerCase() ===
                              selectedColor.toLowerCase(),
                          ) || variants[0];

                        const hasDesigns =
                          selectedVariant.designs &&
                          selectedVariant.designs.length > 0;

                        // -----------------------------------------
                        // Determine available designs
                        // -----------------------------------------

                        const designs = hasDesigns
                          ? selectedVariant.designs
                          : [];

                        const selectedDesign = hasDesigns
                          ? currentSelection?.design || designs[0]?.design
                          : null;

                        const selectedDesignNode = hasDesigns
                          ? designs.find(
                              (design) =>
                                design.design.toLowerCase() ===
                                selectedDesign.toLowerCase(),
                            )
                          : null;

                        // -----------------------------------------
                        // Determine available sizes
                        // -----------------------------------------

                        const sizes = hasDesigns
                          ? selectedDesignNode?.sizes || []
                          : selectedVariant.sizes || [];

                        const selectedSize =
                          currentSelection?.size || sizes[0]?.size;

                        const selectedSizeNode =
                          sizes.find(
                            (size) =>
                              size.size.toLowerCase() ===
                              selectedSize?.toLowerCase(),
                          ) || sizes[0];

                        if (!selectedSizeNode) return null;

                        const isOutOfStock = selectedSizeNode.quantity === 0;

                        const isLowStock =
                          selectedSizeNode.quantity <=
                          selectedSizeNode.reorderLevel;

                        // -----------------------------------------
                        // Update selection while keeping
                        // dependent values valid.
                        // -----------------------------------------

                        const updateSelection = (changes) => {
                          setInventorySelections((prev) => ({
                            ...prev,
                            [inventoryKey]: {
                              color: selectedColor,
                              design: selectedDesign,
                              size: selectedSize,
                              ...changes,
                            },
                          }));
                        };

                        return (
                          <TableRow
                            key={inventoryKey}
                            className="group hover:bg-muted/30"
                          >
                            {/* Product */}
                            <TableCell>
                              <div className="min-w-0">
                                <p className="font-medium">
                                  {inventory.product?.name ||
                                    `Product #${inventory.productId}`}
                                </p>

                                <p className="mt-1 font-mono text-xs text-muted-foreground">
                                  ID: {inventory.productId}
                                </p>
                              </div>
                            </TableCell>

                            {/* Warehouse */}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Warehouse className="h-4 w-4 text-muted-foreground" />

                                <span className="text-sm">
                                  {inventory.warehouseId?.name || "-"}
                                </span>
                              </div>
                            </TableCell>

                            {/* Variant / Color */}
                            <TableCell>
                              <Select
                                value={selectedVariant.color}
                                onValueChange={(value) => {
                                  const nextVariant = variants.find(
                                    (variant) =>
                                      variant.color.toLowerCase() ===
                                      value.toLowerCase(),
                                  );

                                  const nextHasDesigns =
                                    nextVariant?.designs &&
                                    nextVariant.designs.length > 0;

                                  const nextDesign = nextHasDesigns
                                    ? nextVariant.designs[0]
                                    : null;

                                  const nextSizes = nextHasDesigns
                                    ? nextDesign?.sizes || []
                                    : nextVariant?.sizes || [];

                                  updateSelection({
                                    color: value,
                                    design: nextDesign?.design || null,
                                    size: nextSizes[0]?.size || null,
                                  });
                                }}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                  {variants.map((variant) => (
                                    <SelectItem
                                      key={variant.color}
                                      value={variant.color}
                                    >
                                      {variant.color}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>

                            {/* Design */}
                            <TableCell>
                              {hasDesigns ? (
                                <Select
                                  value={selectedDesign}
                                  onValueChange={(value) => {
                                    const nextDesign = designs.find(
                                      (design) =>
                                        design.design.toLowerCase() ===
                                        value.toLowerCase(),
                                    );

                                    updateSelection({
                                      design: value,
                                      size:
                                        nextDesign?.sizes?.[0]?.size || null,
                                    });
                                  }}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>

                                  <SelectContent>
                                    {designs.map((design) => (
                                      <SelectItem
                                        key={design.design}
                                        value={design.design}
                                      >
                                        {design.design}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  No design
                                </span>
                              )}
                            </TableCell>

                            {/* Size */}
                            <TableCell>
                              <Select
                                value={selectedSize}
                                onValueChange={(value) =>
                                  updateSelection({
                                    size: value,
                                  })
                                }
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                  {sizes.map((size) => (
                                    <SelectItem
                                      key={size.size}
                                      value={size.size}
                                    >
                                      {size.size}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>

                            {/* Quantity */}
                            <TableCell className="text-right">
                              <span
                                className={`text-base font-semibold ${
                                  isOutOfStock
                                    ? "text-red-600 dark:text-red-400"
                                    : isLowStock
                                      ? "text-orange-600 dark:text-orange-400"
                                      : "text-green-600 dark:text-green-400"
                                }`}
                              >
                                {selectedSizeNode.quantity}
                              </span>
                            </TableCell>

                            {/* Reorder */}
                            <TableCell>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {selectedSizeNode.reorderLevel}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  +{selectedSizeNode.reorderQuantity} reorder
                                </p>
                              </div>
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                              <Badge
                                className={
                                  isOutOfStock
                                    ? "border border-red-200 bg-red-100 text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
                                    : isLowStock
                                      ? "border border-orange-200 bg-orange-100 text-orange-700 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-400"
                                      : "border border-green-200 bg-green-100 text-green-700 hover:bg-green-100 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400"
                                }
                              >
                                <span
                                  className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                    isOutOfStock
                                      ? "bg-red-500"
                                      : isLowStock
                                        ? "bg-orange-500"
                                        : "bg-green-500"
                                  }`}
                                />

                                {isOutOfStock
                                  ? "Out of Stock"
                                  : isLowStock
                                    ? "Low Stock"
                                    : "In Stock"}
                              </Badge>
                            </TableCell>

                            {/* Actions */}
                            {(currentUser?.role === "admin" ||
                              currentUser?.role === "inventory_manager") && (
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8"
                                  onClick={() =>
                                    editInventory(
                                      inventory,
                                      selectedVariant.color,
                                      selectedDesign,
                                      selectedSizeNode,
                                      selectedSizeNode.size,
                                    )
                                  }
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={
                            currentUser?.role === "admin" ||
                            currentUser?.role === "inventory_manager"
                              ? 9
                              : 8
                          }
                          className="h-48"
                        >
                          <div className="flex flex-col items-center justify-center text-center">
                            <div className="rounded-full bg-muted p-3">
                              <PackageSearch className="h-6 w-6 text-muted-foreground" />
                            </div>

                            <p className="mt-3 font-medium">
                              No inventory found
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {inventorySearch
                                ? `No inventory matches "${inventorySearch}".`
                                : inventoryFilter === "low"
                                  ? "There are currently no low-stock items."
                                  : "No inventory has been added yet."}
                            </p>

                            {inventorySearch && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2"
                                onClick={() => setInventorySearch("")}
                              >
                                Clear search
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Edit Inventory Dialog */}
            <Dialog
              open={showEditInventoryDialog}
              onOpenChange={setShowEditInventoryDialog}
            >
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl">Edit Inventory</DialogTitle>

                  <DialogDescription>
                    Update stock quantities and reorder settings.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={updateInventory} className="space-y-6">
                  {/* Stock Settings */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold">Stock Settings</p>

                      <p className="text-xs text-muted-foreground">
                        Update the current quantity and reorder thresholds.
                      </p>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                      <Label>Current Quantity</Label>

                      <Input
                        type="number"
                        value={editInventoryForm.quantity}
                        onChange={(e) =>
                          setEditInventoryForm({
                            ...editInventoryForm,
                            quantity: parseInt(e.target.value),
                          })
                        }
                        required
                        min="0"
                      />

                      <p className="text-xs text-muted-foreground">
                        Current available units.
                      </p>
                    </div>

                    {/* Reorder Settings */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Reorder Level</Label>

                        <Input
                          type="number"
                          value={editInventoryForm.reorderLevel}
                          onChange={(e) =>
                            setEditInventoryForm({
                              ...editInventoryForm,
                              reorderLevel: parseInt(e.target.value),
                            })
                          }
                          required
                          min="0"
                        />

                        <p className="text-xs text-muted-foreground">
                          Low-stock threshold.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Reorder Quantity</Label>

                        <Input
                          type="number"
                          value={editInventoryForm.reorderQuantity}
                          onChange={(e) =>
                            setEditInventoryForm({
                              ...editInventoryForm,
                              reorderQuantity: parseInt(e.target.value),
                            })
                          }
                          required
                          min="0"
                        />

                        <p className="text-xs text-muted-foreground">
                          Suggested replenishment amount.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Live Stock Status */}
                  <div className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">Stock Status</p>

                        <p className="text-xs text-muted-foreground">
                          Based on the values above.
                        </p>
                      </div>

                      {Number(editInventoryForm.quantity) === 0 ? (
                        <Badge className="border-red-200 bg-red-100 text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
                          Out of Stock
                        </Badge>
                      ) : Number(editInventoryForm.quantity) <=
                        Number(editInventoryForm.reorderLevel) ? (
                        <Badge className="border-orange-200 bg-orange-100 text-orange-700 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-400">
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge className="border-green-200 bg-green-100 text-green-700 hover:bg-green-100 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400">
                          In Stock
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 border-t pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEditInventoryDialog(false)}
                    >
                      Cancel
                    </Button>

                    <Button type="submit">Update Inventory</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {inventoryTotal > 0 && (
              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {(inventoryPage - 1) * inventoryLimit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-foreground">
                    {Math.min(inventoryPage * inventoryLimit, inventoryTotal)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {inventoryTotal}
                  </span>{" "}
                  inventory records
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={inventoryPage <= 1}
                    onClick={() => setInventoryPage((prev) => prev - 1)}
                  >
                    Previous
                  </Button>

                  <div className="flex h-9 min-w-9 items-center justify-center rounded-md border bg-muted px-3 text-sm font-medium">
                    {inventoryPage}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      inventoryPage >=
                      Math.ceil(inventoryTotal / inventoryLimit)
                    }
                    onClick={() => setInventoryPage((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Stock Movements Tab */}
          <TabsContent value="movements" className="space-y-4">
            {/* Movements Header */}
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Stock Movements
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Track inventory transactions across your warehouses
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={exportExcel}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Excel
                  </Button>

                  <Dialog
                    open={showMovementDialog}
                    onOpenChange={setShowMovementDialog}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Record Movement
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl">
                          Record Stock Movement
                        </DialogTitle>

                        <DialogDescription>
                          Record a stock transaction and update inventory.
                        </DialogDescription>
                      </DialogHeader>

                      <form
                        onSubmit={createStockMovement}
                        className="space-y-6"
                      >
                        {/* Movement Type */}
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold">
                              Movement Type
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Select what is happening to the stock.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {[
                              {
                                value: "in",
                                label: "Stock In",
                                icon: ArrowDownToLine,
                              },
                              {
                                value: "out",
                                label: "Stock Out",
                                icon: ArrowUpFromLine,
                              },
                              {
                                value: "transfer",
                                label: "Transfer",
                                icon: ArrowLeftRight,
                              },
                              {
                                value: "adjustment",
                                label: "Adjustment",
                                icon: RefreshCcw,
                              },
                            ].map((item) => {
                              const Icon = item.icon;

                              return (
                                <Button
                                  key={item.value}
                                  type="button"
                                  variant={
                                    movementForm.type === item.value
                                      ? "default"
                                      : "outline"
                                  }
                                  className="h-auto flex-col gap-2 py-3"
                                  onClick={() =>
                                    setMovementForm({
                                      ...movementForm,
                                      type: item.value,
                                      fromWarehouseId: "",
                                      toWarehouseId: "",
                                    })
                                  }
                                >
                                  <Icon className="h-5 w-5" />

                                  <span className="text-xs">{item.label}</span>
                                </Button>
                              );
                            })}
                          </div>

                          {/* Other movement types */}
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              {
                                value: "sale",
                                label: "Sale",
                                icon: ShoppingCart,
                              },
                              {
                                value: "return",
                                label: "Return",
                                icon: RotateCcw,
                              },
                              {
                                value: "damaged",
                                label: "Damaged",
                                icon: AlertTriangle,
                              },
                            ].map((item) => {
                              const Icon = item.icon;

                              return (
                                <Button
                                  key={item.value}
                                  type="button"
                                  variant={
                                    movementForm.type === item.value
                                      ? "default"
                                      : "outline"
                                  }
                                  className="h-auto flex-col gap-2 py-3"
                                  onClick={() =>
                                    setMovementForm({
                                      ...movementForm,
                                      type: item.value,
                                      fromWarehouseId: "",
                                      toWarehouseId: "",
                                    })
                                  }
                                >
                                  <Icon className="h-5 w-5" />

                                  <span className="text-xs">{item.label}</span>
                                </Button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Product */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-semibold">
                              Product & Variant
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Select the exact product, color, design, and size.
                            </p>
                          </div>

                          {/* Product */}
                          <div className="space-y-2">
                            <Label>Product</Label>

                            <Select
                              value={movementForm.productId || ""}
                              onValueChange={(val) =>
                                setMovementForm((prev) => ({
                                  ...prev,
                                  productId: val,
                                  color: "",
                                  design: "",
                                  size: "",
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Product" />
                              </SelectTrigger>

                              <SelectContent className="max-h-72">
                                {products.map((p) => (
                                  <SelectItem
                                    key={p.productId}
                                    value={String(p.productId)}
                                  >
                                    <span className="block max-w-[420px] truncate">
                                      {p.name}{" "}
                                      <span className="text-muted-foreground">
                                        #{p.productId}
                                      </span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Color / Design */}
                          <div className="grid gap-4 sm:grid-cols-2">
                            {/* Color */}
                            <div className="space-y-2">
                              <Label>Color</Label>

                              <Select
                                value={movementForm.color}
                                onValueChange={(val) =>
                                  setMovementForm((prev) => ({
                                    ...prev,
                                    color: val,
                                    design: "",
                                    size: "",
                                  }))
                                }
                                disabled={!movementForm.productId}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Color" />
                                </SelectTrigger>

                                <SelectContent className="max-h-60">
                                  {products
                                    .find(
                                      (p) =>
                                        String(p.productId) ===
                                        movementForm.productId,
                                    )
                                    ?.variants?.map((variant) => (
                                      <SelectItem
                                        key={variant.color}
                                        value={variant.color}
                                      >
                                        <span className="capitalize">
                                          {variant.color}
                                        </span>
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Design */}
                            {movementHasDesigns && (
                              <div className="space-y-2">
                                <Label>Design</Label>

                                <Select
                                  value={movementForm.design}
                                  onValueChange={(val) =>
                                    setMovementForm((prev) => ({
                                      ...prev,
                                      design: val,
                                      size: "",
                                    }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Design" />
                                  </SelectTrigger>

                                  <SelectContent className="max-h-60">
                                    {selectedMovementVariant?.designs?.map(
                                      (design) => (
                                        <SelectItem
                                          key={design.design}
                                          value={design.design}
                                        >
                                          {design.design}
                                        </SelectItem>
                                      ),
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>

                          {/* Size */}
                          <div className="space-y-2">
                            <Label>Size</Label>

                            <Select
                              value={movementForm.size}
                              onValueChange={(val) =>
                                setMovementForm((prev) => ({
                                  ...prev,
                                  size: val,
                                }))
                              }
                              disabled={
                                !movementForm.color ||
                                (movementHasDesigns && !movementForm.design)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    movementHasDesigns
                                      ? "Select Design First"
                                      : "Select Size"
                                  }
                                />
                              </SelectTrigger>

                              <SelectContent className="max-h-60">
                                {availableMovementSizes.map((size, index) => (
                                  <SelectItem key={index} value={String(size)}>
                                    {String(size)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Warehouse */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-semibold">Warehouse</p>

                            <p className="text-xs text-muted-foreground">
                              Choose the source and destination.
                            </p>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            {/* From */}
                            {movementForm.type !== "in" &&
                              movementForm.type !== "return" && (
                                <div className="space-y-2">
                                  <Label>From Warehouse</Label>

                                  <Select
                                    value={movementForm.fromWarehouseId}
                                    onValueChange={(val) =>
                                      setMovementForm({
                                        ...movementForm,
                                        fromWarehouseId: val,
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select source" />
                                    </SelectTrigger>

                                    <SelectContent>
                                      {warehouses.map((w) => (
                                        <SelectItem
                                          key={w._id || w.id}
                                          value={w._id || w.id}
                                        >
                                          {w.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                            {/* To */}
                            {(movementForm.type === "in" ||
                              movementForm.type === "transfer" ||
                              movementForm.type === "return") && (
                              <div className="space-y-2">
                                <Label>To Warehouse</Label>

                                <Select
                                  value={movementForm.toWarehouseId}
                                  onValueChange={(val) =>
                                    setMovementForm({
                                      ...movementForm,
                                      toWarehouseId: val,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select destination" />
                                  </SelectTrigger>

                                  <SelectContent>
                                    {warehouses.map((w) => (
                                      <SelectItem
                                        key={w._id || w.id}
                                        value={w._id || w.id}
                                      >
                                        {w.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                          <Label>Quantity</Label>

                          <Input
                            type="number"
                            min="1"
                            value={movementForm.quantity}
                            onChange={(e) =>
                              setMovementForm({
                                ...movementForm,
                                quantity: parseInt(e.target.value),
                              })
                            }
                            required
                            placeholder="Enter quantity"
                          />
                        </div>

                        {/* Additional Details */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-semibold">
                              Additional Details
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Add references or notes for auditing.
                            </p>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>
                                Reference Number
                                {(movementForm.type === "sale" ||
                                  movementForm.type === "return") && (
                                  <span className="ml-1 text-red-500">*</span>
                                )}
                              </Label>

                              <Input
                                value={movementForm.referenceNumber}
                                onChange={(e) =>
                                  setMovementForm({
                                    ...movementForm,
                                    referenceNumber: e.target.value,
                                  })
                                }
                                placeholder={
                                  movementForm.type === "sale"
                                    ? "Enter order number"
                                    : movementForm.type === "return"
                                      ? "Enter return number"
                                      : "Order / invoice / reference"
                                }
                                required={
                                  movementForm.type === "sale" ||
                                  movementForm.type === "return"
                                }
                              />

                              {(movementForm.type === "sale" ||
                                movementForm.type === "return") && (
                                <p className="text-xs text-muted-foreground">
                                  Required for{" "}
                                  {movementForm.type === "sale"
                                    ? "sales"
                                    : "returns"}
                                  .
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label>Reason</Label>

                              <Input
                                value={movementForm.reason}
                                onChange={(e) =>
                                  setMovementForm({
                                    ...movementForm,
                                    reason: e.target.value,
                                  })
                                }
                                placeholder="Reason for movement"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Notes</Label>

                            <Textarea
                              value={movementForm.notes}
                              onChange={(e) =>
                                setMovementForm({
                                  ...movementForm,
                                  notes: e.target.value,
                                })
                              }
                              placeholder="Additional notes..."
                              rows={3}
                            />
                          </div>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-2 border-t pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowMovementDialog(false)}
                          >
                            Cancel
                          </Button>

                          <Button type="submit">
                            <Plus className="mr-2 h-4 w-4" />
                            Record Movement
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Movement Filters */}
              <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-4 md:flex-row md:items-center">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    placeholder="Search movements..."
                    value={movementSearch}
                    onChange={(e) => {
                      setMovementSearch(e.target.value);
                      setMovementPage(1);
                    }}
                    className="pl-9"
                  />
                </div>

                {/* Movement Type */}
                <Select
                  value={movementTypeFilter}
                  onValueChange={(value) => {
                    setMovementTypeFilter(value);
                    setMovementPage(1);
                  }}
                >
                  <SelectTrigger className="w-full md:w-44">
                    <SelectValue placeholder="Movement type" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All Movements</SelectItem>

                    <SelectItem value="in">Stock In</SelectItem>

                    <SelectItem value="out">Stock Out</SelectItem>

                    <SelectItem value="transfer">Transfer</SelectItem>

                    <SelectItem value="sale">Sale</SelectItem>

                    <SelectItem value="return">Return</SelectItem>

                    <SelectItem value="damaged">Damaged</SelectItem>

                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>

                {/* Warehouse */}
                <Select
                  value={movementWarehouseFilter}
                  onValueChange={(value) => {
                    setMovementWarehouseFilter(value);
                    setMovementPage(1);
                  }}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Warehouse" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All Warehouses</SelectItem>

                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse._id} value={warehouse._id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Movement History</CardTitle>

                    <CardDescription>
                      Track all stock transactions across your warehouses
                    </CardDescription>
                  </div>

                  <div className="rounded-lg bg-muted p-2.5">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="font-semibold">Movement</TableHead>

                      <TableHead className="font-semibold">Product</TableHead>

                      <TableHead className="font-semibold">Variant</TableHead>

                      <TableHead className="font-semibold">Route</TableHead>

                      <TableHead className="text-right font-semibold">
                        Quantity
                      </TableHead>

                      <TableHead className="font-semibold">
                        Performed By
                      </TableHead>

                      <TableHead className="font-semibold">Date</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {stockMovements.length > 0 ? (
                      stockMovements.map((movement, ind) => {
                        const isIn = movement.type === "in";
                        const isOut =
                          movement.type === "out" ||
                          movement.type === "damaged";
                        const isTransfer = movement.type === "transfer";

                        const variantInfo = [
                          movement.color,
                          movement.design,
                          movement.size,
                        ]
                          .filter(Boolean)
                          .join(" • ");

                        const from = movement.fromWarehouseId?.name || null;

                        const to = movement.toWarehouseId?.name || null;

                        return (
                          <TableRow
                            key={`${movement.id}-${ind}`}
                            className="hover:bg-muted/30"
                          >
                            {/* Movement */}
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div
                                  className={`rounded-lg p-2 ${
                                    isIn
                                      ? "bg-green-100 dark:bg-green-950/40"
                                      : isOut
                                        ? "bg-red-100 dark:bg-red-950/40"
                                        : isTransfer
                                          ? "bg-blue-100 dark:bg-blue-950/40"
                                          : "bg-muted"
                                  }`}
                                >
                                  {isIn ? (
                                    <ArrowDownToLine className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  ) : isOut ? (
                                    <ArrowUpFromLine className="h-4 w-4 text-red-600 dark:text-red-400" />
                                  ) : isTransfer ? (
                                    <ArrowLeftRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  ) : (
                                    <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>

                                <div>
                                  <Badge
                                    variant={
                                      isIn
                                        ? "default"
                                        : isOut
                                          ? "destructive"
                                          : "secondary"
                                    }
                                    className="capitalize"
                                  >
                                    {movement.type}
                                  </Badge>

                                  {movement.reason && (
                                    <p className="mt-1 max-w-[140px] truncate text-xs text-muted-foreground">
                                      {movement.reason}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>

                            {/* Product */}
                            <TableCell>
                              <div className="min-w-0">
                                <p className="font-medium">
                                  {movement.product?.name || "Unknown Product"}
                                </p>

                                <p className="font-mono text-xs text-muted-foreground">
                                  #{movement.productId}
                                </p>
                              </div>
                            </TableCell>

                            {/* Variant */}
                            <TableCell>
                              {variantInfo ? (
                                <span className="text-sm">{variantInfo}</span>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  -
                                </span>
                              )}
                            </TableCell>

                            {/* Route */}
                            <TableCell>
                              {isTransfer ? (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="max-w-[100px] truncate">
                                    {from || "-"}
                                  </span>

                                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />

                                  <span className="max-w-[100px] truncate">
                                    {to || "-"}
                                  </span>
                                </div>
                              ) : (
                                <div className="text-sm">
                                  {isIn ? (
                                    <span>→ {to || "Warehouse"}</span>
                                  ) : (
                                    <span>← {from || "Warehouse"}</span>
                                  )}
                                </div>
                              )}
                            </TableCell>

                            {/* Quantity */}
                            <TableCell className="text-right">
                              <span
                                className={`text-base font-semibold ${
                                  isIn
                                    ? "text-green-600 dark:text-green-400"
                                    : isOut
                                      ? "text-red-600 dark:text-red-400"
                                      : "text-foreground"
                                }`}
                              >
                                {isIn ? "+" : isOut ? "-" : ""}
                                {movement.quantity}
                              </span>

                              <p className="text-xs text-muted-foreground">
                                units
                              </p>
                            </TableCell>

                            {/* Performed By */}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                  {movement.performedBy?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "?"}
                                </div>

                                <span className="text-sm">
                                  {movement.performedBy?.name || "N/A"}
                                </span>
                              </div>
                            </TableCell>

                            {/* Date */}
                            <TableCell>
                              <div>
                                <p className="text-sm">
                                  {new Date(
                                    movement.createdAt,
                                  ).toLocaleDateString()}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {new Date(
                                    movement.createdAt,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-48">
                          <div className="flex flex-col items-center justify-center text-center">
                            <div className="rounded-full bg-muted p-3">
                              <Activity className="h-6 w-6 text-muted-foreground" />
                            </div>

                            <p className="mt-3 font-medium">
                              No movements found
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {movementSearch
                                ? `No movements match "${movementSearch}".`
                                : movementTypeFilter !== "all"
                                  ? `No ${movementTypeFilter} movements found.`
                                  : "No stock movements have been recorded yet."}
                            </p>

                            {(movementSearch ||
                              movementTypeFilter !== "all" ||
                              movementWarehouseFilter !== "all") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2"
                                onClick={() => {
                                  setMovementSearch("");
                                  setMovementTypeFilter("all");
                                  setMovementWarehouseFilter("all");
                                  setMovementPage(1);
                                }}
                              >
                                Clear filters
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {movementTotal > 0 && (
              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {(movementPage - 1) * movementLimit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-foreground">
                    {Math.min(movementPage * movementLimit, movementTotal)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {movementTotal}
                  </span>{" "}
                  movements
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={movementPage <= 1}
                    onClick={() => setMovementPage((prev) => prev - 1)}
                  >
                    Previous
                  </Button>

                  <div className="flex h-9 min-w-9 items-center justify-center rounded-md border bg-muted px-3 text-sm font-medium">
                    {movementPage}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      movementPage >= Math.ceil(movementTotal / movementLimit)
                    }
                    onClick={() => setMovementPage((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            {/* Orders Header */}
<div className="flex flex-col gap-5">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-2xl font-bold tracking-tight">
        Orders
      </h2>

      <p className="text-sm text-muted-foreground">
        Manage order fulfillment and customer requests
      </p>
    </div>

    <Button
      onClick={loadOrders}
      variant="outline"
    >
      <RefreshCw className="mr-2 h-4 w-4" />
      Refresh
    </Button>
  </div>

  {/* Order Filters */}
  <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-4 md:flex-row md:items-center">
    {/* Search */}
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <Input
  placeholder="Search by order number or customer..."
  value={orderSearch}
  onChange={(e) => {
    setOrderSearch(e.target.value);
    setOrderPage(1);
  }}
  className="pl-9"
/>
    </div>

    {/* Status */}
    <Select
  value={orderStatusFilter}
  onValueChange={(value) => {
    setOrderStatusFilter(value);
    setOrderPage(1);
  }}
>
      <SelectTrigger className="w-full md:w-44">
        <SelectValue placeholder="Order status" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="all">
          All Orders
        </SelectItem>

        <SelectItem value="pending">
          Pending
        </SelectItem>

        <SelectItem value="packing">
          Packing
        </SelectItem>

        <SelectItem value="shipping">
          Shipped
        </SelectItem>

        <SelectItem value="out_for_delivery">
          Out for Delivery
        </SelectItem>

        <SelectItem value="delivered">
          Delivered
        </SelectItem>

        <SelectItem value="cancelled">
          Cancelled
        </SelectItem>

        <SelectItem value="returned">
          Returned
        </SelectItem>

        <SelectItem value="refunded">
          Refunded
        </SelectItem>
      </SelectContent>
    </Select>

    {/* Payment */}
    <Select
  value={orderPaymentFilter}
  onValueChange={(value) => {
    setOrderPaymentFilter(value);
    setOrderPage(1);
  }}
>
      <SelectTrigger className="w-full md:w-40">
        <SelectValue placeholder="Payment" />
      </SelectTrigger>

      <SelectContent>
  <SelectItem value="all">
    All Payments
  </SelectItem>

  <SelectItem value="COD">
    Cash on Delivery
  </SelectItem>

  <SelectItem value="Razorpay">
    Online Payment
  </SelectItem>
</SelectContent>
    </Select>
  </div>
</div>

           <Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>Order Management</CardTitle>

        <CardDescription>
          View orders and manage their fulfillment lifecycle
        </CardDescription>
      </div>

      <div className="rounded-lg bg-muted p-2.5">
        <ShoppingBag className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>
  </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
  <TableRow className="bg-muted/40">
    <TableHead className="font-semibold">
      Order
    </TableHead>

    <TableHead className="font-semibold">
      Customer
    </TableHead>

    <TableHead className="font-semibold">
      Items
    </TableHead>

    <TableHead className="font-semibold">
      Delivery
    </TableHead>

    <TableHead className="font-semibold">
      Payment
    </TableHead>

    <TableHead className="font-semibold">
      Status
    </TableHead>

    <TableHead className="font-semibold">
      Created
    </TableHead>

    <TableHead className="text-right font-semibold">
      Actions
    </TableHead>
  </TableRow>
</TableHeader>

                  <TableBody>
                    {orders.length > 0 ? (
    orders.map((order) => (
                      <TableRow key={order.id}>
                        {/* Order */}
  <TableCell>
    <div>
      <p className="font-semibold">
        #{order.orderNumber}
      </p>

      <p className="mt-1 font-mono text-xs text-muted-foreground">
        ID: {order.id}
      </p>
    </div>
  </TableCell>

  {/* Customer */}
  <TableCell>
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
        {order.deliveryAddress?.name
          ?.charAt(0)
          ?.toUpperCase() || "?"}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {order.deliveryAddress?.name || "—"}
        </p>

        <p className="truncate text-xs text-muted-foreground">
          {order.deliveryAddress?.phone || "—"}
        </p>
      </div>
    </div>
  </TableCell>

  {/* Items */}
  <TableCell>
  <div className="relative min-w-[220px]">
    <div className="flex items-center justify-between gap-2">
      <div>
        <p className="text-sm font-medium">
          {order.items?.length || 0}{" "}
          {order.items?.length === 1 ? "item" : "items"}
        </p>

        <p className="text-xs text-muted-foreground">
          ₹
          {order.items
            ?.reduce(
              (total, item) =>
                total +
                Number(item.total || 0),
              0,
            )
            .toLocaleString()}
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8"
        onClick={() =>
          setOpenOrderItems(
            openOrderItems === order.id
              ? null
              : order.id,
          )
        }
      >
        View

        <ChevronDown
          className={`ml-1 h-3.5 w-3.5 transition-transform ${
            openOrderItems === order.id
              ? "rotate-180"
              : ""
          }`}
        />
      </Button>
    </div>

    {/* Items dropdown */}
    {openOrderItems === order.id && (
      <div className="absolute right-0 top-full z-[100] mt-2 w-96 rounded-xl border bg-background p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">
              Order Items
            </p>

            <p className="text-xs text-muted-foreground">
              {order.items?.length || 0} items
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() =>
              setOpenOrderItems(null)
            }
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="max-h-80 space-y-3 overflow-y-auto">
          {order.items?.map((item, index) => (
            <div
              key={`${item.productId}-${item.size}-${item.color}-${index}`}
              className="rounded-lg border p-3"
            >
              <div className="flex gap-3">
                {item.image?.[0] && (
                  <img
                    src={item.image[0]}
                    alt={item.name}
                    className="h-14 w-14 shrink-0 rounded-md object-cover"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-semibold">
                    {item.name}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Product ID: #{item.productId}
                  </p>

                  {item.sku && (
                    <p className="text-xs text-muted-foreground">
                      SKU: {item.sku}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold">
                    ₹{item.total?.toLocaleString()}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-md bg-muted/40 p-2">
                  <p className="text-[11px] text-muted-foreground">
                    Color
                  </p>

                  <p className="text-xs font-medium">
                    {item.color || "—"}
                  </p>
                </div>

                <div className="rounded-md bg-muted/40 p-2">
                  <p className="text-[11px] text-muted-foreground">
                    Size
                  </p>

                  <p className="text-xs font-medium">
                    {item.size || "—"}
                  </p>
                </div>

                <div className="rounded-md bg-muted/40 p-2">
                  <p className="text-[11px] text-muted-foreground">
                    Design
                  </p>

                  <p className="truncate text-xs font-medium">
                    {item.design || "—"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex justify-between border-t pt-2 text-xs">
                <span className="text-muted-foreground">
                  ₹{item.price?.toLocaleString()} ×{" "}
                  {item.quantity}
                </span>

                <span className="font-semibold">
                  ₹{item.total?.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
</TableCell>

  {/* Delivery */}
 <TableCell>
  {order.deliveryAddress ? (
    <div className="min-w-[300px] max-w-[400px]">
      <p className="whitespace-normal text-sm font-medium leading-5">
        {order.deliveryAddress.address}
      </p>

      <p className="text-sm text-muted-foreground">
        {[
          order.deliveryAddress.city,
          order.deliveryAddress.state,
          order.deliveryAddress.pincode,
        ]
          .filter(Boolean)
          .join(", ")}
      </p>

      {order.deliveryAddress.phone && (
        <p className="mt-1 text-xs text-muted-foreground">
          📞 {order.deliveryAddress.phone}
        </p>
      )}
    </div>
  ) : (
    <span className="text-sm text-muted-foreground">
      —
    </span>
  )}
</TableCell>

  {/* Payment */}
  <TableCell>
    <div className="space-y-1">
      <Badge
        variant="outline"
        className="text-xs"
      >
        {order.paymentMethod === "Razorpay" ? "Online" : order.paymentMethod}
      </Badge>

      <p
        className={`text-xs font-medium ${
          order.paymentStatus === "Paid"
            ? "text-green-600 dark:text-green-400"
            : order.paymentStatus === "Pending"
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-muted-foreground"
        }`}
      >
        {order.paymentStatus || "Unknown"}
      </p>
    </div>
  </TableCell>

  {/* Status */}
  <TableCell>
    <Badge
      variant={
        STATUS_COLORS[order.status] ||
        "secondary"
      }
    >
      {STATUS_LABELS[order.status] ||
        order.status}
    </Badge>
  </TableCell>

  {/* Created */}
  <TableCell>
    <div>
      <p className="text-sm">
        {new Date(
          order.createdAt,
        ).toLocaleDateString()}
      </p>

      <p className="text-xs text-muted-foreground">
        {new Date(
          order.createdAt,
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  </TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full hover:bg-muted data-[state=open]:bg-muted"
                              >
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                              align="end"
                              side="bottom"
                              sideOffset={8}
                              collisionPadding={16}
                              className="w-72 rounded-xl border bg-background p-2 shadow-2xl"
                            >
                              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Order Actions
                              </p>

                              {/* Mark as Packing */}

                              {((order.paymentMethod === "COD" &&
                                order.status === "pending") ||
                                (order.paymentMethod !== "COD" &&
                                  order.paymentStatus === "Paid" &&
                                  ["pending", "paid"].includes(
                                    order.status,
                                  ))) && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateOrderStatus(order.id, "packing")
                                  }
                                  className="gap-3 rounded-lg"
                                >
                                  <Package className="h-4 w-4 text-orange-500" />
                                  <span>Mark as Packing</span>
                                </DropdownMenuItem>
                              )}

                              {/* Mark as Shipped */}

                              {order.status === "packing" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateOrderStatus(order.id, "shipping")
                                  }
                                  className="gap-3 rounded-lg"
                                >
                                  <Truck className="h-4 w-4 text-blue-500" />
                                  <span>Mark as Shipped</span>
                                </DropdownMenuItem>
                              )}

                              {/* Out for Delivery */}

                              {order.status === "shipping" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateOrderStatus(
                                      order.id,
                                      "out_for_delivery",
                                    )
                                  }
                                  className="gap-3 rounded-lg"
                                >
                                  <Bike className="h-4 w-4 text-violet-500" />
                                  <span>Out for Delivery</span>
                                </DropdownMenuItem>
                              )}

                              {/* Delivered */}

                              {order.status === "out_for_delivery" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateOrderStatus(order.id, "delivered")
                                  }
                                  className="gap-3 rounded-lg"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  <span>Mark Delivered</span>
                                </DropdownMenuItem>
                              )}

                              {/* COD Payment Collection */}

                              {order.paymentMethod === "COD" &&
                                order.status === "delivered" &&
                                order.paymentStatus === "Pending" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateOrderStatus(order.id, "paid")
                                    }
                                    className="gap-3 rounded-lg"
                                  >
                                    <Wallet className="h-4 w-4 text-emerald-600" />
                                    <span>Mark Payment Received</span>
                                  </DropdownMenuItem>
                                )}

                              <DropdownMenuSeparator />

                              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Customer Service
                              </p>

                              {/* Cancel */}

                              {![
                                "cancelled",
                                "returned",
                                "refunded",
                                "delivered",
                              ].includes(order.status) && (
                                <DropdownMenuItem
                                  onClick={() => openCancelDialog(order)}
                                  className="gap-3 rounded-lg text-red-600 focus:text-red-600"
                                >
                                  <Ban className="h-4 w-4" />
                                  <span>Cancel Order</span>
                                </DropdownMenuItem>
                              )}

                              {/* Return */}

                              {order.status === "delivered" && (
                                <DropdownMenuItem
                                  onClick={() => openReturnDialog(order)}
                                  className="gap-3 rounded-lg"
                                >
                                  <RotateCcw className="h-4 w-4 text-amber-500" />
                                  <span>Process Return</span>
                                </DropdownMenuItem>
                              )}

                              {/* Refund */}

                              {["cancelled", "returned"].includes(
                                order.status,
                              ) && (
                                <DropdownMenuItem
                                  onClick={() => openRefundDialog(order)}
                                  className="gap-3 rounded-lg"
                                >
                                  <IndianRupee className="h-4 w-4 text-green-600" />
                                  <span>Initiate Refund</span>
                                </DropdownMenuItem>
                              )}

                              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Documents
                              </p>

                              <DropdownMenuItem
                                onClick={() => generateInvoice(order)}
                                className="gap-3 rounded-lg"
                              >
                                <FileText className="h-4 w-4 text-red-500" />
                                <span>Generate Invoice</span>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Communication
                              </p>

                              <DropdownMenuItem
                                onClick={() => openEmailDialog(order)}
                                className="gap-3 rounded-lg"
                              >
                                <Mail className="h-4 w-4 text-sky-500" />
                                <span>Send Email</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => openTimeline(order)}
                                className="gap-3 rounded-lg"
                              >
                                <History className="h-4 w-4 text-slate-500" />
                                <span>View Timeline</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow> ))
) : (
  <TableRow>
    <TableCell
      colSpan={8}
      className="h-52"
    >
      <div className="flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-muted p-3">
          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
        </div>

        <p className="mt-3 font-medium">
          No orders found
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Orders will appear here once customers place them.
        </p>
      </div>
    </TableCell>
  </TableRow>
)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Cancel Order</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label>Reason</Label>

                    <Select
                      value={cancelReason}
                      onValueChange={setCancelReason}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>

                      <SelectContent>
                        {CANCEL_REASONS.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Additional Notes</Label>

                    <Textarea
                      rows={5}
                      value={cancelNote}
                      onChange={(e) => setCancelNote(e.target.value)}
                      placeholder="Optional notes for customer..."
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCancelDialogOpen(false)}
                  >
                    Close
                  </Button>

                  <Button
                    variant="destructive"
                    disabled={!cancelReason || cancelLoading}
                    onClick={cancelOrder}
                  >
                    {cancelLoading ? "Cancelling..." : "Cancel Order"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={timelineOpen} onOpenChange={setTimelineOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Order Timeline</DialogTitle>
                </DialogHeader>

                {timelineLoading ? (
                  <div className="py-10 text-center">Loading...</div>
                ) : (
                  <div className="space-y-5 max-h-[500px] overflow-y-auto">
                    {timelineOrder?.history?.length ? (
                      timelineOrder.history
                        .slice()
                        .reverse()
                        .map((event, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between">
                              <div>
                                <div className="font-semibold">
                                  {event.action}
                                </div>

                                <div className="text-sm text-muted-foreground">
                                  {event.description}
                                </div>
                              </div>

                              <div className="text-xs text-muted-foreground">
                                {new Date(event.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p>No timeline available.</p>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>

           {orderTotal > 0 && (
  <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-sm text-muted-foreground">
      Showing{" "}
      <span className="font-medium text-foreground">
        {(orderPage - 1) * orderLimit + 1}
      </span>{" "}
      to{" "}
      <span className="font-medium text-foreground">
        {Math.min(
          orderPage * orderLimit,
          orderTotal,
        )}
      </span>{" "}
      of{" "}
      <span className="font-medium text-foreground">
        {orderTotal}
      </span>{" "}
      orders
    </p>

    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={orderPage <= 1}
        onClick={() =>
          setOrderPage((prev) => prev - 1)
        }
      >
        Previous
      </Button>

      <div className="flex h-9 min-w-9 items-center justify-center rounded-md border bg-muted px-3 text-sm font-medium">
        {orderPage}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={
          orderPage >=
          Math.ceil(orderTotal / orderLimit)
        }
        onClick={() =>
          setOrderPage((prev) => prev + 1)
        }
      >
        Next
      </Button>
    </div>
  </div>
)}
          </TabsContent>

          {/* Warehouses Tab */}
          <TabsContent value="warehouses" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Warehouses & Stores</h2>

              {currentUser?.role === "admin" && (
                <Dialog
                  open={showWarehouseDialog}
                  onOpenChange={setShowWarehouseDialog}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Location
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {isEditingWarehouse
                          ? "Edit Warehouse/Store"
                          : "Add Warehouse/Store"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={createWarehouse} className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={warehouseForm.name}
                          onChange={(e) =>
                            setWarehouseForm({
                              ...warehouseForm,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={warehouseForm.type}
                          onValueChange={(val) =>
                            setWarehouseForm({ ...warehouseForm, type: val })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="warehouse">Warehouse</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={warehouseForm.location}
                          onChange={(e) =>
                            setWarehouseForm({
                              ...warehouseForm,
                              location: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>Contact Person</Label>
                        <Input
                          value={warehouseForm.contactPerson}
                          onChange={(e) =>
                            setWarehouseForm({
                              ...warehouseForm,
                              contactPerson: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={warehouseForm.phone}
                          onChange={(e) =>
                            setWarehouseForm({
                              ...warehouseForm,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Input
                          value={warehouseForm.address}
                          onChange={(e) =>
                            setWarehouseForm({
                              ...warehouseForm,
                              address: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        {isEditingWarehouse
                          ? "Update Location"
                          : "Create Location"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Phone</TableHead>
                      {currentUser?.role === "admin" && (
                        <TableHead>Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warehouses.map((warehouse, ind) => (
                      <TableRow key={`${warehouse.id}-${ind}`}>
                        <TableCell className="font-medium">
                          {warehouse.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              warehouse.type === "warehouse"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {warehouse.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{warehouse.location}</TableCell>
                        <TableCell>{warehouse.contactPerson}</TableCell>
                        <TableCell>{warehouse.phone}</TableCell>
                        {currentUser?.role === "admin" && (
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => editWarehouse(warehouse)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          {currentUser?.role === "admin" && (
            <TabsContent value="users" className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold">Users</h2>
                <Button onClick={() => setAddUserOpen(true)}>
                  <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                          Create a new system user
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-3">
                        <Input
                          placeholder="Full name"
                          value={newUser.name}
                          onChange={(e) =>
                            setNewUser({ ...newUser, name: e.target.value })
                          }
                        />

                        <Input
                          type="email"
                          placeholder="Email"
                          value={newUser.email}
                          onChange={(e) =>
                            setNewUser({ ...newUser, email: e.target.value })
                          }
                        />

                        <Input
                          type="password"
                          placeholder="Temporary password"
                          value={newUser.password}
                          onChange={(e) =>
                            setNewUser({ ...newUser, password: e.target.value })
                          }
                        />

                        <select
                          className="w-full border rounded-md p-2"
                          value={newUser.role}
                          onChange={(e) =>
                            setNewUser({ ...newUser, role: e.target.value })
                          }
                        >
                          <option value="inventory_manager">
                            Inventory Manager
                          </option>
                          <option value="store_manager">Store Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <DialogFooter>
                        <Button
                          variant="secondary"
                          onClick={() => setAddUserOpen(false)}
                        >
                          Cancel
                        </Button>

                        <Button disabled={addingUser} onClick={createUser}>
                          {addingUser ? "Creating..." : "Create User"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  ADD USER
                </Button>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage system users and roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id || user.id}>
                          <TableCell className="font-medium">
                            {user.name}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge>{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.isActive ? "default" : "destructive"
                              }
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {user._id !== currentUser?.id && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteUser(user._id)}
                              >
                                Delete
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Activity Logs Tab */}
          {(currentUser?.role === "admin" ||
            currentUser?.role === "inventory_manager") && (
            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Logs</CardTitle>
                  <CardDescription>
                    Audit trail of system actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity Type</TableHead>
                        <TableHead>Entity ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityLogs.map((log) => (
                        <TableRow key={log._id || log.id}>
                          <TableCell>
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {log.userId?.name || log.userId?.email || "Unknown"}
                          </TableCell>
                          <TableCell>
                            <Badge>{log.action}</Badge>
                          </TableCell>
                          <TableCell>{log.entityType}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.entityId}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {logPage} of{" "}
                  {Math.max(1, Math.ceil(logTotal / logLimit))}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={logPage <= 1}
                    onClick={() => setLogPage((prev) => prev - 1)}
                  >
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    disabled={logPage >= Math.ceil(logTotal / logLimit)}
                    onClick={() => setLogPage((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Footer */}
      <footer>
        <div className="border-t border-[#000000] mt-20 p-8 text-center text-xs text-[#000000]">
          Copyright © 2026 VastraDrobe. All rights reserved.
        </div>
      </footer>

      <Toaster position="top-right" richColors />
    </div>
  );
}
