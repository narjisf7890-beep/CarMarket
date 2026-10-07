from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from db import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    cnic = db.Column(db.String(13), unique=True, nullable=True)
    address = db.Column(db.String(255), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    phone_key = db.Column(db.String(10), index=True, nullable=True)  # phone ke aakhri 10 digits (login ke liye)
    password_hash = db.Column(db.String(255), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_admin = db.Column(
        db.Boolean, nullable=False, default=False, server_default="0"
    )

    cars = db.relationship("Car", backref="seller", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    # The password hash is never sent to the client
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "city": self.city,
            "address": self.address,
            "is_admin": bool(self.is_admin),
        }


class Car(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    brand = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(100), nullable=False)

    year = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    mileage = db.Column(db.Integer, nullable=False)

    city = db.Column(db.String(100), nullable=False)
    area = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=True)

    image = db.Column(db.String(255), nullable=True)  # cover image

    fuel_type = db.Column(db.String(30), nullable=True)
    transmission = db.Column(db.String(30), nullable=True)
    body_type = db.Column(db.String(30), nullable=True)

    status = db.Column(
        db.String(20), nullable=False, default="available", server_default="available"
    )  # available / sold
    condition = db.Column(
        db.String(10), nullable=False, default="used", server_default="used"
    )  # new / used
    views = db.Column(
        db.Integer, nullable=False, default=0, server_default="0"
    )
    video = db.Column(db.String(255), nullable=True)
    paint = db.Column(db.String(30), nullable=True)
    # The seller who owns this car
    seller_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)

    images = db.relationship(
        "CarImage",
        backref="car",
        cascade="all, delete-orphan",
        order_by="CarImage.position",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "brand": self.brand,
            "model": self.model,
            "year": self.year,
            "price": self.price,
            "mileage": self.mileage,
            "city": self.city,
            "area": self.area,
            "description": self.description,
            "image": self.image,
            "fuel_type": self.fuel_type,
            "transmission": self.transmission,
            "body_type": self.body_type,
            "status": self.status or "available",
            "condition": self.condition or "used",
            "images": [{"id": i.id, "url": i.url} for i in self.images],
            "views": self.views or 0,
            "video": self.video,
            "paint": self.paint,
            "seller_id": self.seller_id,
            "seller_name": self.seller.name if self.seller else None,
            "seller_phone": self.seller.phone if self.seller else None,
        }


class CarImage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    car_id = db.Column(db.Integer, db.ForeignKey("car.id"), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    position = db.Column(db.Integer, nullable=False, default=0)


class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    car_id = db.Column(db.Integer, db.ForeignKey("car.id"), nullable=False)

    __table_args__ = (
        db.UniqueConstraint("user_id", "car_id", name="unique_user_car"),
    )


class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    car_id = db.Column(db.Integer, db.ForeignKey("car.id"), nullable=False)
    reporter_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    reason = db.Column(db.String(50), nullable=False)
    details = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(20), nullable=False, default="open")  # open / resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("car_id", "reporter_id", name="unique_car_reporter"),
    )