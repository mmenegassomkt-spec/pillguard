from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Helper function to convert ObjectId
def str_id(obj):
    if obj and "_id" in obj:
        obj["_id"] = str(obj["_id"])
    return obj


# ===== MODELS =====

# Profile Models
class ProfileCreate(BaseModel):
    name: str
    color: str
    avatar: str

class Profile(BaseModel):
    id: str
    name: str
    color: str
    avatar: str
    created_at: datetime


# Medication Models
class MedicationCreate(BaseModel):
    profile_id: str
    name: str
    dosage: str
    priority: str = "normal"  # normal, importante, crítico
    stock_quantity: int = 0
    min_stock_alert: int = 10
    doctor_name: Optional[str] = None
    doctor_contact: Optional[str] = None
    prescription_photo: Optional[str] = None  # base64
    box_photo: Optional[str] = None  # base64
    is_prescription_required: bool = True

class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    priority: Optional[str] = None
    stock_quantity: Optional[int] = None
    min_stock_alert: Optional[int] = None
    doctor_name: Optional[str] = None
    doctor_contact: Optional[str] = None
    prescription_photo: Optional[str] = None
    box_photo: Optional[str] = None
    is_prescription_required: Optional[bool] = None

class Medication(BaseModel):
    id: str
    profile_id: str
    name: str
    dosage: str
    priority: str
    stock_quantity: int
    min_stock_alert: int
    doctor_name: Optional[str] = None
    doctor_contact: Optional[str] = None
    prescription_photo: Optional[str] = None
    box_photo: Optional[str] = None
    is_prescription_required: bool
    created_at: datetime


# Alarm Models
class AlarmCreate(BaseModel):
    profile_id: str
    time: str  # HH:mm
    frequency: str  # daily, alternate, specific
    specific_days: Optional[List[int]] = None  # [0-6] for days of week
    specific_dates: Optional[List[str]] = None  # ['2025-01-15', '2025-01-16'] for specific dates
    medication_ids: List[str]
    is_critical: bool = False
    repeat_interval_minutes: int = 5
    is_active: bool = True

class AlarmUpdate(BaseModel):
    time: Optional[str] = None
    frequency: Optional[str] = None
    specific_days: Optional[List[int]] = None
    specific_dates: Optional[List[str]] = None
    medication_ids: Optional[List[str]] = None
    is_critical: Optional[bool] = None
    repeat_interval_minutes: Optional[int] = None
    is_active: Optional[bool] = None

class Alarm(BaseModel):
    id: str
    profile_id: str
    time: str
    frequency: str
    specific_days: Optional[List[int]] = None
    specific_dates: Optional[List[str]] = None
    medication_ids: List[str]
    is_critical: bool
    repeat_interval_minutes: int
    is_active: bool
    created_at: datetime


# Alarm Log Models
class AlarmLogCreate(BaseModel):
    alarm_id: str
    medication_ids: List[str]
    profile_id: str
    scheduled_time: datetime
    status: str  # taken, skipped, missed
    notes: Optional[str] = None

class AlarmLog(BaseModel):
    id: str
    alarm_id: str
    medication_ids: List[str]
    profile_id: str
    scheduled_time: datetime
    confirmed_time: Optional[datetime] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime


# Premium Trial Models
class PremiumTrialCreate(BaseModel):
    profile_id: str
    trial_days: int = 15

class PremiumTrial(BaseModel):
    id: str
    profile_id: str
    trial_start: datetime
    trial_end: datetime
    is_active: bool


# ===== PROFILE ROUTES =====

@api_router.post("/profiles", response_model=Profile)
async def create_profile(profile: ProfileCreate):
    profile_dict = profile.dict()
    profile_dict["created_at"] = datetime.utcnow()
    result = await db.profiles.insert_one(profile_dict)
    profile_dict["id"] = str(result.inserted_id)
    profile_dict["_id"] = result.inserted_id
    return Profile(**profile_dict)

@api_router.get("/profiles", response_model=List[Profile])
async def get_profiles():
    profiles = await db.profiles.find().to_list(1000)
    return [Profile(id=str(p["_id"]), **{k: v for k, v in p.items() if k != "_id"}) for p in profiles]

@api_router.get("/profiles/{profile_id}", response_model=Profile)
async def get_profile(profile_id: str):
    profile = await db.profiles.find_one({"_id": ObjectId(profile_id)})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return Profile(id=str(profile["_id"]), **{k: v for k, v in profile.items() if k != "_id"})

@api_router.delete("/profiles/{profile_id}")
async def delete_profile(profile_id: str):
    result = await db.profiles.delete_one({"_id": ObjectId(profile_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    # Also delete related data
    await db.medications.delete_many({"profile_id": profile_id})
    await db.alarms.delete_many({"profile_id": profile_id})
    await db.alarm_logs.delete_many({"profile_id": profile_id})
    return {"message": "Profile deleted successfully"}


# ===== MEDICATION ROUTES =====

@api_router.post("/medications", response_model=Medication)
async def create_medication(medication: MedicationCreate):
    med_dict = medication.dict()
    med_dict["created_at"] = datetime.utcnow()
    result = await db.medications.insert_one(med_dict)
    med_dict["id"] = str(result.inserted_id)
    med_dict["_id"] = result.inserted_id
    return Medication(**med_dict)

@api_router.get("/medications", response_model=List[Medication])
async def get_medications(profile_id: Optional[str] = None):
    query = {"profile_id": profile_id} if profile_id else {}
    medications = await db.medications.find(query).to_list(1000)
    return [Medication(id=str(m["_id"]), **{k: v for k, v in m.items() if k != "_id"}) for m in medications]

@api_router.get("/medications/{medication_id}", response_model=Medication)
async def get_medication(medication_id: str):
    medication = await db.medications.find_one({"_id": ObjectId(medication_id)})
    if not medication:
        raise HTTPException(status_code=404, detail="Medication not found")
    return Medication(id=str(medication["_id"]), **{k: v for k, v in medication.items() if k != "_id"})

@api_router.put("/medications/{medication_id}", response_model=Medication)
async def update_medication(medication_id: str, medication: MedicationUpdate):
    update_data = {k: v for k, v in medication.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.medications.find_one_and_update(
        {"_id": ObjectId(medication_id)},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Medication not found")
    return Medication(id=str(result["_id"]), **{k: v for k, v in result.items() if k != "_id"})

@api_router.delete("/medications/{medication_id}")
async def delete_medication(medication_id: str):
    result = await db.medications.delete_one({"_id": ObjectId(medication_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Medication not found")
    return {"message": "Medication deleted successfully"}


# ===== ALARM ROUTES =====

@api_router.post("/alarms", response_model=Alarm)
async def create_alarm(alarm: AlarmCreate):
    alarm_dict = alarm.dict()
    alarm_dict["created_at"] = datetime.utcnow()
    result = await db.alarms.insert_one(alarm_dict)
    alarm_dict["id"] = str(result.inserted_id)
    alarm_dict["_id"] = result.inserted_id
    return Alarm(**alarm_dict)

@api_router.get("/alarms", response_model=List[Alarm])
async def get_alarms(profile_id: Optional[str] = None):
    query = {"profile_id": profile_id} if profile_id else {}
    alarms = await db.alarms.find(query).sort("time", 1).to_list(1000)
    return [Alarm(id=str(a["_id"]), **{k: v for k, v in a.items() if k != "_id"}) for a in alarms]

@api_router.get("/alarms/{alarm_id}", response_model=Alarm)
async def get_alarm(alarm_id: str):
    alarm = await db.alarms.find_one({"_id": ObjectId(alarm_id)})
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")
    return Alarm(id=str(alarm["_id"]), **{k: v for k, v in alarm.items() if k != "_id"})

@api_router.put("/alarms/{alarm_id}", response_model=Alarm)
async def update_alarm(alarm_id: str, alarm: AlarmUpdate):
    update_data = {k: v for k, v in alarm.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.alarms.find_one_and_update(
        {"_id": ObjectId(alarm_id)},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Alarm not found")
    return Alarm(id=str(result["_id"]), **{k: v for k, v in result.items() if k != "_id"})

@api_router.delete("/alarms/{alarm_id}")
async def delete_alarm(alarm_id: str):
    result = await db.alarms.delete_one({"_id": ObjectId(alarm_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alarm not found")
    return {"message": "Alarm deleted successfully"}


# ===== ALARM LOG ROUTES =====

@api_router.post("/alarm-logs", response_model=AlarmLog)
async def create_alarm_log(log: AlarmLogCreate):
    log_dict = log.dict()
    log_dict["created_at"] = datetime.utcnow()
    log_dict["confirmed_time"] = datetime.utcnow() if log.status != "missed" else None
    result = await db.alarm_logs.insert_one(log_dict)
    log_dict["id"] = str(result.inserted_id)
    log_dict["_id"] = result.inserted_id
    
    # Update stock for each medication if taken
    if log.status == "taken":
        for med_id in log.medication_ids:
            await db.medications.update_one(
                {"_id": ObjectId(med_id)},
                {"$inc": {"stock_quantity": -1}}
            )
    
    return AlarmLog(**log_dict)

@api_router.get("/alarm-logs", response_model=List[AlarmLog])
async def get_alarm_logs(profile_id: Optional[str] = None, limit: int = 100):
    query = {"profile_id": profile_id} if profile_id else {}
    logs = await db.alarm_logs.find(query).sort("created_at", -1).limit(limit).to_list(limit)
    return [AlarmLog(id=str(l["_id"]), **{k: v for k, v in l.items() if k != "_id"}) for l in logs]

@api_router.delete("/alarm-logs/{profile_id}")
async def clear_alarm_logs(profile_id: str):
    result = await db.alarm_logs.delete_many({"profile_id": profile_id})
    return {"message": f"Deleted {result.deleted_count} logs", "deleted_count": result.deleted_count}


# ===== PREMIUM TRIAL ROUTES =====

@api_router.post("/premium-trial", response_model=PremiumTrial)
async def create_premium_trial(trial: PremiumTrialCreate):
    # Check if trial already exists
    existing = await db.premium_trials.find_one({"profile_id": trial.profile_id})
    if existing:
        raise HTTPException(status_code=400, detail="Trial already exists for this profile")
    
    from datetime import timedelta
    trial_dict = {
        "profile_id": trial.profile_id,
        "trial_start": datetime.utcnow(),
        "trial_end": datetime.utcnow() + timedelta(days=trial.trial_days),
        "is_active": True
    }
    result = await db.premium_trials.insert_one(trial_dict)
    trial_dict["id"] = str(result.inserted_id)
    return PremiumTrial(**trial_dict)

@api_router.get("/premium-trial/{profile_id}", response_model=Optional[PremiumTrial])
async def get_premium_trial(profile_id: str):
    trial = await db.premium_trials.find_one({"profile_id": profile_id})
    if not trial:
        return None
    
    # Check if trial is still active
    if trial["is_active"] and datetime.utcnow() > trial["trial_end"]:
        await db.premium_trials.update_one(
            {"_id": trial["_id"]},
            {"$set": {"is_active": False}}
        )
        trial["is_active"] = False
    
    return PremiumTrial(id=str(trial["_id"]), **{k: v for k, v in trial.items() if k != "_id"})


# ===== STATISTICS =====

@api_router.get("/stats/{profile_id}")
async def get_stats(profile_id: str):
    medications_count = await db.medications.count_documents({"profile_id": profile_id})
    alarms_count = await db.alarms.count_documents({"profile_id": profile_id, "is_active": True})
    
    # Low stock medications
    low_stock = await db.medications.find({
        "profile_id": profile_id,
        "$expr": {"$lte": ["$stock_quantity", "$min_stock_alert"]}
    }).to_list(100)
    
    # Recent logs
    recent_logs = await db.alarm_logs.find({"profile_id": profile_id}).sort("created_at", -1).limit(7).to_list(7)
    taken_count = sum(1 for log in recent_logs if log["status"] == "taken")
    
    return {
        "medications_count": medications_count,
        "alarms_count": alarms_count,
        "low_stock_count": len(low_stock),
        "low_stock_items": [Medication(id=str(m["_id"]), **{k: v for k, v in m.items() if k != "_id"}) for m in low_stock],
        "adherence_rate": round((taken_count / len(recent_logs) * 100) if recent_logs else 0, 1)
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
