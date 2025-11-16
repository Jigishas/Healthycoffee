# Coffee Plantation React Website

A modern, responsive React website for coffee lovers, featuring information about coffee, FAQs, image slider, statistics, WhatsApp integration, and contact details.

## Features

- **Home Page:** Introduction and highlights about coffee.
- **About Coffee:** Learn about coffee types, health benefits, culture, and FAQs.
- **Image Slider:** Beautiful slideshow of coffee images.
- **Statistics:** Coffee-related stats and facts.
- **Ask Me / WhatsApp:** Ask questions or contact via WhatsApp.
- **Contact Us:** Reach out via WhatsApp or email (`jigishaflamings336@gmail.com`).
- **Footer:** Quick links, subscribe form, and "Powered by HealthyCoffee".

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jigisha336/coffee-plantation.git
   cd coffee-plantation
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser and navigate to `http://localhost:5173`**

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Build and start the container:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

3. **Stop the container:**
   ```bash
   docker-compose down
   ```

### Using Docker Directly

1. **Build the Docker image:**
   ```bash
   docker build -t coffee-react-app .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:80 coffee-react-app
   ```

3. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
coffee/
├── src/
│   ├── Components/
│   │   ├── ABOUT/
│   │   ├── BODY/
│   │   ├── contact us/
│   │   ├── footer/
│   │   └── Navbar/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── public/
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
└── package.json
```

## Technologies Used

- React 19
- Vite
- React Router DOM
- CSS3
- Docker
- Nginx

## License

This project is licensed under the MIT License.
