import { useEffect, useState } from "react";
import { API } from "../../lib/apiConfig";

export default function ShopkeeperSettings() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ------------------ LOAD PROFILE ------------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/auth/me");
        const u = res.data.user;

        setForm({
          username: u.username || "",
          email: u.email || "",
          phone: u.phone || "",
          address: u.addresses?.[0]?.address || "",
          city: u.addresses?.[0]?.city || "",
          state: u.addresses?.[0]?.state || "",
          zip: u.addresses?.[0]?.zip || "",
        });
      } catch (err) {
        console.error("❌ Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ------------------ UPDATE FIELD ------------------
  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ------------------ SAVE PROFILE ------------------
  const handleSave = async () => {
    // Basic validation
    if (!form.username.trim()) return alert("Username is required");
    if (!form.phone.trim()) return alert("Phone number is required");

    try {
      setSaving(true);
      await API.put("/auth/update-profile", form);

      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6">Loading profile...</p>;

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-green-700">Shopkeeper Profile</h1>

      <ProfileInput
        label="Username"
        value={form.username}
        onChange={(e) => updateField("username", e.target.value)}
      />

      <ProfileInput
        label="Email"
        value={form.email}
        disabled
      />

      <ProfileInput
        label="Phone"
        value={form.phone}
        onChange={(e) => updateField("phone", e.target.value)}
      />

      <h2 className="text-xl font-semibold mt-6">Address</h2>

      <ProfileInput
        label="Address"
        value={form.address}
        onChange={(e) => updateField("address", e.target.value)}
      />
      <ProfileInput
        label="City"
        value={form.city}
        onChange={(e) => updateField("city", e.target.value)}
      />
      <ProfileInput
        label="State"
        value={form.state}
        onChange={(e) => updateField("state", e.target.value)}
      />
      <ProfileInput
        label="ZIP"
        value={form.zip}
        onChange={(e) => updateField("zip", e.target.value)}
      />

      <button
        onClick={handleSave}
        disabled={saving}
        className={`bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition ${
          saving ? "opacity-60" : "hover:bg-green-700"
        }`}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

function ProfileInput({ label, ...rest }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-gray-600 font-medium">{label}</label>
      <input
        {...rest}
        className="p-3 border rounded-md focus:border-green-500 outline-none"
      />
    </div>
  );
}
