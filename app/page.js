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
import { FileText } from "lucide-react";
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
  const [selectedInventorySizes, setSelectedInventorySizes] = useState({});
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryLimit] = useState(20);
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

      console.log("PRODUCT PAGE:", productPage);
      console.log("PRODUCT DATA:", data.products);

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

      console.log("INVENTORY PAGE:", inventoryPage);
      console.log("INVENTORY REQUEST:", params.toString());
      console.log("INVENTORY RESPONSE:", data);

      setInventory(data.inventory || []);
      setInventoryTotal(data.total || 0);
    } catch (error) {
      console.error("INVENTORY ERROR:", error);
      toast.error("Failed to load inventory");
    }
  };

  const loadStockMovements = async () => {
    try {
      const data = await apiCall(
        `/stock-movements/list?page=${movementPage}&limit=${movementLimit}`,
      );

      setStockMovements(data.movements);
      setMovementTotal(data.total);
    } catch (error) {
      toast.error("Failed to load stock movements");
    }
  };

  const loadOrders = async () => {
    try {
      const data = await apiCall(
        `/orders/list?page=${orderPage}&limit=${orderLimit}`,
      );

      setOrders(data.orders);
      setOrderTotal(data.total);
    } catch (error) {
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Stock Value
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{dashboardStats?.totalStockValue?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats?.totalQuantity || 0} units
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Low Stock Items
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardStats?.lowStockCount || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Need reorder</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Out of Stock
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardStats?.outOfStockCount || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Unavailable</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Recent Movements
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardStats?.recentMovements?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last 10 transactions
                  </p>
                </CardContent>
              </Card>
            </div>

            {dashboardStats?.lowStockCount > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Alert:</strong> {dashboardStats.lowStockCount} items
                  are running low on stock. Check inventory tab for details.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Recent Stock Movements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dashboardStats?.recentMovements?.map((movement, ind) => (
                    <div
                      key={`${movement.id}-${ind}`}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div>
                        <Badge
                          variant={
                            movement.type === "in"
                              ? "default"
                              : movement.type === "out"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {movement.type}
                        </Badge>
                        <span className="ml-2 text-sm">
                          Qty: {movement.quantity}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(movement.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setProductPage(1);
                  }}
                  className="w-64"
                />
                <Button variant="outline" onClick={loadProducts}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {currentUser?.role === "admin" && (
                <div className="flex gap-2">
                  <Dialog
                    open={showProductDialog}
                    onOpenChange={setShowProductDialog}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
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

            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>Manage your product catalog</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("productId")}
                      >
                        Product Id{" "}
                        {sortField === "productId" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                        Name{" "}
                        {sortField === "name" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("category")}
                      >
                        Category{" "}
                        {sortField === "category" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead>SubCategory</TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("price")}
                      >
                        Base Price{" "}
                        {sortField === "price" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead>Variants</TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("createdAt")}
                      >
                        Created{" "}
                        {sortField === "createdAt" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </TableHead>
                      {currentUser?.role === "admin" && (
                        <TableHead>Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProducts.map((product, ind) => {
                      return (
                        <React.Fragment key={`${product.id}-${ind}`}>
                          <TableRow key={`${product.id}-${ind}`}>
                            <TableCell>{product.productId}</TableCell>
                            <TableCell className="font-medium w-[30%]">
                              {product.name}
                            </TableCell>
                            <TableCell className="capitalize">
                              {product.brand}
                            </TableCell>
                            <TableCell className="capitalize">
                              {product.category}
                            </TableCell>
                            <TableCell className="capitalize">
                              {product.subcategory}
                            </TableCell>
                            <TableCell>₹{product.price}</TableCell>
                            <TableCell
                              className="cursor-pointer hover:underline"
                              onClick={() =>
                                setExpandedProduct(
                                  expandedProduct === product.productId
                                    ? null
                                    : product.productId,
                                )
                              }
                            >
                              {product.variants?.length || 0} Variants
                            </TableCell>
                            <TableCell>
                              {new Date(product.createdAt).toLocaleDateString()}
                            </TableCell>
                            {currentUser?.role === "admin" && (
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => editProduct(product)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                          {expandedProduct === product.productId &&
                            product.variants?.length > 0 && (
                              <TableRow>
                                <TableCell colSpan={8}>
                                  <div className="flex flex-wrap gap-4">
                                    {product.variants.map((variant, i) => (
                                      <div
                                        key={i}
                                        className="border rounded p-2 bg-muted text-sm"
                                      >
                                        <div>
                                          <strong>Color:</strong>{" "}
                                          {variant.color}
                                        </div>
                                        <div>
                                          <strong>Sizes:</strong>{" "}
                                          {variant.sizes?.join(", ")}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {productPage} of {Math.ceil(productTotal / productLimit)}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={productPage === 1}
                  onClick={() => setProductPage((prev) => prev - 1)}
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  disabled={
                    productPage >= Math.ceil(productTotal / productLimit)
                  }
                  onClick={() => setProductPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <Input
                  placeholder="Search product..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-72"
                />

                <Select
                  value={inventoryFilter}
                  onValueChange={setInventoryFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedWarehouse}
                  onValueChange={setSelectedWarehouse}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Warehouses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Warehouses</SelectItem>

                    {warehouses.map((w) => (
                      <SelectItem key={w._id} value={w._id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Dialog
                  open={showAddInventoryDialog}
                  onOpenChange={setShowAddInventoryDialog}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Inventory
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Inventory</DialogTitle>
                      <DialogDescription>
                        Add stock for a product in a warehouse
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={addInventory} className="space-y-4">
                      <div>
                        <Label>Product ID</Label>
                        <Select
                          value={addInventoryForm.productId}
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
                            {products.map((p) => (
                              <SelectItem
                                key={p.productId}
                                value={String(p.productId)}
                              >
                                {p.name} (ID: {p.productId})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
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
                            {warehouses.map((w) => (
                              <SelectItem key={w._id} value={w._id}>
                                {w.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
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
                            <SelectValue placeholder="Select Color" />
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
                      {hasDesigns && (
                        <div>
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
                              <SelectValue placeholder="Select Design" />
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
                      <div>
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
                            <SelectValue placeholder="Select Size" />
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
                      <div>
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
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
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
                          />
                        </div>
                        <div>
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
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full">
                        Add Inventory
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button onClick={loadInventory} variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Levels</CardTitle>
                <CardDescription>
                  Current stock across all locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>

                      <TableHead>Warehouse</TableHead>

                      <TableHead>Color</TableHead>

                      <TableHead>Design</TableHead>

                      <TableHead>Size</TableHead>

                      <TableHead>Quantity</TableHead>

                      <TableHead>Reorder Level</TableHead>

                      <TableHead>Reorder Qty</TableHead>

                      <TableHead>Status</TableHead>

                      {(currentUser?.role === "admin" ||
                        currentUser?.role === "inventory_manager") && (
                        <TableHead>Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((inventory) => (
                      <React.Fragment key={inventory._id}>
                        {inventory.variants.map((variant) => {
                          // -----------------------------------------
                          // Products WITH designs
                          // One row = one product + color + design.
                          // The size is selected from a dropdown.
                          // -----------------------------------------
                          if (variant.designs && variant.designs.length > 0) {
                            return variant.designs.map((design) => {
                              const sizes = design.sizes || [];

                              if (sizes.length === 0) return null;

                              const rowKey = `${inventory._id}-${variant.color}-${design.design}`;

                              // Use the previously selected size, or default to the first size.
                              const selectedSizeValue =
                                selectedInventorySizes[rowKey] || sizes[0].size;

                              const selectedSize =
                                sizes.find(
                                  (size) => size.size === selectedSizeValue,
                                ) || sizes[0];

                              const isOutOfStock = selectedSize.quantity === 0;
                              const isLowStock =
                                selectedSize.quantity <=
                                selectedSize.reorderLevel;

                              return (
                                <TableRow key={rowKey}>
                                  <TableCell>{inventory.productId}</TableCell>

                                  <TableCell>
                                    {inventory.warehouseId?.name || "-"}
                                  </TableCell>

                                  <TableCell>{variant.color}</TableCell>

                                  <TableCell>{design.design}</TableCell>

                                  <TableCell>
                                    <Select
                                      value={selectedSize.size}
                                      onValueChange={(value) =>
                                        setSelectedInventorySizes((prev) => ({
                                          ...prev,
                                          [rowKey]: value,
                                        }))
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

                                  <TableCell>{selectedSize.quantity}</TableCell>

                                  <TableCell>
                                    {selectedSize.reorderLevel}
                                  </TableCell>

                                  <TableCell>
                                    {selectedSize.reorderQuantity}
                                  </TableCell>

                                  <TableCell>
                                    <Badge
                                      className={
                                        isOutOfStock
                                          ? "bg-red-100 text-red-700 hover:bg-red-100"
                                          : isLowStock
                                            ? "bg-orange-100 text-orange-700 hover:bg-orange-100"
                                            : "bg-green-100 text-green-700 hover:bg-green-100"
                                      }
                                    >
                                      {isOutOfStock
                                        ? "Out of Stock"
                                        : isLowStock
                                          ? "Low Stock"
                                          : "In Stock"}
                                    </Badge>
                                  </TableCell>

                                  {(currentUser?.role === "admin" ||
                                    currentUser?.role ===
                                      "inventory_manager") && (
                                    <TableCell>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          editInventory(
                                            inventory,
                                            variant.color,
                                            design.design,
                                            selectedSize,
                                            selectedSize.size,
                                          )
                                        }
                                      >
                                        Edit
                                      </Button>
                                    </TableCell>
                                  )}
                                </TableRow>
                              );
                            });
                          }

                          // -----------------------------------------
                          // Products WITHOUT designs
                          // One row = one product + color.
                          // The size is selected from a dropdown.
                          // -----------------------------------------

                          const sizes = variant.sizes || [];

                          if (sizes.length === 0) return null;

                          const rowKey = `${inventory._id}-${variant.color}-no-design`;

                          const selectedSizeValue =
                            selectedInventorySizes[rowKey] || sizes[0].size;

                          const selectedSize =
                            sizes.find(
                              (size) => size.size === selectedSizeValue,
                            ) || sizes[0];

                          const isOutOfStock = selectedSize.quantity === 0;
                          const isLowStock =
                            selectedSize.quantity <= selectedSize.reorderLevel;

                          return (
                            <TableRow key={rowKey}>
                              <TableCell>{inventory.productId}</TableCell>

                              <TableCell>
                                {inventory.warehouseId?.name || "-"}
                              </TableCell>

                              <TableCell>{variant.color}</TableCell>

                              <TableCell>-</TableCell>

                              <TableCell>
                                <Select
                                  value={selectedSize.size}
                                  onValueChange={(value) =>
                                    setSelectedInventorySizes((prev) => ({
                                      ...prev,
                                      [rowKey]: value,
                                    }))
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

                              <TableCell>{selectedSize.quantity}</TableCell>

                              <TableCell>{selectedSize.reorderLevel}</TableCell>

                              <TableCell>
                                {selectedSize.reorderQuantity}
                              </TableCell>

                              <TableCell>
                                <Badge
                                  className={
                                    isOutOfStock
                                      ? "bg-red-100 text-red-700 hover:bg-red-100"
                                      : isLowStock
                                        ? "bg-orange-100 text-orange-700 hover:bg-orange-100"
                                        : "bg-green-100 text-green-700 hover:bg-green-100"
                                  }
                                >
                                  {isOutOfStock
                                    ? "Out of Stock"
                                    : isLowStock
                                      ? "Low Stock"
                                      : "In Stock"}
                                </Badge>
                              </TableCell>

                              {(currentUser?.role === "admin" ||
                                currentUser?.role === "inventory_manager") && (
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      editInventory(
                                        inventory,
                                        variant.color,
                                        null,
                                        selectedSize,
                                        selectedSize.size,
                                      )
                                    }
                                  >
                                    Edit
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Edit Inventory Dialog */}
            <Dialog
              open={showEditInventoryDialog}
              onOpenChange={setShowEditInventoryDialog}
            >
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Inventory</DialogTitle>
                  <DialogDescription>
                    Update stock quantities and reorder levels
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={updateInventory} className="space-y-4">
                  <div>
                    <Label>Quantity</Label>
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
                  </div>
                  <div>
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
                  </div>
                  <div>
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
                  </div>
                  <Button type="submit" className="w-full">
                    Update Inventory
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {inventoryPage} of{" "}
                {Math.ceil(inventoryTotal / inventoryLimit)}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={inventoryPage <= 1}
                  onClick={() => setInventoryPage((prev) => prev - 1)}
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  disabled={
                    inventoryPage >= Math.ceil(inventoryTotal / inventoryLimit)
                  }
                  onClick={() => setInventoryPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Stock Movements Tab */}
          <TabsContent value="movements" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-5 items-center justify-center">
                <h2 className="text-xl font-semibold">Stock Movements</h2>
                <Button variant="outline" onClick={exportExcel}>
                  Export Excel
                </Button>
              </div>

              <Dialog
                open={showMovementDialog}
                onOpenChange={setShowMovementDialog}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Record Movement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl h-[98vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Record Stock Movement</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={createStockMovement} className="space-y-4">
                    <div>
                      <Label>Movement Type</Label>
                      <Select
                        value={movementForm.type}
                        onValueChange={(val) =>
                          setMovementForm({ ...movementForm, type: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in">Stock In</SelectItem>
                          <SelectItem value="out">Stock Out</SelectItem>
                          <SelectItem value="transfer">Transfer</SelectItem>
                          <SelectItem value="sale">Sale</SelectItem>
                          <SelectItem value="return">Return</SelectItem>
                          <SelectItem value="damaged">Damaged</SelectItem>
                          <SelectItem value="adjustment">Adjustment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Select Product :</Label>
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
                        <SelectTrigger className="">
                          <SelectValue placeholder="Select Product" />
                        </SelectTrigger>

                        <SelectContent className="max-h-72 overflow-y-auto">
                          {products.map((p) => (
                            <SelectItem
                              key={p.productId}
                              value={String(p.productId)}
                              className="max-w-[450px]"
                            >
                              <span className="block truncate">{p.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
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
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Color" />
                        </SelectTrigger>

                        <SelectContent className="max-h-60 overflow-y-auto">
                          {products
                            .find(
                              (p) =>
                                String(p.productId) === movementForm.productId,
                            )
                            ?.variants?.map((variant) => (
                              <SelectItem
                                key={variant.color}
                                value={variant.color}
                              >
                                <span className="capitalize truncate">
                                  {variant.color}
                                </span>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {movementHasDesigns && (
                      <div>
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

                          <SelectContent className="max-h-60 overflow-y-auto">
                            {selectedMovementVariant?.designs?.map((design) => (
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

                    <div>
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

                        <SelectContent className="max-h-60 overflow-y-auto">
                          {availableMovementSizes.map((size, index) => (
                            <SelectItem key={index} value={String(size)}>
                              <span>{String(size)}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {movementForm.type !== "in" &&
                        movementForm.type !== "return" && (
                          <div>
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
                                <SelectValue placeholder="Select source warehouse" />
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

                      {(movementForm.type === "in" ||
                        movementForm.type === "transfer" ||
                        movementForm.type === "return") && (
                        <div>
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
                              <SelectValue placeholder="Select destination warehouse" />
                            </SelectTrigger>
                            <SelectContent>
                              {warehouses.map((w) => (
                                <SelectItem
                                  key={w._id || w.id}
                                  value={w._id || w.name}
                                >
                                  {w.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={movementForm.quantity}
                        onChange={(e) =>
                          setMovementForm({
                            ...movementForm,
                            quantity: parseInt(e.target.value),
                          })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label>Reference Number</Label>
                      <Input
                        value={movementForm.referenceNumber}
                        onChange={(e) =>
                          setMovementForm({
                            ...movementForm,
                            referenceNumber: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Reason</Label>
                      <Input
                        value={movementForm.reason}
                        onChange={(e) =>
                          setMovementForm({
                            ...movementForm,
                            reason: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Notes</Label>
                      <Input
                        value={movementForm.notes}
                        onChange={(e) =>
                          setMovementForm({
                            ...movementForm,
                            notes: e.target.value,
                          })
                        }
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      Record Movement
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Movement History</CardTitle>
                <CardDescription>Track all stock movements</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Performed By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockMovements.map((movement, ind) => (
                      <TableRow key={`${movement.id}-${ind}`}>
                        <TableCell>
                          {new Date(movement.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              movement.type === "in"
                                ? "default"
                                : movement.type === "out" ||
                                    movement.type === "damaged"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {movement.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-[60%]">
                          {movement.product?.name || "N/A"}
                        </TableCell>
                        <TableCell>
                          {movement.fromWarehouseId?.name || "-"}
                        </TableCell>
                        <TableCell>
                          {movement.toWarehouseId?.name || "-"}
                        </TableCell>
                        <TableCell>{movement.quantity}</TableCell>
                        <TableCell>
                          {movement.performedBy?.name || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {movementPage} of{" "}
                {Math.max(1, Math.ceil(movementTotal / movementLimit))}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={movementPage <= 1}
                  onClick={() => setMovementPage((prev) => prev - 1)}
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  disabled={
                    movementPage >= Math.ceil(movementTotal / movementLimit)
                  }
                  onClick={() => setMovementPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Button onClick={loadOrders} variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Refresh
            </Button>

            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>
                  Manage order fulfillment lifecycle
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order No.</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Delivery Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.orderNumber}
                        </TableCell>

                        <TableCell>₹{order.totalAmount}</TableCell>

                        <TableCell className="text-sm">
                          {order.items?.map((item) => (
                            <div
                              key={`${item.productId}-${item.size}-${item.color}`}
                            >
                              <details className="group">
                                <summary className="cursor-pointer text-blue-600 hover:underline">
                                  ID {item.productId}
                                </summary>

                                <div className="mt-2 ml-4 text-muted-foreground">
                                  <p>Qty: {item.quantity}</p>
                                  <p>Size: {item.size}</p>
                                  <p>Color: {item.color}</p>
                                  {item.design && <p>Design: {item.design}</p>}
                                  <p>Name: {item.name}</p>
                                  <p>Price: ₹{item.price}</p>
                                </div>
                              </details>
                            </div>
                          ))}
                        </TableCell>

                        <TableCell className="text-sm">
                          {order.deliveryAddress
                            ? `${order.deliveryAddress.name}`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {order.deliveryAddress
                            ? `${order.deliveryAddress.address} (${order.deliveryAddress.phone})`
                            : "—"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={STATUS_COLORS[order.status] || "secondary"}
                          >
                            {STATUS_LABELS[order.status] || order.status}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {new Date(order.createdAt).toLocaleString()}
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
                      </TableRow>
                    ))}
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

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {orderPage} of{" "}
                {Math.max(1, Math.ceil(orderTotal / orderLimit))}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={orderPage <= 1}
                  onClick={() => setOrderPage((prev) => prev - 1)}
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  disabled={orderPage >= Math.ceil(orderTotal / orderLimit)}
                  onClick={() => setOrderPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
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
