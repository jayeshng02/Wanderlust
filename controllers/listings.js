const Listing = require("../models/listing.js");
const {cloudinary} = require("../cloudConfig.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index=async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}

module.exports.newForm=(req,res)=>{
        res.render("listings/new.ejs");
}

module.exports.showListing=async (req,res)=>{
    let{id} = req.params;
    let listing = await Listing.findById(id)
    .populate({path:"reviews",
        populate:{
            path:"author",
    }})
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you Requested for does not exits");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing})
}

module.exports.createListing=async (req, res) => {
    
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 2
        })
        .send();

        const listing = new Listing(req.body.listing);
        listing.owner = req.user._id;
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image={url,filename};
     }
        listing.geometry = response.body.features[0].geometry;
        let savedListing =await listing.save();
        console.log(savedListing);
        req.flash("success", "New Listing Created");
        res.redirect("/listings");
}

module.exports.editForm=async (req,res)=>{
    let{id} = req.params;
    let listing = await Listing.findById(id);
        if(!listing){
        req.flash("error","Listing you Requested for does not exits");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
}

module.exports.updateListing=async(req,res)=>{
    let{id} = req.params;
    let prevData = await Listing.findById(id);
    let listing = await Listing.findByIdAndUpdate(id,req.body.listing,{ new: true });
    console.log(listing);
    if(typeof req.file !== "undefined"){
        if(prevData.image && prevData.image.filename!=="listing Image"){
            await cloudinary.uploader.destroy(prevData.image.filename)
        }
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    if (listing.image && listing.image.filename !== "listing Image") {
        await cloudinary.uploader.destroy(listing.image.filename);
    }
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};