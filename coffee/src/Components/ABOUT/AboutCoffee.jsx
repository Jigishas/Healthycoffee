import React from 'react';
import './AboutCoffee.css';

const faqs = [
  {
    question: "Where does coffee originate?",
    answer: "Coffee originated in Ethiopia and spread to the Arabian Peninsula, eventually becoming a global beverage."
  },
  {
    question: "What is the difference between Arabica and Robusta beans?",
    answer: "Arabica beans are smoother and have higher acidity, while Robusta beans are stronger, more bitter, and contain more caffeine."
  },
  {
    question: "How should coffee beans be stored?",
    answer: "Store coffee beans in an airtight container, away from light, heat, and moisture to preserve freshness."
  },
  {
    question: "Is coffee good for health?",
    answer: "Moderate coffee consumption is linked to several health benefits, including improved alertness and antioxidants, but excessive intake may cause side effects."
  }
];

const AboutCoffee = () => {
  return (
    <div className="about-coffee-container" id="about-coffee">
      <h1>About Coffee</h1>
      <div className="about-coffee-content">
        <section>
          <h2>What is Coffee?</h2>
          <p>
            Coffee is a brewed beverage prepared from roasted coffee beans, the seeds of berries from certain Coffea species. It is enjoyed worldwide for its rich flavor, energizing effect, and cultural significance.
          </p>
        </section>
        <section>
          <h2>Types of Coffee Beans</h2>
          <ul>
            <li><strong>Arabica:</strong> Smooth, mild flavor, higher acidity.</li>
            <li><strong>Robusta:</strong> Strong, bold taste, higher caffeine.</li>
            <li><strong>Liberica:</strong> Unique floral aroma, rare variety.</li>
          </ul>
        </section>
        <section>
          <h2>Health Benefits</h2>
          <ul>
            <li>Rich in antioxidants</li>
            <li>May improve energy and focus</li>
            <li>Linked to lower risk of certain diseases</li>
          </ul>
        </section>
        <section>
          <h2>Coffee Culture</h2>
          <p>
            Coffee is more than a drink—it's a global culture. From Italian espresso bars to Ethiopian coffee ceremonies, coffee brings people together and inspires creativity.
          </p>
        </section>
        <section className="about-faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="about-faq-list">
            {faqs.map((faq, idx) => (
              <div className="about-faq-item" key={idx}>
                <div className="about-faq-question">{faq.question}</div>
                <div className="about-faq-answer">{faq.answer}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutCoffee;