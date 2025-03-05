const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const { validationResult, body, check } = require("express-validator");
const Cars = require("./model/cars");
const app = express();
const port = 3000;
require("./utils/db");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(methodOverride("_method"));
app.use(flash());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/cars", async (req, res) => {
  const cars = await Cars.find();
  res.render("cars", {
    cars,
    msg: req.flash("msg"),
  });
});

app.get("/cars/add", (req, res) => {
  res.render("add-cars");
});

app.delete("/cars", async (req, res) => {
  await Cars.deleteOne({ type: req.body.type });
  req.flash("msg", "Data Mobil berhasil dihapus");
  res.redirect("/cars");
});

app.get("/cars/edit/:type", async (req, res) => {
  const car = await Cars.findOne({ type: req.params.type });
  res.render("edit-cars", {
    car,
  });
});

app.post("/cars/filter", async (req, res) => {
  const { brand } = req.body;
  const cars = await Cars.find({ brand: brand });
  res.render("filter-cars", {
    cars,
  });
});

app.put(
  "/cars",
  [
    body("type").custom(async (value, { req }) => {
      const duplikat = await Cars.findOne({ type: value });
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Tipe sudah pernah digunakan");
      }
      return true;
    }),
  ],
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.render("edit-cars", {
        errors: result.array(),
        contact: req.body,
      });
    } else {
      await Cars.updateOne(
        { _id: req.body._id },
        {
          $set: {
            brand: req.body.brand,
            type: req.body.type,
            warna: req.body.warna,
            harga: req.body.harga,
          },
        }
      );
      req.flash("msg", "Data contact Berhasil Diubah");
      res.redirect("/cars");
    }
  }
);

app.post(
  "/cars",
  [
    body("type").custom(async (value) => {
      const duplikat = await Cars.findOne({ type: value });
      if (duplikat) {
        throw new Error("Tipe Mobil Sudah Ada!");
      }
      return true;
    }),
  ],
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.render("add-cars", {
        errors: result.array(),
      });
    } else {
      try {
        await Cars.insertMany(req.body); // Tidak lagi menggunakan callback
        req.flash("msg", "Data Mobil berhasil ditambahkan");
        res.redirect("/cars");
      } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
      }
    }
  }
);

app.listen(port, () => {
  console.log(`Mongo contact app | listening at http:localhost:${port}`);
});
