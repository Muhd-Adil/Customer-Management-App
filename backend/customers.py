from fastapi import FastAPI, Query, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
import database
import models
from fastapi.middleware.cors import CORSMiddleware
from customer_data import sample_customers


app = FastAPI()

# Allow CORS for local development

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

# Dependency to get DB session


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# create DB tables
models.Base.metadata.create_all(bind=database.engine)

# Adding 25 Random customer data if none exist
db = database.SessionLocal()

if db.query(models.Customer).count() == 0:
    db.add_all(sample_customers)
    db.commit()
db.close()

# Handling search, filtering, pagination


@app.get("/customers")
def get_customers(
    search: str = Query(None),
    state: str = Query(None),
    country: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1),
    db: Session = Depends(get_db)
):
    query = db.query(models.Customer)
    if search:
        # Filter by name or email (case-insensitive)
        query = query.filter(
            or_(
                models.Customer.name.ilike(f"%{search}%"),
                models.Customer.email.ilike(f"%{search}%")
            )
        )
    if state:
        query = query.filter(models.Customer.state == state)
    if country:
        query = query.filter(models.Customer.country == country)
    total = query.count()
    customers = query.offset((page - 1) * page_size).limit(page_size).all()
    return {
        "data": [
            {"id": c.id, "name": c.name, "email": c.email,
                "state": c.state, "country": c.country}
            for c in customers
        ],
        "total": total,
        "page": page,
        "page_size": page_size
    }

#(Optional) Make it runnable with `python customers.py`
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("customers:app", host="0.0.0.0", port=8000, reload=True)