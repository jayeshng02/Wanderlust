const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
require("dotenv").config();

const mongoose = require("mongoose");
let initData = require("./data.js");
const Listing = require("../models/listing.js");

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

async function main(){
    await mongoose.connect(MONGO_URL);
}

main()
.then(()=>{
    console.log("DB Connection");
})
.catch((err)=>{
    console.log(err);
});

const initDB = async ()=>{
    await Listing.deleteMany({});
    for(obj of initData.data){
            obj = {...obj,owner:'6ab91517deeb43096770ce29'}
        let response = await geocodingClient.forwardGeocode({
        query: obj.location,
        limit: 2
        }).send();
        obj.geometry=response.body.features[0].geometry;
        await Listing.insertOne(obj);
    }
    console.log("data init");
}

initDB();