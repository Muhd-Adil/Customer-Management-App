from sqlalchemy import Column, String, Integer, Date
from database import Base


class Customer(Base):
    __tablename__ = "customers"  # Defining table name
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, index=True)
    state = Column(String, index=True)
    country = Column(String, index=True)
    dob = Column(Date, index=True)
