# Forest Fire Prediction System

An AI-powered web application that predicts forest fire occurrences using real-time environmental data, satellite imagery, and machine learning models to provide early warnings and mitigate wildfire risks.

## Project Overview

This system analyzes weather conditions, vegetation dryness, and historical fire data to predict high-risk areas, helping governments, firefighters, and environmental organizations respond more effectively to potential fire outbreaks.

### Target Audience

- Government Agencies: For disaster preparedness and resource allocation
- Firefighters: To prioritize high-risk zones for monitoring and response
- Environmental Organizations: To track fire risks and advocate for preventive measures
- General Public: For awareness of fire risks in their area

## Features

- Real-Time Fire Risk Dashboard with interactive maps showing fire risk zones
- Early Warning System with alerts via email, SMS, or in-app notifications
- Fire Spread Prediction simulation based on current conditions and historical data
- Historical Fire Analysis to view past fire incidents and patterns
- User Customization for monitored regions and alert thresholds

Dashboard:
<img width="1763" alt="Screenshot 2025-03-28 at 5 20 50 PM" src="https://github.com/user-attachments/assets/22e434b0-da40-4af9-a86c-f69c5fbd2bd1" />




## Tech Stack

### Frontend
- React.js for interactive UI
- D3.js, Leaflet.js for visualizations and maps
- Tailwind CSS for styling

### Backend
- FastAPI with Python
- PostgreSQL for storing real-time fire risk data
- InfluxDB for time-series data

### AI/ML
- TensorFlow/PyTorch for model training and inference
- Models for satellite imagery analysis, time-series forecasting, and fire spread simulation

### Data Sources
- Satellite Data: NASA FIRMS, Sentinel-2, MODIS, VIIRS
- Meteorological Data: NOAA, ECMWF, NWS APIs
- Historical Fire Data: Kaggle datasets, government records

## Setup and Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- Docker and Docker Compose
- PostgreSQL (or SQLite for development)
- InfluxDB (optional)

### Quickstart
To quickly set up the entire system with test data, run the following commands:

```bash
# Clone the repository
git clone https://github.com/yourusername/forest-fire-prediction.git
cd forest-fire-prediction

# Run the setup script
cd backend
python scripts/run_all.py
```

This will:
1. Set up the necessary directories
2. Initialize the database
3. Import historical fire data
4. Fetch real-time fire data

### Backend Setup
1. Clone the repository
2. Navigate to the backend directory: `cd backend`
3. Create a virtual environment: `python -m venv venv`
4. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`
5. Install dependencies: `pip install -r requirements.txt`
6. Set up environment variables (copy `.env.example` to `.env` and fill in values)
7. Run the development server: `uvicorn app.main:app --reload`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Set up environment variables (copy `.env.example` to `.env` and fill in values)
4. Run the development server: `npm start`

### Docker Setup
1. Make sure Docker and Docker Compose are installed
2. Build and start the containers: `docker-compose up -d --build`

## Data Integration

The system includes scripts for importing and processing fire data:

### Available Scripts

- `scripts/setup.py`: Sets up the necessary directories and checks for required data files
- `scripts/init_db.py`: Initializes the database with required tables
- `scripts/import_historical_fire_data.py`: Imports historical fire data from USFS and NASA FIRMS
- `scripts/realtime_fire_data.py`: Fetches real-time fire data from NASA FIRMS, NIFC, and NOAA

### Running Data Scripts

To run the data scripts individually:

```bash
cd backend
python scripts/setup.py
python scripts/init_db.py
python scripts/import_historical_fire_data.py
python scripts/realtime_fire_data.py
```

For automatic updates, set up a cron job (Linux/macOS) or Task Scheduler (Windows) to run `realtime_fire_data.py` periodically.

### API Keys

Some data sources require API keys. Set these in your `.env` file:

```
NASA_FIRMS_API_KEY=your_api_key_here
NOAA_API_KEY=your_api_key_here
```

## API Documentation

Once the backend is running, API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Deployment

This application can be deployed using Docker containers to various cloud platforms:
- AWS
- Google Cloud Platform
- Heroku
- Firebase

Detailed deployment instructions are available in the `deployment` directory.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
