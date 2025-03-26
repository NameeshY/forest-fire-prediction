import os
from typing import Any, Dict, List, Optional

from pydantic import BaseSettings, validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "Forest Fire Prediction System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    # Database Settings
    # Use SQLite for development
    USE_SQLITE: bool = os.getenv("USE_SQLITE", "True").lower() == "true"
    SQLITE_DB_PATH: str = os.getenv("SQLITE_DB_PATH", "app.db")
    
    # PostgreSQL settings (used if USE_SQLITE is False)
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "forest_fire_db")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_uri(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        
        if values.get("USE_SQLITE"):
            # Use SQLite
            return f"sqlite:///{values.get('SQLITE_DB_PATH')}"
        else:
            # Use PostgreSQL
            return f"postgresql://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}@{values.get('POSTGRES_SERVER')}:{values.get('POSTGRES_PORT')}/{values.get('POSTGRES_DB')}"

    # InfluxDB Settings
    INFLUXDB_URL: str = os.getenv("INFLUXDB_URL", "http://localhost:8086")
    INFLUXDB_TOKEN: str = os.getenv("INFLUXDB_TOKEN", "my-token")
    INFLUXDB_ORG: str = os.getenv("INFLUXDB_ORG", "my-org")
    INFLUXDB_BUCKET: str = os.getenv("INFLUXDB_BUCKET", "forest_fire_data")

    # External API Keys
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")
    NASA_API_KEY: str = os.getenv("NASA_API_KEY", "")
    
    # Notification Settings
    EMAIL_SENDER: str = os.getenv("EMAIL_SENDER", "")
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "")
    EMAIL_SERVER: str = os.getenv("EMAIL_SERVER", "smtp.gmail.com")
    EMAIL_PORT: int = int(os.getenv("EMAIL_PORT", "587"))
    
    # IoT and MQTT Settings
    MQTT_BROKER_URL: str = os.getenv("MQTT_BROKER_URL", "localhost")
    MQTT_BROKER_PORT: int = int(os.getenv("MQTT_BROKER_PORT", "1883"))
    MQTT_USERNAME: str = os.getenv("MQTT_USERNAME", "")
    MQTT_PASSWORD: str = os.getenv("MQTT_PASSWORD", "")
    MQTT_TOPIC_PREFIX: str = os.getenv("MQTT_TOPIC_PREFIX", "forest_fire")
    
    # Kafka Settings
    KAFKA_BOOTSTRAP_SERVERS: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    
    # Cloud Storage Settings
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_STORAGE_BUCKET_NAME: str = os.getenv("AWS_STORAGE_BUCKET_NAME", "forest-fire-data")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    
    # Model Settings
    MODEL_DIR: str = os.getenv("MODEL_DIR", "app/models/trained")
    DEFAULT_FIRE_RISK_THRESHOLD: float = float(os.getenv("DEFAULT_FIRE_RISK_THRESHOLD", "0.7"))
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings() 