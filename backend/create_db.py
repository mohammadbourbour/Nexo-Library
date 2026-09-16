from app.db.session import engine
from app.db.base import Base
import app.models.models as models

def create():
    Base.metadata.create_all(bind=engine)
    print("DB tables created.")

if __name__ == '__main__':
    create()
