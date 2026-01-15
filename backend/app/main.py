from fastapi import FastAPI
from app.api import auth, profile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",  # For Local Development
    "http://127.0.0.1:5173",  # For Local Development
    "https://newgate-ai.vercel.app",  # THIS IS ACTUAL VERCEL OR MAIN DOMAIN
]

# CORS Configuration (Essential for React Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(profile.router)


@app.get("/")
def read_root():
    return {"message": "Hello, World!"}
