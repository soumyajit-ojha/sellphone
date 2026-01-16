from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI
from app.api import auth, profile, products
from app.api import ecommerce

app = FastAPI()

origins = [
    "http://localhost:5173",  # For Local Development
    "http://127.0.0.1:5173",  # For Local Development
    "https://sellphoneind.vercel.app",  # THIS IS ACTUAL VERCEL OR MAIN DOMAIN
]

# CORS Configuration (Essential for React Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/auth")
app.include_router(profile.router, prefix="/user")
app.include_router(products.router, prefix="/products")
app.include_router(ecommerce.router, prefix="/ecommerce")
