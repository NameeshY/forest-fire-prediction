from typing import List, Optional
from pydantic import BaseModel, validator
from datetime import datetime


# FireRiskZone schemas
class FireRiskZoneBase(BaseModel):
    region_name: str
    latitude: float
    longitude: float
    risk_level: float
    risk_category: str
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    wind_speed: Optional[float] = None
    precipitation: Optional[float] = None
    vegetation_density: Optional[float] = None
    vegetation_type: Optional[str] = None
    soil_moisture: Optional[float] = None
    prediction_model: str
    confidence_score: float

    @validator('risk_level')
    def validate_risk_level(cls, v):
        if v < 0 or v > 1:
            raise ValueError('Risk level must be between 0 and 1')
        return v

    @validator('risk_category')
    def validate_risk_category(cls, v):
        valid_categories = ["Low", "Medium", "High"]
        if v not in valid_categories:
            raise ValueError(f'Risk category must be one of: {", ".join(valid_categories)}')
        return v


class FireRiskZoneCreate(FireRiskZoneBase):
    pass


class FireRiskZoneUpdate(FireRiskZoneBase):
    region_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    risk_level: Optional[float] = None
    risk_category: Optional[str] = None
    prediction_model: Optional[str] = None
    confidence_score: Optional[float] = None


class FireRiskZoneInDBBase(FireRiskZoneBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True


class FireRiskZone(FireRiskZoneInDBBase):
    pass


# FireIncident schemas
class FireIncidentBase(BaseModel):
    risk_zone_id: int
    latitude: float
    longitude: float
    start_date: datetime
    end_date: Optional[datetime] = None
    severity: str
    area_affected: Optional[float] = None
    status: str
    source: str
    description: Optional[str] = None

    @validator('severity')
    def validate_severity(cls, v):
        valid_severities = ["Low", "Medium", "High"]
        if v not in valid_severities:
            raise ValueError(f'Severity must be one of: {", ".join(valid_severities)}')
        return v

    @validator('status')
    def validate_status(cls, v):
        valid_statuses = ["Active", "Contained", "Extinguished"]
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of: {", ".join(valid_statuses)}')
        return v

    @validator('source')
    def validate_source(cls, v):
        valid_sources = ["Satellite", "Ground Report", "Official", "NASA FIRMS Realtime", "NIFC Realtime", "Test Script"]
        if v not in valid_sources:
            raise ValueError(f'Source must be one of: {", ".join(valid_sources)}')
        return v


class FireIncidentCreate(FireIncidentBase):
    pass


class FireIncidentUpdate(FireIncidentBase):
    risk_zone_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    start_date: Optional[datetime] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    source: Optional[str] = None


class FireIncidentInDBBase(FireIncidentBase):
    id: int

    class Config:
        orm_mode = True


class FireIncident(FireIncidentInDBBase):
    pass


# SavedRegion schemas
class SavedRegionBase(BaseModel):
    user_id: int
    region_name: str
    latitude: float
    longitude: float
    alert_threshold: Optional[float] = 0.7

    @validator('alert_threshold')
    def validate_threshold(cls, v):
        if v < 0 or v > 1:
            raise ValueError('Threshold must be between 0 and 1')
        return v


class SavedRegionCreate(SavedRegionBase):
    pass


class SavedRegionUpdate(BaseModel):
    region_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    alert_threshold: Optional[float] = None


class SavedRegionInDBBase(SavedRegionBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class SavedRegion(SavedRegionInDBBase):
    pass


# Alert schemas
class AlertBase(BaseModel):
    user_id: int
    risk_zone_id: int
    risk_level: float
    message: str
    is_read: Optional[bool] = False
    is_sent_email: Optional[bool] = False
    is_sent_sms: Optional[bool] = False


class AlertCreate(AlertBase):
    pass


class AlertUpdate(BaseModel):
    is_read: Optional[bool] = None
    is_sent_email: Optional[bool] = None
    is_sent_sms: Optional[bool] = None


class AlertInDBBase(AlertBase):
    id: int
    alert_time: datetime

    class Config:
        orm_mode = True


class Alert(AlertInDBBase):
    pass 