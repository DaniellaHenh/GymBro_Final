import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="homepage-container">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1>מצא את <span className="highlight">שותף האימון</span> המושלם</h1>
            <p>הפלטפורמה המובילה לחיבור בין מתאמנים, יצירת קבוצות אימון ושיתוף חוויות כושר</p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn primary">הצטרף עכשיו</Link>
              <Link to="/login" className="btn outline">התחבר</Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2>למה להשתמש ב-FitPartner?</h2>
          <div className="features">
            <div className="feature">
              <h3>מצא שותפים לאימון</h3>
              <p>חפש שותפים לאימון לפי מיקום, סוג אימון ושעות זמינות שמתאימות לך</p>
            </div>
            <div className="feature">
              <h3>הצטרף לקבוצות אימון</h3>
              <p>מצא קבוצות אימון באזורך או צור קבוצה משלך והזמן אחרים להצטרף</p>
            </div>
            <div className="feature">
              <h3>תאם אימונים בקלות</h3>
              <p>תאם אימונים עם שותפים וקבוצות בקלות באמצעות מערכת הצ'אט המובנית</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <h2>מוכנים להתחיל?</h2>
          <p>הצטרפו לקהילת המתאמנים הגדולה בישראל ומצאו את שותפי האימון המושלמים עבורכם</p>
          <Link to="/signup">הרשם עכשיו</Link>
        </section>
      </main>
    </div>
  );
}
