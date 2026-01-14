from fastapi import FastAPI
from app.api import auth, profile

app = FastAPI()

app.include_router(auth.router)
app.include_router(profile.router)


@app.get("/")
def read_root():
    return {"message": "Hello, World!"}
