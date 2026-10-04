
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const listingController = require("../controllers/listings.js");
const {storage} = require("../cloudConfig.js");
const multer  = require('multer');
const upload = multer({storage});

// Index and Create
router.route("/")
.get(wrapAsync(listingController.index))
.post(
    isLoggedIn,
    validateListing,
    upload.single("listing[image]"),
    wrapAsync(listingController.createListing)
);

// NEW ROUTE
router.get("/new",isLoggedIn,listingController.newForm);

// delete,Update and show route
router.route("/:id")
.get(wrapAsync(listingController.showListing))
.patch(
    isLoggedIn,
    isOwner,
    validateListing,
    upload.single("listing[image]"),
    wrapAsync(listingController.updateListing))
.delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.deleteListing));


// EDIT ROUTE
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.editForm));


module.exports=router;