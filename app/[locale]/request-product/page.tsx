
"use client";

import { FormEvent, useState } from "react";

export default function RequestProductPage() {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("note", note);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/requested-products", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to submit request");
      }

      setName("");
      setNote("");
      setImageFile(null);
      setSuccess("Thanks. Your product request was sent to admin.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to submit request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-6 lg:px-20 py-12 mt-20">
      <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">
        Request a Product
      </h1>
      <div className="max-w-3xl mx-auto">
        <p className="text-muted-foreground text-center text-2xl leading-relaxed">
          Looking for a specific Korean beauty product? Let us know and we&apos;ll
          try to find it for you.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-xl border border-border bg-background p-6 md:p-8 shadow-sm space-y-5"
        >
          <div>
            <label className="block text-sm font-medium mb-2">
              Product name
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="e.g. COSRX Advanced Snail 96 Mucin Essence"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Comment (optional)
            </label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Add any details: skin type, size, exact variant..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Product picture
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              <label
                htmlFor="requested-product-image"
                className="inline-flex cursor-pointer items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Upload image
              </label>
              <span className="text-sm text-muted-foreground">
                {imageFile?.name || "No file chosen"}
              </span>
            </div>
            <input
              id="requested-product-image"
              type="file"
              accept="image/*"
              onChange={(event) =>
                setImageFile(event.target.files ? event.target.files[0] : null)
              }
              className="sr-only"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send request"}
          </button>
        </form>
      </div>
    </div>
  );
}
