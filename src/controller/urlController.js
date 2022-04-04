const urlModel=require("../model/urlModel")
const nanoId=require('nanoid');
const { findOne } = require("../model/urlModel");

const urlShortener = async function(req,res){

    let longUrl=req.body.longUrl; 

    // If body is empty 
    if(Object.keys(req.body).length==0) return res.status(400).send({status: false, message: "Please Provide a Long URL"}) 
    
    //removing spaces from url input
    longUrl=longUrl.trim();
    if(!longUrl) return res.status(400).send({status: false, message: "Please Provide a Long URL"})  

    //function to check valid url   
    let a=/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
    if(!(a.test(longUrl))) return res.status(400).send({status: false, message: "Please Enter a Valid URL"}) 

    //checking if longUrl exists in db 
    let checkUrl=await urlModel.findOne({longUrl})
    if(checkUrl) return res.status(400).send({status: false, data:checkUrl}) 

    let baseUrl="http://localhost:3000/" 
    let code=nanoId.nanoid()
    let urlCode=""  
    for (let i = 0; i < code.length; i++) {
        urlCode += code[i].charCodeAt(0);
    }

    //function to shorten url
    let urlCodeToShortURL=function (n)
    { 
    // Map to store 62 possible characters
    let map = "abcdefghijklmnopqrstuvwxyzABCDEF"
    "GHIJKLMNOPQRSTUVWXYZ0123456789";
    let shorturl = []; 
    // Convert given integer id to a base 62 number
    while (n){
        // use above map to store actual character
        // in short url
        shorturl.push(map[n % 62]);
        n = Math.floor(n / 62);
    }
    // Reverse shortURL to complete base conversion
    shorturl.reverse();
    return shorturl.join("");
    }
    urlCode=urlCodeToShortURL(urlCode)
    let urldata={longUrl:longUrl, shortUrl:baseUrl+urlCode, urlCode:urlCode};
    let data=await urlModel.create(urldata)
    return res.status(201).send({status:true, data:data})    
}

const getURL= async function(req,res){

    let urlCode=req.params.urlCode;

    let validUrlCode=await urlModel.findOne({urlCode:urlCode})
    if(!validUrlCode) return res.status(404).send({status: false, message: "URL Code doesn't exists"})

    let url=validUrlCode.longUrl;
   // Response.redirect(url, 301);
    return res.redirect(302, url)//302 Found means that the requested resource has been moved temporarily to a new URL
}

module.exports.urlShortener=urlShortener;
module.exports.getURL=getURL;