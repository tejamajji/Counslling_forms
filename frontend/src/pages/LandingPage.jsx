import React, { useState } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const LandingPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [facultyScroll, setFacultyScroll] = useState(0);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const scrollFaculty = (direction) => {
    const container = document.getElementById("facultyContainer");
    const cardWidth = 240; // Width of each faculty card + gap
    if (direction === "left") {
      setFacultyScroll((prev) => Math.max(prev - cardWidth, 0));
    } else {
      setFacultyScroll((prev) => Math.min(prev + cardWidth, container.scrollWidth - container.clientWidth));
    }
    container.scrollTo({ left: facultyScroll, behavior: "smooth" });
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Welcome to GVP-IT</h1>
          <p style={styles.heroSubtitle}>Revolutionizing IT Education</p>
          <button style={styles.button}>Explore Now</button>
        </div>
      </section>

      {/* Courses & Features Section */}
      <section style={styles.section}>
        <div style={styles.leftPanel}>
          <h2 style={styles.sectionTitleLeft}>Why Choose GVP-IT?</h2>
          <p style={styles.sectionText}>
            Industry-leading mentors, hands-on projects, and job-ready skills.
          </p>
          <ul style={styles.featureList}>
            <li style={styles.featureListItem}>Cutting-Edge Courses</li>
            <li style={styles.featureListItem}>Expert Instructors</li>
            <li style={styles.featureListItem}>100% Job Assistance</li>
          </ul>
        </div>
        <div style={styles.rightPanel}>
          <Carousel
            showThumbs={false}
            infiniteLoop
            autoPlay
            interval={3000}
            transitionTime={1000}
            showStatus={false}
            style={styles.carousel}
          >
            <div style={styles.carouselItem}>
              <h2>Industry-Aligned Curriculum</h2>
            </div>
            <div style={styles.carouselItem}>
              <h2>Live Projects & Case Studies</h2>
            </div>
            <div style={styles.carouselItem}>
              <h2>Internship & Job Placements</h2>
            </div>
          </Carousel>
        </div>
      </section>

      {/* Faculty Section */}
      <section style={styles.facultySection}>
        <h2 style={styles.sectionTitle}>Meet Our Faculty</h2>
        <div style={styles.facultyScrollContainer}>
          <button style={styles.scrollButtonLeft} onClick={() => scrollFaculty("left")}>
            &lt;
          </button>
          <div id="facultyContainer" style={styles.facultyContainer}>
            {[...Array(10)].map((_, index) => (
              <div key={index} style={styles.facultyCard}>
                <div style={styles.facultyImage}></div>
                <h4 style={styles.facultyName}>Faculty {index + 1}</h4>
                <p style={styles.facultyExpertise}>Expert in Subject</p>
              </div>
            ))}
          </div>
          <button style={styles.scrollButtonRight} onClick={() => scrollFaculty("right")}>
            &gt;
          </button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={styles.testimonialsSection}>
        <div style={styles.testimonialsContent}>
          <div style={styles.testimonialsImage}>
            <img
              src="https://www.gvpce.ac.in/slideshow/home/Homepageslideshowphotos/2.College&Departments/20.jpg"
              alt="Student"
              style={styles.testimonialImg}
            />
          </div>
          <div style={styles.testimonialsCards}>
            <h2 style={styles.sectionTitleLeft}>What Our Students Say</h2>
            <Carousel
              showThumbs={false}
              infiniteLoop
              autoPlay
              interval={3000}
              transitionTime={1000}
              showStatus={false}
              style={styles.carousel}
            >
              <div style={styles.testimonialItem}>
                <p>"GVP-IT changed my career! The courses are top-notch."</p>
                <h4>- John Doe</h4>
              </div>
              <div style={styles.testimonialItem}>
                <p>"The faculty is amazing, and the hands-on projects are very helpful."</p>
                <h4>- Jane Smith</h4>
              </div>
              <div style={styles.testimonialItem}>
                <p>"I got placed in a top company right after completing the course."</p>
                <h4>- Alex Johnson</h4>
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={styles.faqSection}>
        <h2 style={styles.sectionTitleLeft}>Frequently Asked Questions</h2>
        {["What courses do you offer?", "Do you provide certificates?", "How do I enroll?"].map(
          (question, index) => (
            <div key={index} style={styles.accordionItem}>
              <div
                onClick={() => toggleAccordion(index)}
                style={styles.accordionHeader}
              >
                {question}
              </div>
              {openIndex === index && (
                <div style={styles.accordionContent}>Answer for {question}</div>
              )}
            </div>
          )
        )}
      </section>
    </div>
  );
};

const styles = {
  container: {
    background: "linear-gradient(135deg, #141E30, #243B55)",
    color: "#fff",
    fontFamily: "'Poppins', sans-serif",
  },
  hero: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    background: "linear-gradient(135deg, #ff9a9e, #fad0c4, #fbc2eb, #a6c1ee, #84fab0)",
  },
  heroContent: {
    maxWidth: "800px",
    padding: "20px",
  },
  heroTitle: {
    fontSize: "48px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  heroSubtitle: {
    fontSize: "24px",
    marginBottom: "40px",
  },
  button: {
    background: "#E67E22",
    padding: "15px 30px",
    fontSize: "18px",
    borderRadius: "50px",
    border: "none",
    color: "white",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease",
  },
  section: {
    padding: "50px",
    background: "linear-gradient(135deg, #243B55, #141E30)",
  },
  leftPanel: {
    flex: 1,
    padding: "30px",
  },
  sectionTitle: {
    fontSize: "36px",
    fontWeight: "bold",
    marginBottom: "20px",
    textAlign: "center",
  },
  sectionTitleLeft: {
    fontSize: "36px",
    fontWeight: "bold",
    marginBottom: "20px",
    textAlign: "left",
  },
  sectionText: {
    fontSize: "18px",
    marginBottom: "30px",
  },
  featureList: {
    listStyle: "none",
    padding: 0,
  },
  featureListItem: {
    fontSize: "18px",
    marginBottom: "10px",
  },
  rightPanel: {
    flex: 1,
    textAlign: "center",
  },
  carousel: {
    borderRadius: "20px",
    overflow: "hidden",
  },
  carouselItem: {
    height: "300px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#34495E",
    borderRadius: "20px",
    color: "white",
    fontSize: "24px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  facultySection: {
    padding: "50px",
    background: "linear-gradient(135deg, #2C3E50, #34495E)",
  },
  facultyScrollContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  facultyContainer: {
    display: "flex",
    overflowX: "auto",
    gap: "20px",
    padding: "20px",
    scrollbarWidth: "none",
  },
  facultyCard: {
    minWidth: "200px",
    background: "#2C3E50",
    padding: "20px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  facultyImage: {
    width: "100%",
    height: "150px",
    background: "#7F8C8D",
    borderRadius: "10px",
    marginBottom: "15px",
  },
  facultyName: {
    fontSize: "20px",
    marginBottom: "10px",
  },
  facultyExpertise: {
    fontSize: "16px",
    color: "#E67E22",
  },
  scrollButtonLeft: {
    background: "#E67E22",
    border: "none",
    color: "white",
    padding: "10px",
    borderRadius: "50%",
    cursor: "pointer",
  },
  scrollButtonRight: {
    background: "#E67E22",
    border: "none",
    color: "white",
    padding: "10px",
    borderRadius: "50%",
    cursor: "pointer",
  },
  testimonialsSection: {
    padding: "50px",
    background: "linear-gradient(135deg, #243B55, #141E30)",
  },
  testimonialsContent: {
    display: "flex",
    alignItems: "center",
    gap: "40px",
  },
  testimonialsImage: {
    flex: 1,
  },
  testimonialImg: {
    width: "100%",
    borderRadius: "20px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  testimonialsCards: {
    flex: 2,
  },
  testimonialItem: {
    padding: "20px",
    background: "#34495E",
    borderRadius: "20px",
    textAlign: "center",
    color: "white",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  faqSection: {
    padding: "50px",
    background: "linear-gradient(135deg, #2C3E50, #34495E)",
  },
  accordionItem: {
    marginBottom: "10px",
    border: "1px solid #E67E22",
    borderRadius: "10px",
    overflow: "hidden",
  },
  accordionHeader: {
    background: "#E67E22",
    color: "white",
    padding: "15px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
    transition: "background 0.3s ease",
  },
  accordionContent: {
    padding: "15px",
    background: "#F9F9F9",
    color: "#333",
    fontSize: "16px",
    transition: "max-height 0.3s ease",
  },
};

export default LandingPage;