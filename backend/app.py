from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from sqlalchemy import or_, func
from dotenv import load_dotenv
from datetime import timedelta, date
from email.message import EmailMessage
from functools import wraps
from PIL import Image
import smtplib
import os
import uuid
from mutagen.mp4 import MP4
load_dotenv()

from db import db
from models import Car, User, Favorite, CarImage, Report

app = Flask(__name__)

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "uploads"
)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 150 * 1024 * 1024  # whole request
MAX_IMAGES = 20
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # per image

VIDEO_EXTENSIONS = {"mp4", "webm", "mov"}
MAX_VIDEO_SIZE = 40 * 1024 * 1024
MIN_VIDEO_SECONDS = 15
MAX_VIDEO_SECONDS = 30
MIN_PRICE = 500000  # 5 lac

BRAND_MIN_PRICE = {
    "Suzuki": 500000, "Daewoo": 500000, "Toyota": 600000, "Daihatsu": 600000,
    "Chevrolet": 600000, "FAW": 600000, "Honda": 800000, "Nissan": 800000,
    "Mitsubishi": 800000, "Mazda": 1000000, "United": 1000000, "Kia": 1500000,
    "Hyundai": 1500000, "Subaru": 1500000, "Volkswagen": 1500000,
    "Ford": 1500000, "Honri": 1500000, "Changan": 1800000, "Isuzu": 2000000,
    "Proton": 2000000, "DFSK": 2000000, "JAC": 2000000, "Prince": 2000000,
    "MG": 3000000, "Audi": 3000000, "BMW": 3000000, "Mercedes-Benz": 3000000,
    "Volvo": 3000000, "Peugeot": 3000000, "BAIC": 3000000, "Hino": 3000000,
    "Lexus": 4000000, "Jeep": 4000000, "Haval": 4000000, "Chery": 4000000,
    "Land Rover": 5000000, "Jetour": 5000000, "GAC": 5000000, "BYD": 6000000,
    "Porsche": 8000000, "Range Rover": 8000000, "Tesla": 8000000,
}

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

# Database + JWT configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "instance", "carmarket_v3.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + DB_PATH.replace("\\", "/")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.environ["JWT_SECRET_KEY"]
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

db.init_app(app)
jwt = JWTManager(app)
CORS(app, origins=[FRONTEND_URL, "http://127.0.0.1:5173"])

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["1000 per hour"],
    storage_uri="memory://",
)

serializer = URLSafeTimedSerializer(os.environ["JWT_SECRET_KEY"])

PAINT_OPTIONS = {"", "Original", "Partially repainted", "Fully repainted"}
# ---------- ERROR HANDLERS ----------

@app.errorhandler(413)
def too_large(e):
        return jsonify({"message": "Upload is too large (max 20 images of 5MB and one 40MB video)"}), 413


@app.errorhandler(429)
def too_many(e):
    return jsonify({"message": "Too many requests. Please try again later."}), 429


# ---------- HELPERS ----------

def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def delete_image_file(image_url):
    if image_url and image_url.startswith("/uploads/"):
        path = os.path.join(app.config["UPLOAD_FOLDER"], os.path.basename(image_url))
        if os.path.exists(path):
            os.remove(path)


def save_image(image):
    if not image or not image.filename or not allowed_file(image.filename):
        raise ValueError("Invalid image format. Use JPG, JPEG, PNG or WEBP.")

    image.seek(0, os.SEEK_END)
    size = image.tell()
    image.seek(0)
    if size > MAX_IMAGE_SIZE:
        raise ValueError("Each image must be smaller than 5MB")

    extension = image.filename.rsplit(".", 1)[1].lower()

    try:
        Image.open(image).verify()
    except Exception:
        raise ValueError("This is not a valid image file.")

    image.seek(0)
    filename = f"{uuid.uuid4().hex}.{extension}"
    image.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
    return f"/uploads/{filename}"


def save_many(files):
    """Saves all images. If one fails, the ones already saved are removed."""
    saved = []
    try:
        for f in files:
            saved.append(save_image(f))
    except ValueError:
        for url in saved:
            delete_image_file(url)
        raise
    return saved
def save_video(video):
    """Validates and saves one short video. Returns '/uploads/xxx.mp4'."""
    if not video or not video.filename or "." not in video.filename:
        raise ValueError("Please choose a valid video file")

    extension = video.filename.rsplit(".", 1)[1].lower()
    if extension not in VIDEO_EXTENSIONS:
        raise ValueError("Video must be MP4, WEBM or MOV")

    video.seek(0, os.SEEK_END)
    size = video.tell()
    video.seek(0)
    if size > MAX_VIDEO_SIZE:
        raise ValueError("Video must be smaller than 40MB")

    # Duration check (MP4 / MOV). WEBM is checked in the browser only.
    if extension in ("mp4", "mov"):
        try:
            duration = MP4(video.stream).info.length
        except Exception:
            raise ValueError("Could not read this video. Please upload a valid MP4 file.")
        video.seek(0)
        if duration < MIN_VIDEO_SECONDS - 0.5 or duration > MAX_VIDEO_SECONDS + 0.5:
            raise ValueError(
                f"Video must be between {MIN_VIDEO_SECONDS} and {MAX_VIDEO_SECONDS} seconds"
            )

    filename = f"{uuid.uuid4().hex}.{extension}"
    video.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
    return f"/uploads/{filename}"

def validate_car(brand, model, year, price, mileage, city, description):
    """Returns an error message, or None if everything is valid."""
    if not brand or not model or not city:
        return "Brand, model and city are required"
    if not 1970 <= year <= date.today().year + 1:
        return "Year is not valid"

    min_price = max(MIN_PRICE, BRAND_MIN_PRICE.get(brand, 0))
    if price < min_price:
        return f"Minimum price for {brand} is PKR {min_price:,}"

    if mileage < 0:
        return "Mileage cannot be negative"
    if len(str(description or "")) > 2000:
        return "Description is too long (max 2000 characters)"
    return None


def valid_password(password):
    return len(password) >= 8
def phone_key(value):
    """Phone ke aakhri 10 digits: 0300-1234567 aur +92 300 1234567 same ho jayen."""
    return "".join(c for c in str(value) if c.isdigit())[-10:]


def clean_cnic(value):
    """Sirf digits return karta hai, 13 na hon to None."""
    digits = "".join(c for c in str(value) if c.isdigit())
    return digits if len(digits) == 13 else None

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = db.session.get(User, int(get_jwt_identity()))
        if not user or not user.is_admin:
            return jsonify({"message": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper


def remove_car(car):
    """Deletes a car together with its images, video, favorites and reports."""
    urls = [img.url for img in car.images]
    if car.image and car.image not in urls:
        urls.append(car.image)
    if car.video:
        urls.append(car.video)

    Favorite.query.filter_by(car_id=car.id).delete()
    Report.query.filter_by(car_id=car.id).delete()
    db.session.delete(car)
    db.session.commit()

    for url in urls:
        delete_image_file(url)


def send_email(to, subject, body):
    msg = EmailMessage()
    msg["From"] = os.environ["MAIL_USER"]
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
        s.login(os.environ["MAIL_USER"], os.environ["MAIL_APP_PASSWORD"])
        s.send_message(msg)


@app.route("/uploads/<filename>")
@limiter.exempt
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


@app.route("/")
def home():
    return jsonify({"message": "CarMarket Backend is running!"})


# ---------- AUTH ----------
@app.route("/api/auth/register", methods=["POST"])
@limiter.limit("10 per hour")
def register():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    phone = str(data.get("phone", "")).strip()
    cnic = clean_cnic(data.get("cnic", ""))
    address = str(data.get("address", "")).strip()
    city = str(data.get("city", "")).strip()
    password = str(data.get("password", ""))

    if not all([name, email, phone, address, city, password]):
        return jsonify({"message": "All fields are required"}), 400

    if "@" not in email or "." not in email.split("@")[-1] or len(email) > 254:
        return jsonify({"message": "Invalid email"}), 400

    if len(phone_key(phone)) != 10:
        return jsonify({"message": "Please enter a valid phone number"}), 400

    if not cnic:
        return jsonify({"message": "CNIC must be 13 digits (e.g. 12345-1234567-1)"}), 400

    if len(address) > 255:
        return jsonify({"message": "Address is too long"}), 400

    if not valid_password(password):
        return jsonify({"message": "Password must be at least 8 characters"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 409

    if User.query.filter_by(phone_key=phone_key(phone)).first():
        return jsonify({"message": "Phone number already registered"}), 409

    if User.query.filter_by(cnic=cnic).first():
        return jsonify({"message": "CNIC already registered"}), 409

    user = User(
        name=name, email=email, phone=phone, phone_key=phone_key(phone),
        cnic=cnic, address=address, city=city,
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Account created successfully!",
        "token": token,
        "user": user.to_dict(),
    }), 201

@app.route("/api/auth/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    data = request.get_json(silent=True) or {}

    # "identifier" naya hai; purana "email" key bhi chalti hai
    identifier = str(data.get("identifier", data.get("email", ""))).strip().lower()
    password = str(data.get("password", ""))

    if "@" in identifier:
        user = User.query.filter_by(email=identifier).first()
    else:
        user = User.query.filter_by(phone_key=phone_key(identifier)).first()

    if not user or not user.check_password(password):
        return jsonify({"message": "Wrong email/phone or password"}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Login successful!",
        "token": token,
        "user": user.to_dict(),
    })
@app.route("/api/auth/forgot-password", methods=["POST"])
@limiter.limit("3 per hour")
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()

    user = User.query.filter_by(email=email).first()

    if user:
        token = serializer.dumps(
            {"id": user.id, "h": user.password_hash[-10:]},
            salt="reset",
        )
        link = f"{FRONTEND_URL}/reset-password?token={token}"
        try:
            send_email(
                user.email,
                "CarMarket password reset",
                f"Open this link to reset your password (valid for 30 minutes):\n\n{link}\n\n"
                "If you did not request this, please ignore this email.",
            )
        except Exception as e:
            app.logger.error(f"Email send failed: {e}")
            print("RESET LINK (email is not configured):", link)

    # Always return the same response so nobody can tell if an email is registered
    return jsonify({
        "message": "If this email is registered, a reset link has been sent."
    })


@app.route("/api/auth/reset-password", methods=["POST"])
@limiter.limit("5 per hour")
def reset_password():
    data = request.get_json(silent=True) or {}

    token = str(data.get("token", ""))
    new_password = str(data.get("new_password", ""))

    if not valid_password(new_password):
        return jsonify({"message": "Password must be at least 8 characters"}), 400

    try:
        payload = serializer.loads(token, salt="reset", max_age=1800)  # 30 minutes
    except (BadSignature, SignatureExpired):
        return jsonify({"message": "This link is invalid or has expired"}), 400

    user = db.session.get(User, payload["id"])

    # The hash changes once the password is reset, so an old link stops working
    if not user or user.password_hash[-10:] != payload["h"]:
        return jsonify({"message": "This link has already been used"}), 400

    user.set_password(new_password)
    db.session.commit()

    return jsonify({"message": "Password reset successful! Please login."})


@app.route("/api/auth/me", methods=["GET"])
@jwt_required()
def me():
    user = db.session.get(User, int(get_jwt_identity()))

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify(user.to_dict())


# ---------- CARS ----------

# Add a new car (login required)
@app.route("/api/cars", methods=["POST"])
@jwt_required()
def add_car():
    user_id = int(get_jwt_identity())

    condition = request.form.get("condition", "used").strip().lower()
    if condition not in ("new", "used"):
        return jsonify({"message": "Condition must be new or used"}), 400

    try:
        brand = request.form.get("brand", "").strip()
        model = request.form.get("model", "").strip()
        year = int(request.form.get("year"))
        price = float(request.form.get("price"))
        mileage = 0 if condition == "new" else int(request.form.get("mileage"))
        city = request.form.get("city", "").strip()
        description = request.form.get("description", "")
        fuel_type = request.form.get("fuel_type", "").strip()
        transmission = request.form.get("transmission", "").strip()
        body_type = request.form.get("body_type", "").strip()
        area = request.form.get("area", "").strip()[:100]
        paint = request.form.get("paint", "").strip()
    except (ValueError, TypeError):
        return jsonify({"message": "Invalid year, price or mileage"}), 400

    error = validate_car(brand, model, year, price, mileage, city, description)
    if paint not in PAINT_OPTIONS:
        return jsonify({"message": "Invalid paint option"}), 400
    if error:
        return jsonify({"message": error}), 400
 
    files = [f for f in request.files.getlist("images") if f.filename]
    if len(files) > MAX_IMAGES:
        return jsonify({"message": f"A maximum of {MAX_IMAGES} images is allowed"}), 400

    try:
        urls = save_many(files)
    except ValueError as e:
        return jsonify({"message": str(e)}), 400

    video_url = ""
    video_file = request.files.get("video")
    if video_file and video_file.filename:
        try:
            video_url = save_video(video_file)
        except ValueError as e:
            for url in urls:
                delete_image_file(url)
            return jsonify({"message": str(e)}), 400

    car = Car(
        brand=brand,
        model=model,
        year=year,
        price=price,
        mileage=mileage,
        city=city,
        area=area,
        description=description,
        image=urls[0] if urls else "",
        video=video_url,
        fuel_type=fuel_type,
        transmission=transmission,
        body_type=body_type,
        condition=condition,
        paint=paint,
        seller_id=user_id,
    )

    db.session.add(car)
    db.session.flush()
    for pos, url in enumerate(urls):
        db.session.add(CarImage(car_id=car.id, url=url, position=pos))
    db.session.commit()

    return jsonify({
        "message": "Car added successfully!",
        "car": car.to_dict()
    }), 201

# Update a car (owner only)
@app.route("/api/cars/<int:car_id>", methods=["PUT"])
@jwt_required()
def update_car(car_id):
    user_id = int(get_jwt_identity())
    car = db.session.get(Car, car_id)

    if not car:
        return jsonify({"message": "Car not found"}), 404

    if car.seller_id != user_id:
        return jsonify({"message": "You can only edit your own cars"}), 403

    data = request.form if request.form else (request.get_json(silent=True) or {})

    condition = str(data.get("condition", car.condition or "used")).strip().lower()
    if condition not in ("new", "used"):
        return jsonify({"message": "Condition must be new or used"}), 400

    try:
        brand = str(data.get("brand", car.brand)).strip()
        model = str(data.get("model", car.model)).strip()
        year = int(data.get("year", car.year))
        price = float(data.get("price", car.price))
        mileage = 0 if condition == "new" else int(data.get("mileage", car.mileage))
        city = str(data.get("city", car.city)).strip()
        description = data.get("description", car.description)
        fuel_type = str(data.get("fuel_type", car.fuel_type or "")).strip()
        transmission = str(data.get("transmission", car.transmission or "")).strip()
        body_type = str(data.get("body_type", car.body_type or "")).strip()
        area = str(data.get("area", car.area or "")).strip()[:100]
        paint = str(data.get("paint", car.paint or "")).strip()
    except (ValueError, TypeError):
        return jsonify({"message": "Invalid year, price or mileage"}), 400

    error = validate_car(brand, model, year, price, mileage, city, description)
    if paint not in PAINT_OPTIONS:
        return jsonify({"message": "Invalid paint option"}), 400
    if error:
        return jsonify({"message": error}), 400

    delete_ids = request.form.getlist("delete_image_ids", type=int)
    new_files = [f for f in request.files.getlist("images") if f.filename]

    to_remove = [img for img in car.images if img.id in delete_ids]
    remaining = [img for img in car.images if img.id not in delete_ids]

    if len(remaining) + len(new_files) > MAX_IMAGES:
        return jsonify({"message": f"A maximum of {MAX_IMAGES} images is allowed"}), 400

    try:
        new_urls = save_many(new_files)
    except ValueError as e:
        return jsonify({"message": str(e)}), 400

    new_video_url = None
    video_file = request.files.get("video")
    if video_file and video_file.filename:
        try:
            new_video_url = save_video(video_file)
        except ValueError as e:
            for url in new_urls:
                delete_image_file(url)
            return jsonify({"message": str(e)}), 400

    car.brand = brand
    car.model = model
    car.year = year
    car.price = price
    car.mileage = mileage
    car.city = city
    car.description = description
    car.fuel_type = fuel_type
    car.transmission = transmission
    car.body_type = body_type
    car.condition = condition
    car.paint = paint

    for img in to_remove:
        delete_image_file(img.url)
        db.session.delete(img)

    next_pos = max([img.position for img in remaining], default=-1) + 1
    for offset, url in enumerate(new_urls):
        db.session.add(CarImage(car_id=car.id, url=url, position=next_pos + offset))

    all_urls = [img.url for img in remaining] + new_urls
    car.image = all_urls[0] if all_urls else ""

    # Video: a new file replaces the old one; delete_video=1 removes it
    if new_video_url:
        delete_image_file(car.video)
        car.video = new_video_url
    elif request.form.get("delete_video") == "1":
        delete_image_file(car.video)
        car.video = ""

    db.session.commit()

    return jsonify({
        "message": "Car updated successfully!",
        "car": car.to_dict()
    })
# Sold / Available toggle (owner only)
@app.route("/api/cars/<int:car_id>/status", methods=["PATCH"])
@jwt_required()
def set_car_status(car_id):
    user_id = int(get_jwt_identity())
    car = db.session.get(Car, car_id)

    if not car:
        return jsonify({"message": "Car not found"}), 404

    if car.seller_id != user_id:
        return jsonify({"message": "You can only change your own cars"}), 403

    data = request.get_json(silent=True) or {}
    status = str(data.get("status", "")).strip().lower()

    if status not in ("available", "sold"):
        return jsonify({"message": "Status must be available or sold"}), 400

    car.status = status
    db.session.commit()

    return jsonify({"message": "Status updated", "car": car.to_dict()})


# Delete a car (owner only)
@app.route("/api/cars/<int:car_id>", methods=["DELETE"])
@jwt_required()
def delete_car(car_id):
    user_id = int(get_jwt_identity())
    car = db.session.get(Car, car_id)

    if not car:
        return jsonify({"message": "Car not found"}), 404

    if car.seller_id != user_id:
        return jsonify({"message": "You can only delete your own cars"}), 403

    remove_car(car)

    return jsonify({"message": "Car deleted successfully!"})


SORTS = {
    "newest": Car.id.desc(),
    "price-low": Car.price.asc(),
    "price-high": Car.price.desc(),
    "year-new": Car.year.desc(),
    "mileage-low": Car.mileage.asc(),
}


# Get cars (without "page" it returns the full list, used by the Home page)
@app.route("/api/cars", methods=["GET"])
def get_cars():
    args = request.args
    query = Car.query

    # Used / New filter (also applies to the full list used by the Home page)
    cond = args.get("condition", "").strip().lower()
    if cond in ("new", "used"):
        query = query.filter(Car.condition == cond)

    if "page" not in args:
        cars = query.order_by(Car.id.desc()).all()
        return jsonify([car.to_dict() for car in cars])

    search = args.get("search", "").strip()
    if search:
        like = f"%{search}%"
        query = query.filter(or_(Car.brand.ilike(like), Car.model.ilike(like)))

    city = args.get("city", "").strip().lower()
    
    if city:
        query = query.filter(func.lower(func.trim(Car.city)) == city)
    area = args.get("area", "").strip().lower()
    if area:
        query = query.filter(func.lower(func.trim(Car.area)) == area)
    try:
        query = query.filter(Car.price <= float(args.get("max_price", "")))
    except ValueError:
        pass

    for field, column in (
        ("fuel_type", Car.fuel_type),
        ("transmission", Car.transmission),
        ("body_type", Car.body_type),
    ):
        value = args.get(field, "").strip()
        if value:
            query = query.filter(column == value)

    # Sold cars are hidden by default
    if args.get("sold") != "1":
        query = query.filter(Car.status != "sold")

    total = query.count()
    per_page = min(max(args.get("per_page", 9, type=int), 1), 50)
    pages = max(1, -(-total // per_page))
    page = min(max(args.get("page", 1, type=int), 1), pages)

    order = SORTS.get(args.get("sort"), SORTS["newest"])
    cars = (
        query.order_by(order, Car.id.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return jsonify({
        "cars": [car.to_dict() for car in cars],
        "total": total,
        "page": page,
        "pages": pages,
    })


@app.route("/api/cities", methods=["GET"])
def get_cities():
    rows = db.session.query(func.lower(func.trim(Car.city))).distinct().all()
    return jsonify(sorted(r[0] for r in rows if r[0]))


# Cars of the logged-in user (for My Listings)
@app.route("/api/my-cars", methods=["GET"])
@jwt_required()
def my_cars():
    user_id = int(get_jwt_identity())
    cars = Car.query.filter_by(seller_id=user_id).order_by(Car.id.desc()).all()
    return jsonify([car.to_dict() for car in cars])


# Get one car
@app.route("/api/cars/<int:car_id>", methods=["GET"])
def get_car(car_id):
    car = db.session.get(Car, car_id)

    if not car:
        return jsonify({"message": "Car not found"}), 404

    return jsonify(car.to_dict())


# View counter (called only from CarDetails, never for the owner)
@app.route("/api/cars/<int:car_id>/view", methods=["POST"])
@limiter.limit("60 per hour")
def add_view(car_id):
    updated = Car.query.filter_by(id=car_id).update({Car.views: Car.views + 1})
    db.session.commit()
    if not updated:
        return jsonify({"message": "Car not found"}), 404
    return jsonify({"message": "ok"})


# Similar cars
@app.route("/api/cars/<int:car_id>/similar", methods=["GET"])
def similar_cars(car_id):
    car = db.session.get(Car, car_id)
    if not car:
        return jsonify([])

    low, high = car.price * 0.7, car.price * 1.3

    cars = (
        Car.query.filter(Car.id != car.id, Car.status != "sold")
        .filter(
            or_(
                Car.brand == car.brand,
                (Car.body_type == car.body_type) & Car.price.between(low, high),
            )
        )
        .order_by(func.abs(Car.price - car.price))
        .limit(4)
        .all()
    )
    return jsonify([c.to_dict() for c in cars])


# ---------- SELLER PROFILE + REPORT ----------

# Public seller profile
@app.route("/api/sellers/<int:user_id>", methods=["GET"])
def seller_profile(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "Seller not found"}), 404

    cars = Car.query.filter_by(seller_id=user_id).order_by(Car.id.desc()).all()
    sold = sum(1 for c in cars if c.status == "sold")

    return jsonify({
        "id": user.id,
        "name": user.name,
        "joined": user.created_at.strftime("%B %Y") if user.created_at else None,
        "active_count": len(cars) - sold,
        "sold_count": sold,
        "cars": [c.to_dict() for c in cars],
    })


REPORT_REASONS = {"fake", "wrong_info", "scam", "sold", "other"}


# Report a listing (login required)
@app.route("/api/cars/<int:car_id>/report", methods=["POST"])
@jwt_required()
@limiter.limit("10 per hour")
def report_car(car_id):
    user_id = int(get_jwt_identity())
    car = db.session.get(Car, car_id)

    if not car:
        return jsonify({"message": "Car not found"}), 404

    if car.seller_id == user_id:
        return jsonify({"message": "You cannot report your own listing"}), 400

    data = request.get_json(silent=True) or {}
    reason = str(data.get("reason", "")).strip()
    details = str(data.get("details", "")).strip()[:500]

    if reason not in REPORT_REASONS:
        return jsonify({"message": "Please choose a reason for the report"}), 400

    if Report.query.filter_by(car_id=car_id, reporter_id=user_id).first():
        return jsonify({"message": "You have already reported this listing"}), 409

    db.session.add(
        Report(car_id=car_id, reporter_id=user_id, reason=reason, details=details)
    )
    db.session.commit()

    return jsonify({"message": "Thank you. We will review this listing."}), 201


# ---------- ADMIN ----------

@app.route("/api/admin/stats", methods=["GET"])
@admin_required
def admin_stats():
    return jsonify({
        "users": User.query.count(),
        "cars": Car.query.count(),
        "sold": Car.query.filter_by(status="sold").count(),
        "open_reports": Report.query.filter_by(status="open").count(),
    })


@app.route("/api/admin/reports", methods=["GET"])
@admin_required
def admin_reports():
    status = request.args.get("status", "open")
    query = Report.query
    if status in ("open", "resolved"):
        query = query.filter(Report.status == status)

    out = []
    for r in query.order_by(Report.id.desc()).all():
        car = db.session.get(Car, r.car_id)
        reporter = db.session.get(User, r.reporter_id)
        out.append({
            "id": r.id,
            "reason": r.reason,
            "details": r.details,
            "status": r.status,
            "created_at": r.created_at.strftime("%d %b %Y") if r.created_at else None,
            "reporter_name": reporter.name if reporter else None,
            "report_count": Report.query.filter_by(car_id=r.car_id).count(),
            "car": {
                "id": car.id,
                "title": f"{car.brand.strip()} {car.model} ({car.year})",
                "seller_name": car.seller.name if car.seller else None,
            } if car else None,
        })
    return jsonify(out)


@app.route("/api/admin/reports/<int:report_id>", methods=["PATCH"])
@admin_required
def admin_resolve_report(report_id):
    report = db.session.get(Report, report_id)
    if not report:
        return jsonify({"message": "Report not found"}), 404
    report.status = "resolved"
    db.session.commit()
    return jsonify({"message": "Resolved"})


@app.route("/api/admin/cars/<int:car_id>", methods=["DELETE"])
@admin_required
def admin_delete_car(car_id):
    car = db.session.get(Car, car_id)
    if not car:
        return jsonify({"message": "Car not found"}), 404
    remove_car(car)
    return jsonify({"message": "Car deleted"})


# ---------- FAVORITES ----------

@app.route("/api/favorites", methods=["GET"])
@jwt_required()
def get_favorites():
    user_id = int(get_jwt_identity())
    favs = (
        Favorite.query.filter_by(user_id=user_id)
        .order_by(Favorite.id.desc())
        .all()
    )

    cars = []
    for fav in favs:
        car = db.session.get(Car, fav.car_id)
        if car:
            cars.append(car.to_dict())

    return jsonify(cars)


@app.route("/api/favorites/<int:car_id>", methods=["POST"])
@jwt_required()
def add_favorite(car_id):
    user_id = int(get_jwt_identity())

    if not db.session.get(Car, car_id):
        return jsonify({"message": "Car not found"}), 404

    exists = Favorite.query.filter_by(user_id=user_id, car_id=car_id).first()
    if not exists:
        db.session.add(Favorite(user_id=user_id, car_id=car_id))
        db.session.commit()

    return jsonify({"message": "Saved"}), 201


@app.route("/api/favorites/<int:car_id>", methods=["DELETE"])
@jwt_required()
def remove_favorite(car_id):
    user_id = int(get_jwt_identity())
    Favorite.query.filter_by(user_id=user_id, car_id=car_id).delete()
    db.session.commit()
    return jsonify({"message": "Removed"})


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(debug=os.environ.get("FLASK_DEBUG") == "1", port=5000)
    