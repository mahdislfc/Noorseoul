"use client";

import { useEffect, useMemo, useState, type DragEvent, type FormEvent } from "react";
import type {
  AdminOrder,
  AdminOrderStatus,
  Product,
  RequestedProduct,
} from "@/lib/types";
import {
  CATEGORY_OPTIONS,
} from "@/lib/product-taxonomy";

interface AdminProductsProps {
  locale: string;
}

interface ImageDraft {
  id: string;
  kind: "existing" | "new";
  previewUrl: string;
  file?: File;
}

interface ColorShadeDraft {
  id: string;
  name: string;
  price: string;
  priceAed: string;
  priceT: string;
}

const emptyForm = {
  name: "",
  description: "",
  descriptionAr: "",
  descriptionFa: "",
  priceAed: "",
  priceT: "",
  originalPriceAed: "",
  originalPriceT: "",
  ingredients: "",
  skinType: "",
  scent: "",
  waterResistance: "",
  sourceUrl: "",
  bundleLabel: "",
  bundleProductId: "",
  economicalOptionName: "",
  economicalOptionPrice: "",
  economicalOptionQuantity: "",
  similarProductIds: [] as string[],
  colorShades: [] as ColorShadeDraft[],
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
    "products" | "orders" | "requested-products"
  >("products");

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [imageDrafts, setImageDrafts] = useState<ImageDraft[]>([]);
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [similarBrandFilter, setSimilarBrandFilter] = useState("all");
  const [similarNameFilter, setSimilarNameFilter] = useState("");

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [requestedProducts, setRequestedProducts] = useState<RequestedProduct[]>(
    []
  );
  const [requestedProductsLoading, setRequestedProductsLoading] = useState(true);
  const [requestedProductsError, setRequestedProductsError] = useState("");
  const [syncingPrices, setSyncingPrices] = useState(false);
  const [syncingProductId, setSyncingProductId] = useState<string | null>(null);
  const [siteOrigin, setSiteOrigin] = useState("");

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
    if (typeof window !== "undefined") {
      const configured =
        (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
      setSiteOrigin(configured || window.location.origin);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadRequestedProducts();
  }, []);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setImageDrafts([]);
    setDragSourceIndex(null);
    setDragOverIndex(null);
    setSimilarBrandFilter("all");
    setSimilarNameFilter("");
    setEditingId(null);
  };

  const addNewImageFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next = Array.from(files).map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      kind: "new" as const,
      previewUrl: URL.createObjectURL(file),
      file,
    }));
    setImageDrafts((current) => [...current, ...next]);
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    setImageDrafts((current) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return current;
      const next = [...current];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setImageDrafts((current) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= current.length ||
        toIndex >= current.length
      ) {
        return current;
      }
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleImageDragStart = (index: number) => {
    setDragSourceIndex(index);
    setDragOverIndex(index);
  };

  const handleImageDragOver = (event: DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleImageDrop = (event: DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    if (dragSourceIndex === null) return;
    reorderImages(dragSourceIndex, index);
    setDragSourceIndex(null);
    setDragOverIndex(null);
  };

  const handleImageDragEnd = () => {
    setDragSourceIndex(null);
    setDragOverIndex(null);
  };

  const removeImageAt = (index: number) => {
    setImageDrafts((current) => {
      const target = current[index];
      if (target?.kind === "new" && target.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSavingProduct(true);
    setProductsError("");

    try {
      if (imageDrafts.length === 0) {
        throw new Error("Please add at least one product image.");
      }

      const formData = new FormData();
      const { similarProductIds, colorShades, ...restForm } = form;
      Object.entries(restForm).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      formData.append("similarProductIds", JSON.stringify(similarProductIds));
      formData.append("colorShades", JSON.stringify(colorShades));
      const imageOrder = imageDrafts.map((image) =>
        image.kind === "existing" ? image.previewUrl : "__new__"
      );
      formData.append("imageOrder", JSON.stringify(imageOrder));
      imageDrafts.forEach((image) => {
        if (image.kind === "new" && image.file) {
          formData.append("images", image.file);
        }
      });

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
      descriptionAr: product.descriptionAr || "",
      descriptionFa: product.descriptionFa || "",
      priceAed:
        typeof product.priceAed === "number" ? String(product.priceAed) : "",
      priceT:
        typeof product.priceT === "number" ? String(product.priceT) : "",
      originalPriceAed:
        typeof product.originalPriceAed === "number"
          ? String(product.originalPriceAed)
          : "",
      originalPriceT:
        typeof product.originalPriceT === "number"
          ? String(product.originalPriceT)
          : "",
      ingredients: product.ingredients || "",
      skinType: product.skinType || "",
      scent: product.scent || "",
      waterResistance: product.waterResistance || "",
      sourceUrl: product.sourceUrl || "",
      bundleLabel: product.bundleLabel || "",
      bundleProductId: product.bundleProductId || "",
      economicalOptionName: product.economicalOption?.name || "",
      economicalOptionPrice:
        typeof product.economicalOption?.price === "number"
          ? String(product.economicalOption.price)
          : "",
      economicalOptionQuantity:
        typeof product.economicalOption?.quantity === "number"
          ? String(product.economicalOption.quantity)
          : "",
      similarProductIds: product.similarProductIds || [],
      colorShades: (product.colorShades || []).map((shade, index) => ({
        id: shade.id?.trim() || `shade-${index + 1}`,
        name: shade.name || "",
        price: typeof shade.price === "number" ? String(shade.price) : "",
        priceAed:
          typeof shade.priceAed === "number" ? String(shade.priceAed) : "",
        priceT: typeof shade.priceT === "number" ? String(shade.priceT) : "",
      })),
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
    const existingGallery =
      product.images && product.images.length > 0 ? product.images : [product.image];
    setImageDrafts(
      existingGallery.map((url, index) => ({
        id: `existing-${product.id}-${index}`,
        kind: "existing",
        previewUrl: url,
      }))
    );
    setSimilarBrandFilter("all");
    setSimilarNameFilter("");
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

  const handleSyncSourcePrices = async () => {
    setSyncingPrices(true);
    setProductsError("");
    try {
      const res = await fetch("/api/admin/products/sync-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to sync prices");
      }
      await loadProducts();
    } catch (error) {
      setProductsError(getErrorMessage(error, "Failed to sync prices"));
    } finally {
      setSyncingPrices(false);
    }
  };

  const handleSyncOneProduct = async (productId: string) => {
    setSyncingProductId(productId);
    setProductsError("");
    try {
      const res = await fetch("/api/admin/products/sync-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to sync product price");
      }
      await loadProducts();
    } catch (error) {
      setProductsError(getErrorMessage(error, "Failed to sync product price"));
    } finally {
      setSyncingProductId(null);
    }
  };

  const getProductUrl = (productId: string) => {
    const path = `/${locale}/products/${productId}`;
    if (!siteOrigin) return path;
    return `${siteOrigin}${path}`;
  };

  const copyText = async (value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // noop
    }
  };

  const linkableProducts = products.filter(
    (product) => !editingId || product.id !== editingId
  );
  const normalizedCurrentBrand = form.brand.trim().toLowerCase();
  const similarBrandOptions = Array.from(
    new Set(
      linkableProducts
        .map((product) => product.brand?.trim())
        .filter((brand): brand is string => Boolean(brand))
    )
  ).sort((a, b) => a.localeCompare(b));
  const categoryOptions = Array.from(
    new Set(
      [
        ...CATEGORY_OPTIONS,
        ...products.map((product) => product.category?.trim() || ""),
        form.category.trim(),
      ].filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
  const effectiveBrandFilter =
    similarBrandFilter === "all" && normalizedCurrentBrand
      ? normalizedCurrentBrand
      : similarBrandFilter.toLowerCase();
  const filteredSimilarProducts = linkableProducts.filter((product) => {
    if (
      effectiveBrandFilter !== "all" &&
      product.brand.trim().toLowerCase() !== effectiveBrandFilter
    ) {
      return false;
    }
    const query = similarNameFilter.trim().toLowerCase();
    if (!query) return true;
    return product.name.toLowerCase().includes(query);
  });
  const similarProductNameOptions = Array.from(
    new Set(
      filteredSimilarProducts
        .map((product) => product.name.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  const handleSimilarNameInputChange = (value: string) => {
    setSimilarNameFilter(value);
    const normalized = value.trim().toLowerCase();
    if (!normalized) return;
    const exactMatch = filteredSimilarProducts.find(
      (product) => product.name.trim().toLowerCase() === normalized
    );
    if (!exactMatch) return;
    setForm((current) => {
      if (current.similarProductIds.includes(exactMatch.id)) return current;
      return {
        ...current,
        similarProductIds: [...current.similarProductIds, exactMatch.id],
      };
    });
  };

  const addColorShadeRow = () => {
    setForm((current) => ({
      ...current,
      colorShades: [
        ...current.colorShades,
        {
          id: `shade-${Date.now()}-${current.colorShades.length + 1}`,
          name: "",
          price: "",
          priceAed: "",
          priceT: "",
        },
      ],
    }));
  };

  const updateColorShadeRow = (
    shadeId: string,
    field: keyof ColorShadeDraft,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      colorShades: current.colorShades.map((shade) =>
        shade.id === shadeId ? { ...shade, [field]: value } : shade
      ),
    }));
  };

  const removeColorShadeRow = (shadeId: string) => {
    setForm((current) => ({
      ...current,
      colorShades: current.colorShades.filter((shade) => shade.id !== shadeId),
    }));
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
                <label className="block text-sm font-medium mb-1">Header Section</label>
                <select
                  value={form.department}
                  onChange={(event) =>
                    setForm({ ...form, department: event.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select section</option>
                  <option value="Skincare">Skincare</option>
                  <option value="Makeup">Makeup</option>
                  <option value="Both">Both</option>
                </select>
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
                  {categoryOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Pricing</label>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="rounded-md border border-input p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">USD</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={form.price}
                        onChange={(event) => setForm({ ...form, price: event.target.value })}
                        type="number"
                        step="0.01"
                        className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                        placeholder="Price"
                        required
                      />
                      <input
                        value={form.originalPrice}
                        onChange={(event) =>
                          setForm({ ...form, originalPrice: event.target.value })
                        }
                        type="number"
                        step="0.01"
                        className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                        placeholder="Original"
                      />
                    </div>
                  </div>
                  <div className="rounded-md border border-input p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">AED</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={form.priceAed}
                        onChange={(event) => setForm({ ...form, priceAed: event.target.value })}
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                        placeholder="Price"
                      />
                      <input
                        value={form.originalPriceAed}
                        onChange={(event) =>
                          setForm({ ...form, originalPriceAed: event.target.value })
                        }
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                        placeholder="Original"
                      />
                    </div>
                  </div>
                  <div className="rounded-md border border-input p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">T</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={form.priceT}
                        onChange={(event) => setForm({ ...form, priceT: event.target.value })}
                        type="number"
                        step="1"
                        min="0"
                        className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                        placeholder="Price"
                      />
                      <input
                        value={form.originalPriceT}
                        onChange={(event) =>
                          setForm({ ...form, originalPriceT: event.target.value })
                        }
                        type="number"
                        step="1"
                        min="0"
                        className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                        placeholder="Original"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <input
                  value={form.currency}
                  onChange={(event) => setForm({ ...form, currency: event.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label className="block text-sm font-medium">Color / Shade Pricing Box</label>
                  <button
                    type="button"
                    onClick={addColorShadeRow}
                    className="rounded-md border border-input px-3 py-1 text-xs"
                  >
                    Add shade
                  </button>
                </div>
                {form.colorShades.length === 0 ? (
                  <p className="rounded-md border border-dashed border-input px-3 py-3 text-sm text-muted-foreground">
                    No shades yet. Add rows only for products with selectable colors/shades.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {form.colorShades.map((shade, index) => (
                      <div
                        key={shade.id}
                        className="grid grid-cols-1 gap-2 rounded-md border border-input p-3 md:grid-cols-12"
                      >
                        <input
                          value={shade.name}
                          onChange={(event) =>
                            updateColorShadeRow(shade.id, "name", event.target.value)
                          }
                          className="rounded-md border border-input bg-background px-2 py-2 text-sm md:col-span-4"
                          placeholder={`Shade name ${index + 1}`}
                        />
                        <input
                          value={shade.price}
                          onChange={(event) =>
                            updateColorShadeRow(shade.id, "price", event.target.value)
                          }
                          type="number"
                          step="0.01"
                          min="0"
                          className="rounded-md border border-input bg-background px-2 py-2 text-sm md:col-span-2"
                          placeholder="USD"
                        />
                        <input
                          value={shade.priceAed}
                          onChange={(event) =>
                            updateColorShadeRow(shade.id, "priceAed", event.target.value)
                          }
                          type="number"
                          step="0.01"
                          min="0"
                          className="rounded-md border border-input bg-background px-2 py-2 text-sm md:col-span-2"
                          placeholder="AED"
                        />
                        <input
                          value={shade.priceT}
                          onChange={(event) =>
                            updateColorShadeRow(shade.id, "priceT", event.target.value)
                          }
                          type="number"
                          step="1"
                          min="0"
                          className="rounded-md border border-input bg-background px-2 py-2 text-sm md:col-span-2"
                          placeholder="T"
                        />
                        <button
                          type="button"
                          onClick={() => removeColorShadeRow(shade.id)}
                          className="rounded-md border border-red-200 px-3 py-2 text-xs text-red-600 md:col-span-2"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Description (English)</label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (Arabic)</label>
                <textarea
                  value={form.descriptionAr}
                  onChange={(event) =>
                    setForm({ ...form, descriptionAr: event.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={4}
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (Farsi)</label>
                <textarea
                  value={form.descriptionFa}
                  onChange={(event) =>
                    setForm({ ...form, descriptionFa: event.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={4}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ingredients</label>
                <textarea
                  value={form.ingredients}
                  onChange={(event) =>
                    setForm({ ...form, ingredients: event.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Write exact ingredients from the product packaging."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Skin Type</label>
                <input
                  value={form.skinType}
                  onChange={(event) =>
                    setForm({ ...form, skinType: event.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g. Oily, Dry, Combination, Sensitive"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bundle Label</label>
                <input
                  value={form.bundleLabel}
                  onChange={(event) =>
                    setForm({ ...form, bundleLabel: event.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder='e.g. 1+1 Set, Economical Bundle'
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Scent</label>
                <input
                  value={form.scent}
                  onChange={(event) =>
                    setForm({ ...form, scent: event.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g. Fragrance-free, Citrus, Rose"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Water Resistance</label>
                <select
                  value={form.waterResistance}
                  onChange={(event) =>
                    setForm({ ...form, waterResistance: event.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Not specified</option>
                  <option value="No">No</option>
                  <option value="Water-resistant">Water-resistant</option>
                  <option value="Waterproof">Waterproof</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Supplier/Main Brand Product URL</label>
                <input
                  value={form.sourceUrl}
                  onChange={(event) =>
                    setForm({ ...form, sourceUrl: event.target.value })
                  }
                  type="url"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="https://brand.com/product/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bundle Product</label>
                <select
                  value={form.bundleProductId}
                  onChange={(event) =>
                    setForm({ ...form, bundleProductId: event.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">No bundle linked</option>
                  {products
                    .filter((product) => !editingId || product.id !== editingId)
                    .map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Economical Option Name</label>
                <input
                  value={form.economicalOptionName}
                  onChange={(event) =>
                    setForm({ ...form, economicalOptionName: event.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g. 2 items deal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Economical Option Price</label>
                <input
                  value={form.economicalOptionPrice}
                  onChange={(event) =>
                    setForm({ ...form, economicalOptionPrice: event.target.value })
                  }
                  type="number"
                  step="0.01"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g. 35"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Economical Option Quantity</label>
                <input
                  value={form.economicalOptionQuantity}
                  onChange={(event) =>
                    setForm({ ...form, economicalOptionQuantity: event.target.value })
                  }
                  type="number"
                  min={2}
                  step="1"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g. 2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Similar Products</label>
                <div className="mb-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <select
                    value={similarBrandFilter}
                    onChange={(event) => setSimilarBrandFilter(event.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">
                      {normalizedCurrentBrand ? "Same as this product brand" : "All brands"}
                    </option>
                    {similarBrandOptions.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                  <input
                    value={similarNameFilter}
                    list="admin-similar-product-options"
                    onChange={(event) =>
                      handleSimilarNameInputChange(event.target.value)
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Search or choose product name"
                  />
                  <datalist id="admin-similar-product-options">
                    {similarProductNameOptions.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
                <div className="max-h-44 overflow-y-auto rounded-md border border-input bg-background px-3 py-2">
                  {linkableProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No other products available.</p>
                  ) : filteredSimilarProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No products match your filters.</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredSimilarProducts.map((product) => {
                          const checked = form.similarProductIds.includes(product.id);
                          return (
                            <label key={product.id} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) => {
                                  if (event.target.checked) {
                                    setForm({
                                      ...form,
                                      similarProductIds: [...form.similarProductIds, product.id],
                                    });
                                    return;
                                  }
                                  setForm({
                                    ...form,
                                    similarProductIds: form.similarProductIds.filter(
                                      (id) => id !== product.id
                                    ),
                                  });
                                }}
                              />
                              <span>{product.name}</span>
                            </label>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
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

            {isEditing && editingId && (
              <div className="rounded-md border border-input bg-secondary/10 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Generated Product Page URL
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <code className="rounded bg-background px-2 py-1 text-xs">
                    {getProductUrl(editingId)}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyText(getProductUrl(editingId))}
                    className="rounded-md border border-input px-2 py-1 text-xs"
                  >
                    Copy link
                  </button>
                  <a
                    href={getProductUrl(editingId)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-input px-2 py-1 text-xs"
                  >
                    Open
                  </a>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Product Images</label>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="product-image-input"
                  className="inline-flex cursor-pointer items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Choose files
                </label>
                <span className="text-sm text-muted-foreground">
                  {imageDrafts.length > 0
                    ? `${imageDrafts.length} image${imageDrafts.length > 1 ? "s" : ""} selected`
                    : "No images selected"}
                </span>
              </div>
              <input
                id="product-image-input"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => {
                  addNewImageFiles(event.target.files);
                  event.currentTarget.value = "";
                }}
                className="sr-only"
                required={!isEditing && imageDrafts.length === 0}
              />
              {imageDrafts.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Drag and drop images to set display order.
                  </p>
                  {imageDrafts.map((image, index) => (
                    <div
                      key={image.id}
                      draggable
                      onDragStart={() => handleImageDragStart(index)}
                      onDragOver={(event) => handleImageDragOver(event, index)}
                      onDrop={(event) => handleImageDrop(event, index)}
                      onDragEnd={handleImageDragEnd}
                      className={`flex items-center gap-3 rounded-md border p-2 cursor-move ${
                        dragOverIndex === index
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <img
                        src={image.previewUrl}
                        alt={`Product image ${index + 1}`}
                        className="h-16 w-16 rounded object-cover border"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Image {index + 1}</p>
                        <p className="text-xs text-muted-foreground">
                          {image.kind === "existing" ? "Existing image" : image.file?.name || "New image"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded border border-input px-2 py-1 text-xs"
                          onClick={() => moveImage(index, "up")}
                          disabled={index === 0}
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          className="rounded border border-input px-2 py-1 text-xs"
                          onClick={() => moveImage(index, "down")}
                          disabled={index === imageDrafts.length - 1}
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          className="rounded border border-red-200 px-2 py-1 text-xs text-red-600"
                          onClick={() => removeImageAt(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              <div>
                <h2 className="text-xl font-semibold">Existing Products</h2>
                <p className="text-xs text-muted-foreground">
                  Source URL sync assumes source prices are in KRW and converts to USD/AED.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncSourcePrices}
                  className="rounded-md border border-input px-3 py-1 text-xs"
                  disabled={syncingPrices}
                >
                  {syncingPrices ? "Syncing source prices..." : "Sync prices from source URLs"}
                </button>
                <button
                  onClick={loadProducts}
                  className="rounded-md border border-input px-3 py-1 text-xs"
                  disabled={productsLoading}
                >
                  Refresh
                </button>
              </div>
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
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <a
                              href={getProductUrl(product.id)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary underline underline-offset-2"
                            >
                              Product page link
                            </a>
                            <button
                              type="button"
                              onClick={() => copyText(getProductUrl(product.id))}
                              className="rounded border border-input px-2 py-0.5 text-[10px]"
                            >
                              Copy
                            </button>
                          </div>
                          {product.sourceUrl?.trim() && (
                            <a
                              href={product.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-block text-xs text-muted-foreground underline underline-offset-2 break-all"
                            >
                              Source: {product.sourceUrl}
                            </a>
                          )}
                          {product.sourceLastSyncedAt && (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              Last sync: {new Date(product.sourceLastSyncedAt).toLocaleString()}
                            </p>
                          )}
                          {product.saleEndsAt && (
                            <p className="mt-1 text-[11px] text-primary">
                              Sale active until: {new Date(product.saleEndsAt).toLocaleDateString()}
                            </p>
                          )}
                          {product.sourceSyncError?.trim() && (
                            <p className="mt-1 text-[11px] text-red-600">
                              Sync error: {product.sourceSyncError}
                            </p>
                          )}
                          {product.colorShades && product.colorShades.length > 0 && (
                            <p className="text-xs text-primary mt-1">
                              {product.colorShades.length} shade
                              {product.colorShades.length > 1 ? "s" : ""} configured
                            </p>
                          )}
                        </div>
                        <div className="text-sm font-semibold">
                          {product.price.toFixed(2)} {product.currency}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleSyncOneProduct(product.id)}
                          className="rounded-md border border-input px-3 py-1 text-xs"
                          disabled={syncingProductId === product.id}
                        >
                          {syncingProductId === product.id ? "Syncing..." : "Sync price"}
                        </button>
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
                      {order.orderNote && (
                        <p className="mt-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-900">
                          {order.orderNote}
                        </p>
                      )}
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
                            Qty: {item.quantity} · Unit: {item.price.toFixed(2)} {order.currency}
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
                    {requestedProduct.productUrl && (
                      <a
                        href={requestedProduct.productUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-sm text-primary underline underline-offset-2 break-all"
                      >
                        {requestedProduct.productUrl}
                      </a>
                    )}
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
      ) : null}
    </div>
  );
}
