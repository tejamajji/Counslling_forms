// LandingPage.js
import React from 'react';

const LandingPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heading}>Welcome to GVP-IT</h1>
          <p style={styles.subHeading}>Empowering Education, One Step at a Time</p>
          <p style={styles.description}>Join our community and experience the future of learning. Courses designed to boost your skills and career.</p>
          <a href="#learn-more" style={styles.button}>Learn More</a>
        </div>
      </section>

      {/* Batches Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Batches</h2>
        <div style={styles.batchContainer}>
          <div style={styles.batchCard}>
            <h3 style={styles.batchTitle}>Beginner's Batch</h3>
            <p style={styles.batchDescription}>Perfect for those starting their coding journey. Learn the fundamentals of programming.</p>
          </div>
          <div style={styles.batchCard}>
            <h3 style={styles.batchTitle}>Intermediate Batch</h3>
            <p style={styles.batchDescription}>Take your skills to the next level with more complex concepts and real-world examples.</p>
          </div>
          <div style={styles.batchCard}>
            <h3 style={styles.batchTitle}>Advanced Batch</h3>
            <p style={styles.batchDescription}>For those ready to master advanced topics and build professional projects.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>What Our Students Say</h2>
        <div style={styles.testimonialsContainer}>
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialText}>"GVP-IT changed the way I look at education. The hands-on experience is priceless!"</p>
            <p style={styles.studentName}>- Sarah Lee</p>
          </div>
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialText}>"Thanks to GVP-IT, I landed my dream job in tech. The course materials are top-notch!"</p>
            <p style={styles.studentName}>- John Doe</p>
          </div>
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialText}>"The instructors are knowledgeable and approachable. A great experience overall!"</p>
            <p style={styles.studentName}>- Emily Tran</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>About Us</h2>
        <p style={styles.aboutText}>
          GVP-IT is committed to delivering the highest quality educational experience. Our courses are designed to help students
          acquire skills that will make them successful in the ever-evolving tech industry. We offer a variety of courses tailored
          for different levels of expertise, from beginner to advanced.
        </p>
        <a href="#contact" style={styles.button}>Contact Us</a>
      </section>
    </div>
  );
};

// Inline CSS styles
const styles = {
  hero: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#007bff',
    color: '#fff',
    textAlign: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
  },
  heroContent: {
    maxWidth: '600px',
  },
  heading: {
    fontSize: '50px',
    fontWeight: 'bold',
    marginBottom: '10px',
    textTransform: 'uppercase',
  },
  subHeading: {
    fontSize: '24px',
    marginBottom: '20px',
    fontWeight: 'lighter',
  },
  description: {
    fontSize: '16px',
    marginBottom: '30px',
    lineHeight: '1.5',
  },
  button: {
    backgroundColor: '#fff',
    color: '#007bff',
    padding: '12px 25px',
    fontSize: '18px',
    fontWeight: 'bold',
    textDecoration: 'none',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease',
  },
  section: {
    padding: '60px 20px',
    backgroundColor: '#f4f4f4',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  batchContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '20px',
  },
  batchCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    width: '30%',
  },
  batchTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  batchDescription: {
    fontSize: '16px',
  },
  testimonialsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '20px',
    flexWrap: 'wrap',
  },
  testimonialCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    width: '30%',
    margin: '10px 0',
  },
  testimonialText: {
    fontSize: '16px',
    fontStyle: 'italic',
    marginBottom: '10px',
  },
  studentName: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  aboutText: {
    fontSize: '16px',
    marginBottom: '20px',
  },
};

export default LandingPage;
