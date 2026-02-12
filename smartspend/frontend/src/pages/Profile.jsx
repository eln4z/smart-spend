import { useState, useEffect } from "react";

export default function Profile() {
  // Load user from localStorage or use defaults
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("smartspend_user");
    return saved ? JSON.parse(saved) : {
      name: "Elnaz Mohammadi",
      email: "elnaz.mohammadi@email.com",
      dateOfBirth: "1999-05-15",
      phone: "+44 7123 456789",
      occupation: "Professional",
      monthlyBudget: 1500,
      currency: "GBP (£)"
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...user });

  // Save to localStorage when user changes
  useEffect(() => {
    localStorage.setItem("smartspend_user", JSON.stringify(user));
  }, [user]);

  const handleSave = () => {
    setUser({ ...editForm });
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleCancel = () => {
    setEditForm({ ...user });
    setIsEditing(false);
  };

  const stats = {
    totalTransactions: 156,
    categoriesUsed: 8,
    averageMonthlySpend: 1240,
    memberSince: "September 2024"
  };

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>My Profile</h1>
      <p style={{ color: "#888", marginBottom: 32 }}>Manage your account information</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Profile Info */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 32,
              fontWeight: 700,
              marginRight: 20
            }}>
              {user.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <h2 style={{ marginBottom: 4 }}>{user.name}</h2>
              <p style={{ color: "#888" }}>{user.email}</p>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Personal Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ color: "#888", fontSize: 13, marginBottom: 4 }}>Date of Birth</div>
                <div style={{ fontWeight: 500 }}>{user.dateOfBirth}</div>
              </div>
              <div>
                <div style={{ color: "#888", fontSize: 13, marginBottom: 4 }}>Phone</div>
                <div style={{ fontWeight: 500 }}>{user.phone}</div>
              </div>
              <div>
                <div style={{ color: "#888", fontSize: 13, marginBottom: 4 }}>Occupation</div>
                <div style={{ fontWeight: 500 }}>{user.occupation || "Not set"}</div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 20, marginTop: 20 }}>
            <h3 style={{ marginBottom: 16 }}>💰 Budget Settings</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ color: "#888", fontSize: 13, marginBottom: 4 }}>Monthly Budget</div>
                <div style={{ fontWeight: 500, fontSize: 20, color: "#6c5ce7" }}>£{user.monthlyBudget}</div>
              </div>
              <div>
                <div style={{ color: "#888", fontSize: 13, marginBottom: 4 }}>Currency</div>
                <div style={{ fontWeight: 500 }}>{user.currency}</div>
              </div>
            </div>
          </div>

          <button 
            className="btn" 
            style={{ marginTop: 24, width: "100%" }}
            onClick={() => { setEditForm({ ...user }); setIsEditing(true); }}
          >
            ✏️ Edit Profile
          </button>
        </div>

        {/* Stats & Activity */}
        <div>
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>📊 Your Statistics</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: "#f8f9fa", padding: 16, borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#6c5ce7" }}>{stats.totalTransactions}</div>
                <div style={{ color: "#888", fontSize: 13 }}>Total Transactions</div>
              </div>
              <div style={{ background: "#f8f9fa", padding: 16, borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#6c5ce7" }}>{stats.categoriesUsed}</div>
                <div style={{ color: "#888", fontSize: 13 }}>Categories Used</div>
              </div>
              <div style={{ background: "#f8f9fa", padding: 16, borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#6c5ce7" }}>£{stats.averageMonthlySpend}</div>
                <div style={{ color: "#888", fontSize: 13 }}>Avg Monthly Spend</div>
              </div>
              <div style={{ background: "#f8f9fa", padding: 16, borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#6c5ce7" }}>5</div>
                <div style={{ color: "#888", fontSize: 13 }}>Months Active</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>🏆 Achievements</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "#f0fff4", borderRadius: 8 }}>
                <span style={{ fontSize: 24 }}>🌟</span>
                <div>
                  <div style={{ fontWeight: 500 }}>First Month Complete</div>
                  <div style={{ color: "#888", fontSize: 13 }}>Tracked spending for a full month</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "#ebf5ff", borderRadius: 8 }}>
                <span style={{ fontSize: 24 }}>📊</span>
                <div>
                  <div style={{ fontWeight: 500 }}>Category Master</div>
                  <div style={{ color: "#888", fontSize: 13 }}>Used all spending categories</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "#fff5eb", borderRadius: 8 }}>
                <span style={{ fontSize: 24 }}>💪</span>
                <div>
                  <div style={{ fontWeight: 500 }}>Under Budget</div>
                  <div style={{ color: "#888", fontSize: 13 }}>Stayed under budget for 3 months</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{ 
            background: "white", 
            padding: 32, 
            borderRadius: 12, 
            width: 500, 
            maxWidth: "90%",
            maxHeight: "90vh",
            overflowY: "auto",
            position: "relative"
          }}>
            {/* Close Button */}
            <button
              onClick={handleCancel}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "#e74c3c",
                color: "white",
                border: "none",
                borderRadius: 6,
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500
              }}
            >
              ✕ Close
            </button>

            <h2 style={{ marginBottom: 24 }}>✏️ Edit Profile</h2>
            
            {/* Personal Information */}
            <h4 style={{ marginBottom: 12, color: "#666" }}>Personal Information</h4>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Full Name</label>
              <input 
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                style={{ width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 8 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Email Address</label>
              <input 
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                style={{ width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 8 }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Date of Birth</label>
                <input 
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                  style={{ width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 8 }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Phone Number</label>
                <input 
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  style={{ width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 8 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Occupation</label>
              <input 
                type="text"
                value={editForm.occupation || ""}
                onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                placeholder="e.g., Software Developer, Student, Designer"
                style={{ width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 8 }}
              />
            </div>

            {/* Budget Settings */}
            <h4 style={{ marginBottom: 12, marginTop: 24, color: "#666" }}>Budget Settings</h4>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Monthly Budget (£)</label>
                <input 
                  type="number"
                  value={editForm.monthlyBudget}
                  onChange={(e) => setEditForm({ ...editForm, monthlyBudget: Number(e.target.value) })}
                  style={{ width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 8 }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Currency</label>
                <select
                  value={editForm.currency}
                  onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                  style={{ width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 8 }}
                >
                  <option>GBP (£)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button 
                className="btn" 
                style={{ background: "#eee", color: "#555" }}
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button className="btn" onClick={handleSave}>
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}