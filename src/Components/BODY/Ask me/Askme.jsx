import React from 'react'
import './Askme.css'

const Askme = () => {
  return (  
      <div className="container">
        <header>
            <h1>Coffee Plantation FAQs</h1>
            
        </header>
        
        <div className="faq-container">
            <h2 className="faq-title">Frequently Asked Questions</h2>
            
            <div className="faq-item">
                <input type="checkbox" id="faq1" className="faq-input" />
                <label htmlFor="faq1" className="faq-question">What are the ideal growing conditions for coffee plants?</label>
                <div className="faq-answer">
                    <p>Coffee plants thrive in specific conditions often called the "coffee belt" between the Tropics of Cancer and Capricorn. Ideal conditions include:</p>
                    <ul>
                        <li><strong>Temperature:</strong> 15-24°C (59-75°F) for Arabica, 24-30°C (75-86°F) for Robusta</li>
                        <li><strong>Altitude:</strong> 600-2,000 meters (2,000-6,500 ft) above sea level</li>
                        <li><strong>Rainfall:</strong> 1,500-2,500 mm (60-100 in) annually, well-distributed</li>
                        <li><strong>Soil:</strong> Volcanic, well-draining, pH 6-6.5, rich in organic matter</li>
                        <li><strong>Sunlight:</strong> Filtered sunlight or partial shade (especially for young plants)</li>
                    </ul>
                </div>
            </div>
            
            <div className="faq-item">
                <input type="checkbox" id="faq2" className="faq-input" />
                <label htmlFor="faq2" className="faq-question">How long does it take for a coffee plant to produce beans?</label>
                <div className="faq-answer">
                    <p>It typically takes 3 to 4 years for a newly planted coffee tree to begin bearing fruit. The coffee cherries will initially be green and then turn red when ripe and ready for harvesting. A single coffee tree can produce approximately 2,000 coffee cherries annually, which amounts to about 4,000 beans or roughly one pound of roasted coffee.</p>
                </div>
            </div>
            
            <div className="faq-item">
                <input type="checkbox" id="faq3" className="faq-input" />
                <label htmlFor="faq3" className="faq-question">What's the difference between Arabica and Robusta coffee plants?</label>
                <div className="faq-answer">
                    <p>Arabica and Robusta are the two main species of coffee plants cultivated for consumption:</p>
                    <ul>
                        <li><strong>Arabica (Coffea arabica):</strong> Accounts for about 60-70% of global production. It has a smoother, more complex flavor with higher acidity. It contains about 1.5% caffeine and grows best at higher altitudes.</li>
                        <li><strong>Robusta (Coffea canephora):</strong> Has a stronger, more bitter taste with higher caffeine content (about 2.7%). It's more disease-resistant and easier to cultivate, thriving at lower altitudes with higher yields.</li>
                    </ul>
                </div>
            </div>
            
            <div className="faq-item">
                <input type="checkbox" id="faq4" className="faq-input" />
                <label htmlFor="faq4" className="faq-question">How are coffee beans harvested and processed?</label>
                <div className="faq-answer">
                    <p>There are two primary methods for harvesting coffee:</p>
                    <ol>
                        <li><strong>Strip Picking:</strong> All cherries are stripped off the branch at once, either by machine or by hand.</li>
                        <li><strong>Selective Picking:</strong> Only the ripe cherries are harvested individually by hand, with multiple passes done every 8-10 days.</li>
                    </ol>
                    <p>After harvesting, coffee beans are processed using either:</p>
                    <ul>
                        <li><strong>Dry Method:</strong> Cherries are spread out in the sun to dry for 2-3 weeks</li>
                        <li><strong>Wet Method:</strong> Pulp is removed from the cherry before the beans are dried</li>
                    </ul>
                </div>
            </div>
            
            <div className="faq-item">
                <input type="checkbox" id="faq5" className="faq-input" />
                <label htmlFor="faq5" className="faq-question">What are the main challenges in coffee farming?</label>
                <div className="faq-answer">
                    <p>Coffee farmers face several significant challenges:</p>
                    <ul>
                        <li><strong>Climate Change:</strong> Rising temperatures and unpredictable rainfall patterns affect yield and quality</li>
                        <li><strong>Pests and Diseases:</strong> Coffee leaf rust, berry borer beetles, and other pathogens can devastate crops</li>
                        <li><strong>Price Volatility:</strong> Global coffee prices fluctuate significantly, affecting farmer income</li>
                        <li><strong>Labor Intensive:</strong> Coffee harvesting requires substantial manual labor</li>
                        <li><strong>Water Management:</strong> Traditional processing methods can consume large amounts of water</li>
                    </ul>
                </div>
            </div>
            
            <div className="faq-item">
                <input type="checkbox" id="faq6" className="faq-input" />
                <label htmlFor="faq6" className="faq-question">What is shade-grown coffee and why is it important?</label>
                <div className="faq-answer">
                    <p>Shade-grown coffee is cultivated under a canopy of trees, which provides several benefits:</p>
                    <ul>
                        <li><strong>Biodiversity:</strong> Provides habitat for birds and other wildlife</li>
                        <li><strong>Soil Health:</strong> Trees help prevent soil erosion and maintain fertility</li>
                        <li><strong>Natural Pest Control:</strong> Birds and insects in the canopy help control pests</li>
                        <li><strong>Microclimate:</strong> Trees provide wind protection and temperature regulation</li>
                        <li><strong>Quality:</strong> Slower berry maturation often results in more complex flavors</li>
                    </ul>
                    <p>While shade-grown coffee typically has lower yields than sun-grown varieties, it's generally more sustainable and environmentally friendly.</p>
                </div>
            </div>
            
            <div className="coffee-types">
                <div className="coffee-type">
                    <h3>Arabica</h3>
                    <p>Smooth, complex flavor<br />Higher acidity<br />1.5% caffeine<br />Grows at higher altitudes</p>
                </div>
                
                <div className="coffee-type">
                    <h3>Robusta</h3>
                    <p>Strong, bold flavor<br />Higher caffeine (2.7%)<br />Disease resistant<br />Grows at lower altitudes</p>
                </div>
                
                <div className="coffee-type">
                    <h3>Liberica</h3>
                    <p>Unique floral aroma<br />Woody, smoky flavor<br />Heat tolerant<br />Rare variety</p>
                </div>
            </div>
            
            <div className="faq-item">
                <input type="checkbox" id="faq7" className="faq-input" />
                <label htmlFor="faq7" className="faq-question">How does altitude affect coffee flavor?</label>
                <div className="faq-answer">
                    <p>Altitude significantly impacts coffee quality and flavor profile:</p>
                    <ul>
                        <li><strong>High Altitude (1,200m+):</strong> Slower bean maturation develops more complex sugars, resulting in better acidity, aroma, and flavor. Beans are typically denser and harder.</li>
                        <li><strong>Medium Altitude (600-1,200m):</strong> Balance between yield and quality, often with good body and mild acidity.</li>
                        <li><strong>Low Altitude (0-600m):</strong> Faster maturation produces softer, less complex beans often with more bitter notes.</li>
                    </ul>
                    <p>The temperature decrease at higher elevations (approximately 1°C per 165m altitude gain) slows the growth cycle, allowing more time for flavor development.</p>
                </div>
            </div>
            
            <div className="faq-item">
                <input type="checkbox" id="faq8" className="faq-input" />
                <label htmlFor="faq8" className="faq-question">What is the coffee cherry and how is it structured?</label>
                <div className="faq-answer">
                    <p>The coffee cherry is the fruit of the coffee plant, and it has several layers:</p>
                    <ol>
                        <li><strong>Outer Skin:</strong> Thin red or yellow skin (exocarp)</li>
                        <li><strong>Pulp:</strong> Sweet, fruity flesh (mesocarp)</li>
                        <li><strong>Pectin Layer:</strong> Mucilaginous layer rich in sugars</li>
                        <li><strong>Parchment:</strong> Protective hull around the bean (endocarp)</li>
                        <li><strong>Silver Skin:</strong> Thin membrane covering the bean</li>
                        <li><strong>Bean:</strong> Actually the seed of the fruit - usually two per cherry</li>
                    </ol>
                    <p>Processing coffee involves removing these outer layers to get to the green coffee beans inside.</p>
                </div>
            </div>
        </div>

        
    
     </div> 
  )
}

export default Askme;
