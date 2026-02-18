"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type {
  AdminOrder,
  AdminOrderStatus,
  Product,
  RequestedProduct,
} from "@/lib/types";
import {
  CATEGORY_OPTIONS,
  DEPARTMENT_OPTIONS,
} from "@/lib/product-taxonomy";

interface AdminProductsProps {
  locale: string;
}

const emptyForm = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  currency: "USD",
  brand: "",
  category: "",
  department: "",
  size: "",
  bestSeller: false,
  newArrival: false,
  comingSoon: false,
};

const ORDER_STATUSES: AdminOrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function AdminProducts({ locale }: AdminProductsProps) {
  const [activeTab, setActiveTab] = useState<
    "products" | "orders" | "requested-products" | "rewards"
  >("products");

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [requestedProducts, setRequestedProducts] = useState<RequestedProduct[]>(
    []
  );
  const [requestedProductsLoading, setRequestedProductsLoading] = useState(true);
  const [requestedProductsError, setRequestedProductsError] = useState("");

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const loadProducts = async () => {
    setProductsLoading(true);
    setProductsError("");
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to load products");
      }
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      setProductsError(getErrorMessage(error, "Failed to load products"));
    } finally {
      setProductsLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to load orders");
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      setOrdersError(getErrorMessage(error, "Failed to load orders"));
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadRequestedProducts = async () => {
    setRequestedProductsLoading(true);
    setRequestedProductsError("");
    try {
      const res = await fetch("/api/admin/requested-products", {
        cache: "no-store",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to load requested products");
      }
      const data = await res.json();
      setRequestedProducts(data.requestedProducts || []);
    } catch (error) {
      setRequestedProductsError(
        getErrorMessage(error, "Failed to load requested products")
      );
    } finally {
      setRequestedProductsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadRequestedProducts();
  }, []);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setImageFile(null);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSavingProduct(true);
    setProductsError("");

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const url = isEditing
        ? `/api/admin/products/${editingId}`
        : "/api/admin/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Save failed");
      }

      await loadProducts();
      resetForm();
    } catch (error) {
      setProductsError(getErrorMessage(error, "Save failed"));
    } finally {
      setSavingProduct(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      currency: product.currency,
      brand: product.brand,
      category: product.category,
      department: product.department,
      size: product.size || "",
      bestSeller: product.bestSeller,
      newArrival: product.newArrival,
      comingSoon: Boolean(product.comingSoon),
    });
    setImageFile(null);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Delete this product?")) return;
    setProductsError("");
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Delete failed");
      }
      await loadProducts();
    } catch (error) {
      setProductsError(getErrorMessage(error, "Delete failed"));
    }
  };

  const handleStatusChange = async (
    orderId: string,
    status: AdminOrderStatus
  ) => {
    setUpdatingOrderId(orderId);
    setOrdersError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to update order status");
      }
      const data = await res.json();
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? data.order : order))
      );
    } catch (error) {
      setOrdersError(getErrorMessage(error, "Failed to update order status"));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = `/${locale}/admin/login`;
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-serif">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Manage products and orders in one place.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-md border border-input px-4 py-2 text-sm"
        >
          Log out
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("products")}
          className={`rounded-md px-4 py-2 text-sm ${
            activeTab === "products"
              ? "bg-primary text-primary-foreground"
              : "border border-input"
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`rounded-md px-4 py-2 text-sm ${
            activeTab === "orders"
              ? "bg-primary text-primary-foreground"
              : "border border-input"
          }`}
        >
          See Orders
        </button>
        <button
          onClick={() => setActiveTab("rewards")}
          className={`rounded-md px-4 py-2 text-sm ${
            activeTab === "rewards"
              ? "bg-primary text-primary-foreground"
              : "border border-input"
          }`}
        >
          Rewards
        </button>
        <button
          onClick={() => setActiveTab("requested-products")}
          className={`rounded-md px-4 py-2 text-sm ${
            activeTab === "requested-products"
              ? "bg-primary text-primary-foreground"
              : "border border-input"
          }`}
        >
          Requested Products
        </button>
      </div>

      {activeTab === "products" ? (
        <>
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-border bg-background p-6 shadow-sm space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <input
                  value={form.brand}
                  onChange={(event) => setForm({ ...form, brand: event.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g. COSRX"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <input
                  list="admin-department-options"
                  value={form.department}
                  onChange={(event) =>
                    setForm({ ...form, department: event.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g. Skincare"
                  required
                />
                <datalist id="admin-department-options">
                  {DEPARTMENT_OPTIONS.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  list="admin-category-options"
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g. Toner or Skin/toner"
                  required
                />
                <datalist id="admin-category-options">
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  type="number"
                  step="0.01"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Original Price
                </label>
                <input
                  value={form.originalPrice}
                  onChange={(event) =>
                    setForm({ ...form, originalPrice: event.target.value })
                  }
                  type="number"
                  step="0.01"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <input
                  value={form.currency}
                  onChange={(event) => setForm({ ...form, currency: event.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Size</label>
                <input
                  value={form.size}
                  onChange={(event) => setForm({ ...form, size: event.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.bestSeller}
                  onChange={(event) =>
                    setForm({ ...form, bestSeller: event.target.checked })
                  }
                />
                Best seller
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.newArrival}
                  onChange={(event) =>
                    setForm({ ...form, newArrival: event.target.checked })
                  }
                />
                New arrival
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.comingSoon}
                  onChange={(event) =>
                    setForm({ ...form, comingSoon: event.target.checked })
                  }
                />
                Coming soon
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Product Image</label>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="product-image-input"
                  className="inline-flex cursor-pointer items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Choose file
                </label>
                <span className="text-sm text-muted-foreground">
                  {imageFile?.name || "No file chosen"}
                </span>
              </div>
              <input
                id="product-image-input"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setImageFile(event.target.files ? event.target.files[0] : null)
                }
                className="sr-only"
                required={!isEditing}
              />
            </div>

            {productsError && <p className="text-sm text-red-600">{productsError}</p>}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={savingProduct}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                {savingProduct
                  ? "Saving..."
                  : isEditing
                    ? "Update product"
                    : "Add product"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-md border border-input px-4 py-2 text-sm"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Existing Products</h2>
              <button
                onClick={loadProducts}
                className="rounded-md border border-input px-3 py-1 text-xs"
                disabled={productsLoading}
              >
                Refresh
              </button>
            </div>

            {productsLoading ? (
              <p className="text-sm text-muted-foreground">Loading products...</p>
            ) : products.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products yet.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex gap-4 rounded-xl border border-border bg-background p-4"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-24 w-20 rounded-md object-cover border"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {product.brand} · {product.department} · {product.category}
                          </p>
                        </div>
                        <div className="text-sm font-semibold">
                          {product.price.toFixed(2)} {product.currency}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="rounded-md border border-input px-3 py-1 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="rounded-md border border-red-200 px-3 py-1 text-xs text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : activeTab === "orders" ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Website Orders</h2>
            <button
              onClick={loadOrders}
              className="rounded-md border border-input px-3 py-1 text-xs"
              disabled={ordersLoading}
            >
              Refresh
            </button>
          </div>

          {ordersError && <p className="text-sm text-red-600">{ordersError}</p>}

          {ordersLoading ? (
            <p className="text-sm text-muted-foreground">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-border bg-background p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">Order {order.orderNumber}</h3>
                      <p className="text-xs text-muted-foreground">
                        {order.firstName} {order.lastName} · {order.customerEmail} ·{" "}
                        {order.city}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold">
                        {order.total.toFixed(2)} {order.currency}
                      </div>
                      <select
                        value={order.status}
                        onChange={(event) =>
                          handleStatusChange(
                            order.id,
                            event.target.value as AdminOrderStatus
                          )
                        }
                        disabled={updatingOrderId === order.id}
                        className="rounded-md border border-input bg-background px-3 py-2 text-xs"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border border-border p-3"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-14 rounded object-cover border"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-sm font-semibold">
                          {(item.price * item.quantity).toFixed(2)} {order.currency}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : activeTab === "requested-products" ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Requested Products</h2>
            <button
              onClick={loadRequestedProducts}
              className="rounded-md border border-input px-3 py-1 text-xs"
              disabled={requestedProductsLoading}
            >
              Refresh
            </button>
          </div>

          {requestedProductsError && (
            <p className="text-sm text-red-600">{requestedProductsError}</p>
          )}

          {requestedProductsLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading requested products...
            </p>
          ) : requestedProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No requested products yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {requestedProducts.map((requestedProduct) => (
                <div
                  key={requestedProduct.id}
                  className="flex gap-4 rounded-xl border border-border bg-background p-4"
                >
                  <img
                    src={requestedProduct.image}
                    alt={requestedProduct.name}
                    className="h-24 w-20 rounded-md object-cover border"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{requestedProduct.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(requestedProduct.createdAt).toLocaleString()}
                    </p>
                    {requestedProduct.note && (
                      <p className="text-sm text-muted-foreground mt-3">
                        {requestedProduct.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-6">
          <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Mini Sample Kit</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Replace these frames with your final mini kit images.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-36 rounded-md border-2 border-dashed border-border/80 flex items-center justify-center text-xs uppercase tracking-widest text-muted-foreground">
                Upload Kit Image 1
              </div>
              <div className="h-36 rounded-md border-2 border-dashed border-border/80 flex items-center justify-center text-xs uppercase tracking-widest text-muted-foreground">
                Upload Kit Image 2
              </div>
              <div className="h-36 rounded-md border-2 border-dashed border-border/80 flex items-center justify-center text-xs uppercase tracking-widest text-muted-foreground">
                Upload Kit Image 3
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Choose Product Reward</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Set image assets for selectable reward products.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Lipstick", "Blush", "Highlighter", "Eye Shadow", "Lip Gloss", "Lip Tint"].map((label) => (
                <div key={label} className="rounded-lg border border-border bg-secondary/10 p-4">
                  <div className="h-28 rounded-md border-2 border-dashed border-border/80 flex items-center justify-center text-xs uppercase tracking-widest text-muted-foreground">
                    Upload Product Image
                  </div>
                  <p className="mt-3 text-sm font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
