if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

module.exports = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI
};