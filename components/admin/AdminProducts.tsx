"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Product } from "@/lib/types";

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

export function AdminProducts({ locale }: AdminProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to load products");
      }
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setImageFile(null);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

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

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Save failed");
      }

      await loadProducts();
      resetForm();
    } catch (err: any) {
      setError(err?.message || "Save failed");
    } finally {
      setSaving(false);
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
    setError("");
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Delete failed");
      }
      await loadProducts();
    } catch (err: any) {
      setError(err?.message || "Delete failed");
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
          <h1 className="text-3xl font-serif">Admin Products</h1>
          <p className="text-muted-foreground text-sm">
            Add, edit, and remove products directly from the website.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-md border border-input px-4 py-2 text-sm"
        >
          Log out
        </button>
      </div>

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
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <input
              value={form.department}
              onChange={(event) =>
                setForm({ ...form, department: event.target.value })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
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
            <label className="block text-sm font-medium mb-1">Original Price</label>
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
          <input
            type="file"
            accept="image/*"
            onChange={(event) =>
              setImageFile(event.target.files ? event.target.files[0] : null)
            }
            className="block text-sm"
            required={!isEditing}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            {saving
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
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
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
                        {product.brand} · {product.category}
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
    </div>
  );
}
