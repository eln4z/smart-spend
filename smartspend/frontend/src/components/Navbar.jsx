import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useData } from "../context/DataContext";

export default function Navbar() {
  const { darkMode, transactions } = useData();
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1)); // February 2026
  const [selectedDate, setSelectedDate] = useState(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Years to show in picker (2020-2030)
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

  const linkStyle = ({ isActive }) => ({
    marginRight: 28,
    textDecoration: "none",
    fontWeight: isActive ? 600 : 500,
    color: isActive ? "#6c5ce7" : (darkMode ? "#bbb" : "#555"),
    fontSize: 15,
    padding: "8px 0",
    borderBottom: isActive ? "2px solid #6c5ce7" : "2px solid transparent"
  });

  const iconBtnStyle = {
    background: darkMode ? "#2a2a4e" : "#f0f0f0",
    border: "none",
    padding: "8px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    textDecoration: "none",
    color: darkMode ? "#ddd" : "#555"
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Get transactions for a specific date
  const getTransactionsForDate = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return transactions.filter(t => t.date === dateStr);
  };

  // Check if date has transactions
  const hasTransactions = (day) => {
    return getTransactionsForDate(day).length > 0;
  };

  // Format month name
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

  // Navigate months
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  // Build calendar grid
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];
  
  // Empty cells for days before first of month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const selectedDateTransactions = selectedDate ? getTransactionsForDate(selectedDate) : [];

  return (
    <div style={{
      background: darkMode ? "#16213e" : "white",
      padding: "0 40px",
      display: "flex",
      alignItems: "center",
      boxShadow: darkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.06)",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <span style={{ 
        fontWeight: 700, 
        fontSize: 24, 
        marginRight: 60,
        color: "#6c5ce7",
        padding: "20px 0"
      }}>
        💰 SmartSpend
      </span>
      <nav style={{ display: "flex" }}>
        <NavLink to="/" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/breakdown" style={linkStyle}>Breakdown</NavLink>
        <NavLink to="/prediction" style={linkStyle}>Prediction</NavLink>
        <NavLink to="/categories" style={linkStyle}>Categories</NavLink>
      </nav>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
        <button 
          onClick={() => setShowCalendar(!showCalendar)}
          style={{ 
            background: darkMode ? "#2a2a4e" : "#f0f0f0",
            border: "none",
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            color: darkMode ? "#ddd" : "#555"
          }}
        >
          📅 {currentMonthName}
        </button>

        {/* Calendar Dropdown */}
        {showCalendar && (
          <div style={{
            position: "absolute",
            top: "100%",
            right: 100,
            marginTop: 8,
            background: darkMode ? "#16213e" : "white",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            padding: 20,
            width: selectedDate ? 600 : 320,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: 0
          }}>
            {/* Close Button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button
                onClick={() => { setShowCalendar(false); setSelectedDate(null); setShowMonthPicker(false); setShowYearPicker(false); }}
                style={{
                  background: darkMode ? "#e74c3c" : "#e74c3c",
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
            </div>
            
            <div style={{ display: "flex", gap: 20 }}>
            {/* Calendar Grid */}
            <div style={{ flex: selectedDate ? "0 0 280px" : "1" }}>
              {/* Month Navigation */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <button 
                  onClick={prevMonth}
                  style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: darkMode ? "#ddd" : "#333" }}
                >
                  ◀
                </button>
                <div style={{ display: "flex", gap: 8, position: "relative" }}>
                  {/* Month Selector */}
                  <button
                    onClick={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }}
                    style={{ 
                      background: showMonthPicker ? "#6c5ce7" : (darkMode ? "#2a2a4e" : "#f0f0f0"),
                      color: showMonthPicker ? "white" : (darkMode ? "#fff" : "#333"),
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 14
                    }}
                  >
                    {monthNames[currentMonth.getMonth()]}
                  </button>
                  {/* Year Selector */}
                  <button
                    onClick={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }}
                    style={{ 
                      background: showYearPicker ? "#6c5ce7" : (darkMode ? "#2a2a4e" : "#f0f0f0"),
                      color: showYearPicker ? "white" : (darkMode ? "#fff" : "#333"),
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 14
                    }}
                  >
                    {currentMonth.getFullYear()}
                  </button>

                  {/* Month Picker Dropdown */}
                  {showMonthPicker && (
                    <div style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: 8,
                      background: darkMode ? "#1a1a2e" : "white",
                      borderRadius: 8,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      padding: 8,
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 4,
                      zIndex: 1001,
                      width: 180
                    }}>
                      {monthNames.map((month, i) => (
                        <button
                          key={month}
                          onClick={() => {
                            setCurrentMonth(new Date(currentMonth.getFullYear(), i, 1));
                            setShowMonthPicker(false);
                            setSelectedDate(null);
                          }}
                          style={{
                            padding: "8px 4px",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 12,
                            background: i === currentMonth.getMonth() ? "#6c5ce7" : "transparent",
                            color: i === currentMonth.getMonth() ? "white" : (darkMode ? "#ddd" : "#333"),
                            fontWeight: i === currentMonth.getMonth() ? 600 : 400
                          }}
                        >
                          {month.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Year Picker Dropdown */}
                  {showYearPicker && (
                    <div style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      marginTop: 8,
                      background: darkMode ? "#1a1a2e" : "white",
                      borderRadius: 8,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      padding: 8,
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 4,
                      zIndex: 1001,
                      width: 150
                    }}>
                      {years.map(year => (
                        <button
                          key={year}
                          onClick={() => {
                            setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
                            setShowYearPicker(false);
                            setSelectedDate(null);
                          }}
                          style={{
                            padding: "8px 4px",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 12,
                            background: year === currentMonth.getFullYear() ? "#6c5ce7" : "transparent",
                            color: year === currentMonth.getFullYear() ? "white" : (darkMode ? "#ddd" : "#333"),
                            fontWeight: year === currentMonth.getFullYear() ? 600 : 400
                          }}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  onClick={nextMonth}
                  style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: darkMode ? "#ddd" : "#333" }}
                >
                  ▶
                </button>
              </div>

              {/* Day Headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} style={{ textAlign: "center", fontSize: 12, color: "#888", fontWeight: 500 }}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {days.map((day, i) => (
                  <div 
                    key={i}
                    onClick={() => day && setSelectedDate(day === selectedDate ? null : day)}
                    style={{
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      cursor: day ? "pointer" : "default",
                      fontSize: 14,
                      fontWeight: day && hasTransactions(day) ? 600 : 400,
                      background: day === selectedDate 
                        ? "#6c5ce7" 
                        : day && hasTransactions(day) 
                          ? (darkMode ? "#3a3a6e" : "#e8f4fc")
                          : "transparent",
                      color: day === selectedDate 
                        ? "white" 
                        : day && hasTransactions(day)
                          ? "#6c5ce7"
                          : (darkMode ? "#ddd" : "#333"),
                      transition: "all 0.2s"
                    }}
                  >
                    {day}
                    {day && hasTransactions(day) && day !== selectedDate && (
                      <span style={{
                        position: "absolute",
                        bottom: 2,
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "#6c5ce7"
                      }} />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16, fontSize: 12, color: "#888", textAlign: "center" }}>
                💡 Days with transactions are highlighted
              </div>
            </div>

            {/* Selected Date Transactions */}
            {selectedDate && (
              <div style={{ flex: 1, borderLeft: darkMode ? "1px solid #3a3a6e" : "1px solid #eee", paddingLeft: 20 }}>
                <h4 style={{ marginBottom: 12, color: darkMode ? "#fff" : "#333" }}>
                  📋 {selectedDate} {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h4>
                {selectedDateTransactions.length > 0 ? (
                  <div style={{ maxHeight: 250, overflowY: "auto" }}>
                    {selectedDateTransactions.map(t => (
                      <div 
                        key={t.id}
                        style={{
                          padding: "12px",
                          background: darkMode ? "#1a1a2e" : "#f8f9fa",
                          borderRadius: 8,
                          marginBottom: 8
                        }}
                      >
                        <div style={{ fontWeight: 500, color: darkMode ? "#fff" : "#333" }}>{t.description}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                          <span style={{ 
                            fontSize: 12, 
                            background: darkMode ? "#2a2a4e" : "#e8f4fc", 
                            padding: "2px 8px", 
                            borderRadius: 8,
                            color: "#6c5ce7"
                          }}>
                            {t.category}
                          </span>
                          <span style={{ fontWeight: 600, color: "#e74c3c" }}>£{t.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#888", fontSize: 14 }}>No transactions on this day</p>
                )}
              </div>
            )}
            </div>
          </div>
        )}

        <NavLink to="/settings" style={iconBtnStyle}>⚙️ Settings</NavLink>
        <NavLink to="/profile" style={{
          ...iconBtnStyle,
          background: "#6c5ce7",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          👤 Profile
        </NavLink>
      </div>
    </div>
  );
}
