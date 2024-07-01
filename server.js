const express=require('express')
const app=express()
const cors=require('cors')
const mongoose=require('mongoose')
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const ejs = require('ejs');

const server = http.createServer(app);
const bcrypt = require('bcryptjs');
const saltRounds = 10
const PayStack = require('paystack-node')
const wss = new WebSocket.Server({ server });
const emailjs = require('@emailjs/nodejs')
const bodyParser = require("body-parser");
const fs = require('fs');
const crypto = require('crypto');
require("dotenv").config()
app.set('view engine', 'ejs')
const environment = 'test';
const {google}=require('googleapis')
const Messages=require('./models/Messages')
const Admin =require('./models/Admin')
const secretKey = require('./config');
const whitelist = ["http://localhost:4000","https://www.abujacar.com","http://127.0.0.1:5174","abujacar","abujacar://app","http://127.0.0.1:5173","https://abujacar.com","http://127.0.0.1:5173"]
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error(origin))
      console.log(origin)
    }
  },
  credentials: true,
}

app.use(cors());
const Cars = require('./models/Cars')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const Userdetails=require('./models/Userdetails')
const Individualdetails=require('./models/Individualdetails')
const Social=require('./models/Socialuserdetails')
const Socialadmin=require('./models/Socialadmindetails')
const Order=require('./models/Orders')
const authenticateToken = require('./auth/Authtoken');
const jwt=require('jsonwebtoken')
const multer=require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination folder for uploaded files
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Set the filename for uploaded files
    const userEmail = req.body.email || 'unknown'; // Use 'unknown' if email is not provided
    const newFilename = `${userEmail}-${file.originalname}`;
    cb(null, Date.now() + '-' + newFilename);
  },
});
const upload = multer({
  storage: storage,
  limits: { files: 5 }, // Set the maximum number of files allowed to 5
});
const id = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination folder for uploaded files
    cb(null, 'id/');
  },
  filename: function (req, file, cb) {
    // Set the filename for uploaded files
    const userEmail = req.params.email || 'unknown'; // Use 'unknown' if email is not provided
    const newFilename = `${userEmail}-${file.originalname}`;
    cb(null, Date.now() + '-' + newFilename);
  },
})
const storage2 = multer.diskStorage({
  destination: 'carimages/', // specify the folder where images will be stored
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.body.email + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const uploadid= multer({ storage: id,
  limits: { files: 10 }
});
const upload2 = multer({ storage: storage2,
  limits: { files: 10 }
});

const storage3 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'inspectorid/'); // specify the folder where ID card images will be stored
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFilename = req.body.email + '-' + uniqueSuffix + path.extname(file.originalname);
    cb(null, newFilename);
  },
});

const upload3 = multer({ storage: storage3 });

const accountSid = process.env.accountSid;
const authToken = process.env.authToken;
const verifySid = process.env.verifySid;



const multer17 = multer({
    storage: multer.diskStorage({
      destination: function (req, file, callback) {
        callback(null, `${__dirname}/audio-files`);
      },
      filename: function (req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
      },
    })
  });
  const authenticateGoogle = () => {
    const auth = new google.auth.GoogleAuth({
      keyFile: `${__dirname}/organic-byway-406821-fb0239b4a0fd.json`,
      scopes: "https://www.googleapis.com/auth/drive",
    });
    return auth;
  }
  const uploadToGoogleDrive = async (file,auth) => {
    const fileMetadata = {
      name: file.originalname,
      parents: ["14Ux27qBK6jhzT1Nkzqa6I2lXTXUbIjyW"], // Change it according to your desired parent folder id
    };
  
    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };
  
    const driveService = google.drive({ version: "v3", auth });
  
    const response = await driveService.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });
    return response;
  };
  const deleteFile = (filePath) => {
    fs.unlink(filePath, () => {
      console.log("file deleted");
    });
  }
  app.post("/api/upload-file-to-google-drive", multer17.single("file"), async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).send("No file uploaded.");
        return;
      }
      const auth = authenticateGoogle();
      const response = await uploadToGoogleDrive(req.file, auth);
      deleteFile(req.file.path);
      res.status(200).json({ response });
    } catch (err) {
      console.log(err);
  }
})



// Route to verify OTP
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    if (!phoneNumber || !code) {
      return res.status(400).json({ error: 'Phone number and verification code are required' });
    }

    // Verifying OTP
    const verification_check = await client.verify.services(verifySid).verificationChecks.create({ to: phoneNumber, code });
    console.log('Verification check status:', verification_check.status);
    res.json({ status: verification_check.status });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})


const socialstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'socialid/'); // specify the folder where ID card images will be stored
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFilename = req.body.email + '-' + uniqueSuffix + path.extname(file.originalname);
    cb(null, newFilename);
  },
});

const socialupload = multer({ storage: socialstorage });




app.put('/api/editmycar/:id',async(req,res)=>{
  try {
    const data=await Cars.findOne({_id:req.params.id,state:'Pending'})
    if(data){
      data.state='Sold'
      data.save()
      res.status(200).json({ok:'Car sold!'})
    }
    else{
      res.status(404).json({error:'not found'})
    }
  } catch (error) {
    res.status(500).json({error:'Internal Issue'})
  }
})


app.put('/api/updatecarinfo/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const carData = req.body;
    const updatedCar = await Cars.findByIdAndUpdate(id, carData, { new: true });

    if (updatedCar) {
      res.json({ success: true, car: updatedCar });
    } else {
      res.status(404).json({ success: false, message: 'Car not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
})

app.post('/api/getcartoedit/:email',async(req,res)=>{
  try {
    const data=await Cars.find({email:req.params.email})
    if(data){
      res.status(200).json(data)
    }else {
      res.status(404).json({error:'not found'})
    }
  } catch (error) {
   
    res.status(500).json({error:'Internal server error'})
  }
})

app.post('/api/socialsignup', async (req, res) => {
  const {
    email,
    phone,
    fullName,
    password,
    address,
    city,
    state
  } = req.body;
const hash= await bcrypt.hash(password,saltRounds)
  try{
    const user=new Social({
      email,
      phone,
      fullName,
      password:hash,
      address,
      city,
      state
    })
    
    await user.save();
    res.status(200).json(user);
  }catch(error){
  console.log(error)
    res.status(500).json({ error: 'Internal server error' });
  }
})

app.post('/api/subscribe',async(req,res)=>{
  try {
    const data=await Userdetails.findOne({email:req.body.email})
    data.token=req.body.token
    if(req.body.subType=='Premium'){
      data.subType="a"+req.body.subType
    }else if(req.body.subType=='Standard'){
      data.subType="b"+req.body.subType
    }
    else if(req.body.subType=="Basic"){
      data.subType="c"+req.body.subType
    }

    await data.save()
    res.status(200).json({ok:'subscription added'})
  } catch (error) {
    res.status(500).json({error:'Internal server error'})
  }
})
app.post('/api/postsocialgoogledetails',async(req,res)=>{
    try{
        const data = await Social.findOne({email:req.body.email})
        data.nin=req.body.nin
        data.address=req.body.address
        data.phone=req.body.phone
        data.state=req.body.state
        data.location=req.body.location
        data.save()
       res.status(200).json({success:'data saved'})
        
    }
    catch(e){
          res.status(500).json({error:'Internal server error'})  
    }
})

app.post('/api/postsocialemaildetails',async(req,res)=>{
    try{
        const data = await Social.findOne({email:req.body.email})
        data.nin=req.body.nin
        data.fullName=req.body.fullName
        data.address=req.body.address
        data.phone=req.body.phone
        data.state=req.body.state
        data.location=req.body.location
        data.save()
       res.status(200).json({success:'fullname saved'})
        
    }
    catch(e){
          res.status(500).json({error:'Internal server error'})  
    }
})

app.get('/api/apple-app-site-association', (req, res) => {
    // Set the appropriate content type
    res.set('Content-Type', 'application/json');

    // Send the AASA file
    res.sendFile(path.join(__dirname, 'apple-app-site-association'));
})

app.post('/api/socialadminsignup', async (req, res) => {
  const {
    email,
    phone,
    fullName,
    password,
    address,
  } = req.body;
const hash= await bcrypt.hash(password,saltRounds)
  try{
    const user=new Socialadmin({
      email,
      phone,
      fullName,
      password:hash,
      address,
    })
    
    await user.save();
    res.status(200).json({success:'Admin Saved'});
  }catch(error){
  console.log(error)
    res.status(500).json({ error: 'Internal server error' });
  }
})
app.delete('/api/deletemycar/:id',async(req,res)=>{
  try {
    const data=await Cars.findByIdAndDelete(req.params.id);
res.status(200).json({ok:'Car successfully deleted'})
  } catch (error) {
    res.status(500).json({error:'Internal issue'})
  }
})


app.post('/api/individual', async (req, res) => {
  try {
    // Generate random idno using hex and crypto
    const randomMessage = Math.floor(Math.random() * 10000000) + 1;

    const tempParams = {
      from_name: 'Abuja Car',
      to_name: req.body.fullName,
      from_email: 'ahmusa118@gmail.com',
      to_email: req.body.email,
      message: `Your verification code is ${randomMessage.toString()}`, // Convert the number to a string
    };
  

 ;


const hash=  await bcrypt.hash(req.body.password,saltRounds)
    // Create Inspector object
    const data = {
      email: req.body.email,
      phone: req.body.phone,
      fullName: req.body.fullName,
      password: hash,
      verification:randomMessage,
      state: req.body.state.toLowerCase(),
      address: req.body.address,
      city:req.body.city
     // Multer will automatically process the file and provide the filename
    };

    const newData = new Individualdetails(data); // Assuming Inspector is your Mongoose model
    await newData.save();
    emailjs.send('service_qxr4zxz', 'template_susux5c', tempParams, {
      publicKey: 'MnDecPoP0PPy4RKQV',
      privateKey: 'IkkTm11TdjrhgGScDbVjJ', // optional, highly recommended for security reasons
    })
   
    res.status(201).json({ message: 'check your email for the verification code' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

const SIZE4 = 5; // Number of documents per page

app.post('/api/search', async (req, res) => {
  const {
    make,
    location,
    category,
    mileage,
    price,
    model,
    used
  } = req.body;

  // Extract the page number from the query string or default to 1
  const page = parseInt(req.query.page) || 1;

  // Calculate the skip value based on the page number
  const skip = (page - 1) * SIZE4;

  // Construct a query object
  let query = { state: 'Pending' };

  // Only include properties in the query object if they are not empty
  if (location !== '') query.location = { $regex: new RegExp(location, 'i') };
  if (make !== '') query.make = { $regex: new RegExp(make, 'i') };
  if (category !== '') query.category = { $regex: new RegExp(category, 'i') };
 if (model !== '') query.model = { $regex: new RegExp(model, 'i') }
 if (used !== '') query.used = { $regex: new RegExp(used, 'i') }
  // For mileage and price, check if the values are within a certain range
  if (mileage[1] > 10) query.mileage = { $gte: mileage[0], $lte: mileage[1] };
  if (price[1] > 10) query.price = { $gte: price[0], $lte: price[1] };

  try {
    const cars = await Cars.find(query)
      .skip(skip)
      .limit(SIZE4);
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});



app.post('/api/addtoken/:email',async(req,res)=>{
  try {
    const data=await Userdetails.findOne({email:req.params.email})
  data.token=data.token+1
    data.save()
    res.status(200).json({success:'Token added'})}
  
  catch (error) {
    res.status(500).json({error:'internal server error'})
  }
})

app.get('/api/getcardetail/:id',async(req,res)=>{
  try {
    const data=await Cars.findOne({requestno:req.params.id})
    if(!data){
      res.status(404).json({error:'not found'})
    }
    else {
      res.status(200).json(data)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({error:'Internal server error'})
  }
})

app.delete('/api/deleteaccount/:account', async (req, res) => {
    try {
const data = await Individualdetails.findOneAndDelete({ email:req.params.account });
        res.status(200).json({ ok: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the account' });
    }
})

app.post('/api/changeindividualpassword/:email',async(req,res)=>{
  try {
    const data =await Individualdetails.findOne({email:req.params.email});
    if(data){
      const hash=  await bcrypt.hash(req.body.password,saltRounds)
      data.password=hash
      data.save()
      res.status(200).json({ok:'Password Changed'})
    } 
    else{
      res.status(404).json({error:'Not found'})
    }
  } catch (error) {
    res.status(500).json({error:'Internal server error'})
  }
})
app.post('/api/forgotindividualpassword/:email',async(req,res)=>{
  try {
    const data =await Individualdetails.findOne({email:req.params.email});
    if(data){
     
     
      const randomMessage = Math.floor(Math.random() * 10000000) + 1;

      const tempParams = {
        from_name: 'Abuja Car',
        to_name: req.params.email,
        from_email: 'ahmusa118@gmail.com',
        to_email: req.params.email,
        message: `Your verification code is ${randomMessage.toString()}`, // Convert the number to a string
      };
    
      emailjs.send('service_qxr4zxz', 'template_susux5c', tempParams, {
        publicKey: 'MnDecPoP0PPy4RKQV',
        privateKey: 'IkkTm11TdjrhgGScDbVjJ', // optional, highly recommended for security reasons
      })
     
     data.verification=randomMessage 
     data.save()
      res.status(200).send({ok:"Check your email for verification code. Check spam folder if not in main inbox",email:data.email,code:randomMessage});
    }
    else {
      res.status(404).json({error:'Email Not found'})
    }
  } catch (error) {
    res.status(500).json({error:'Internal server error'})
  }
})
app.get('/api',(req,res)=>{
    res.send('hello')
})
app.post('/api/forgotsellerpassword/:email',async(req,res)=>{
  try {
    const data =await Userdetails.findOne({email:req.params.email});
    if(data){
     
     
      const randomMessage = Math.floor(Math.random() * 10000000) + 1;

      const tempParams = {
        from_name: 'Abuja Car',
        to_name: req.params.email,
        from_email: 'ahmusa118@gmail.com',
        to_email: req.params.email,
        message: `Your verification code is ${randomMessage.toString()}`, // Convert the number to a string
      };
    
      emailjs.send('service_qxr4zxz', 'template_susux5c', tempParams, {
        publicKey: 'MnDecPoP0PPy4RKQV',
        privateKey: 'IkkTm11TdjrhgGScDbVjJ', // optional, highly recommended for security reasons
      })
     
      data.verification=randomMessage 
      data.save()
      res.status(200).send({ok:"Check your email for verification code. Check spam folder if not in main inbox",email:data.email,code:randomMessage});
    }
    else {
      res.status(404).json({error:'Email Not found'})
    }
  } catch (error) {
    res.status(500).json({error:'Internal server error'})
  }
})

app.post('/api/changesellerpassword/:email',async(req,res)=>{
  try {
    const data =await Userdetails.findOne({email:req.params.email});
    if(data){
      const hash=  await bcrypt.hash(req.body.password,saltRounds)
      data.password=hash
      data.save()
      res.status(200).json({ok:'Password Changed'})
    } 
    else{
      res.status(404).json({error:'Not found'})
    }
  } catch (error) {
    res.status(500).json({error:'Internal server error'})
  }
})

app.post('/api/admin', upload3.single('idimage'), async (req, res) => {
  try {
    // Generate random idno using hex and crypto
    const idno = crypto.randomBytes(4).toString('hex');

const hash= await bcrypt.hash(req.body.password,saltRounds)
    // Create admin
    const adminData = {
      email: req.body.email,
      idno: idno,
      phone: req.body.phone,
      fullName: req.body.fullName,
      password: hash,
      state: req.body.state.toLowerCase(),
      address: req.body.address,
      idimage: req.file.filename, // Multer will automatically process the file and provide the filename
    };

    const newAdmin = new Admin(adminData); // Assuming Inspector is your Mongoose model
    await newAdmin.save();

    res.status(201).json({ message: 'Admin registration successful' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})



app.put('/api/acknowledge/:id/:em',async(req,res)=>{
    try{
        const data=await Order.findOne({_id:req.params.id})
        data.acknowledge='Yes'
        data.editedBy=req.params.em
        await data.save()
        res.status(200).json({success:'Data saved'})
    }
    catch(e){
        res.status(500).json({error:'Internal server error'})
    }
})





app.get('/api/adm', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
})



app.post('/api/cars', upload2.array('images', 10), async (req, res) => {
  try {
    // Generate a random request number
    const randomRequestNo = crypto.randomBytes(4).toString('hex');
    const data = await Userdetails.findOne({ email: req.body.email });

    // Check if data exists and if token is greater than 0
    if (data && data.token > 0) {
      const images = req.files.map(file => file.filename);

      const carData = {
        email: req.body.email,
        phone: req.body.phone,
        fullName: req.body.fullName,
        location: req.body.location,
        carLocation:req.body.carLocation,
        address: req.body.address,
        make: req.body.make,
        year:req.body.year,
        used:req.body.used,
        model:req.body.model,
        transmission:req.body.transmission,
        color:req.body.color,
        category: req.body.category,
        mileage: req.body.mileage,
        subType:req.body.subType,
        images: images,
        price: req.body.price,
        newPrice: req.body.price,
        requestno: randomRequestNo, // Use the same request number for both car record and response
      };

      // Decrement the token count
      data.token = data.token - 1;

      // Save updated user details
      await data.save();

      // Save new car data
      const newCar = new Cars(carData);
      await newCar.save();

      // Send success response with request number
      res.status(201).json(newCar.requestno);
    } else {
      // If token is not greater than 0, send error response
      res.status(400).json({ error: 'Insufficient tokens' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

;

// API endpoint for uploading utility bill image and NIN image
app.get('/api/totalItems', async (req, res) => {
  try {
    const totalItems = await Cars.countDocuments({ state: 'Accepted' }); // Adjust the condition based on your requirements
    res.status(200).json({ totalItems });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
})

app.get('/api/totalOrderItems', async (req, res) => {
  try {
    const totalItems = await Order.countDocuments(); // Adjust the condition based on your requirements
    res.status(200).json({ totalItems });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
})
const PAGE_SIZE = 6;

app.get('/api/approvedtl', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;

    const data = await Cars.find({ state: "Accepted" })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE);

    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
const SIZE = 6;
app.get('/api/checkordertl', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const search = req.query.search; // Get the search query from request
    const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined; // Get the start date from request
    const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined; // Get the end date from request

    // Set the time component of startDate to 0 if it's defined
    if (startDate) {
      startDate.setHours(0, 0, 0, 0);
    }

    // Set the time component of endDate to 0 if it's defined
    if (endDate) {
      endDate.setHours(23, 59, 59, 999); // Set hours to 23 (11 PM), minutes to 59, seconds to 59, and milliseconds to 999
    }

    // Define the search criteria
    const searchCriteria = {
      $or: [
        { make: { $regex: search, $options: 'i' } },
        { requestno: { $regex: search, $options: 'i' } }, // Case-insensitive regex search for receipt number
        { fullName: { $regex: search, $options: 'i' } }, // Case-insensitive regex search for full name
        { email: { $regex: search, $options: 'i' } } ,
        { vin: { $regex: search, $options: 'i' } },
        { nin: { $regex: search, $options: 'i' } }
      ]
    };

    // Add timestamp criteria if both startDate and endDate are defined
    if (startDate && endDate) {
      searchCriteria.timestamp = { $gte: startDate, $lte: endDate };
    }

    // Fetch data based on search criteria and pagination
    const data = await Order.find(searchCriteria)
      .skip((page - 1) * SIZE)
      .limit(SIZE);

    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});







app.post('/api/upload-images/:email', upload.fields([{ name: 'utilityBillImage', maxCount: 1 }, { name: 'ninImage', maxCount: 1 }]),
  async (req, res) => {
    try {
      const userEmail = req.params.email;
      const utilityBillImage = req.files['utilityBillImage'][0];
      const ninImage = req.files['ninImage'][0];

      // New filenames with email prefix
      const newUtilityBillFilename = `${userEmail}-${utilityBillImage.originalname}`;
      const newNinFilename = `${userEmail}-${ninImage.originalname}`;

      // Move the uploaded files to the uploads folder
      const utilityBillImagePath = path.join(__dirname, 'uploads', newUtilityBillFilename);
      const ninImagePath = path.join(__dirname, 'uploads', newNinFilename);

      fs.rename(utilityBillImage.path, utilityBillImagePath, (err) => {
        if (err) throw err;
      });

      fs.rename(ninImage.path, ninImagePath, (err) => {
        if (err) throw err;
      });

      res.json({ message: 'Files uploaded successfully.' });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({ error: error });
    }
  }
);


app.post('/api/upload-id/:email', uploadid.fields([{ name: 'utilityBillImage', maxCount: 1 }, { name: 'ninImage', maxCount: 1 }]),
  async (req, res) => {
    try {
      const userEmail = req.params.email;
      const utilityBillImage = req.files['utilityBillImage'][0];
      const ninImage = req.files['ninImage'][0];

      // New filenames with email prefix
      const newUtilityBillFilename = `${userEmail}-${utilityBillImage.originalname}`;
      const newNinFilename = `${userEmail}-${ninImage.originalname}`;

      // Move the uploaded files to the uploads folder
      const utilityBillImagePath = path.join(__dirname, 'id', newUtilityBillFilename);
      const ninImagePath = path.join(__dirname, 'id', newNinFilename);

      fs.rename(utilityBillImage.path, utilityBillImagePath, (err) => {
        if (err) throw err;
      });

      fs.rename(ninImage.path, ninImagePath, (err) => {
        if (err) throw err;
      });

      res.json({ message: 'Files uploaded successfully.' });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({ error: error });
    }
  }
);

app.post('/api/socialupload-images/:email', socialupload.fields([{ name: 'utilityBillImage', maxCount: 1 }, { name: 'ninImage', maxCount: 1 }]),
  async (req, res) => {
    try {
      const userEmail = req.params.email;
      const utilityBillImage = req.files['utilityBillImage'][0];
      const ninImage = req.files['ninImage'][0];

      // New filenames with email prefix
      const newUtilityBillFilename = `${userEmail}-${utilityBillImage.originalname}`;
      const newNinFilename = `${userEmail}-${ninImage.originalname}`;

      // Move the uploaded files to the uploads folder
      const utilityBillImagePath = path.join(__dirname, 'socialutilityimage', newUtilityBillFilename);
      const ninImagePath = path.join(__dirname, 'socialid', newNinFilename);

      fs.rename(utilityBillImage.path, utilityBillImagePath, (err) => {
        if (err) throw err;
      });

      fs.rename(ninImage.path, ninImagePath, (err) => {
        if (err) throw err;
      });

      res.json({ message: 'Files uploaded successfully.' });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({ error: error });
    }
  }
)
app.get("/api/ind/:name", function(req, res) {
  const {name}=req.params
res.sendFile(__dirname +'/uploads' +"/"+ name);
})

app.get('/api/getcar/:id', async (req, res) => {
  try {
    const car = await Cars.findById(req.params.id);
    if (!car) {
      res.status(404).json({ error: 'Car not found' });
    } else {
      res.json(car);
    }
  } catch (error) {
  console.log(error)
    console.error('Error getting car by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to update a car by ID
// Update car record by ID


;
app.get("/api/indcar/:name", function(req, res) {
  const {name}=req.params
res.sendFile(__dirname +'/carimages' +"/"+ name);
})
const config = {
  lang: "eng",
  oem: 1,
  psm: 3,
}


app.put('/api/postdata/:email/:nin/:utility',async(req,res)=>{

  try{
    const data =await Userdetails.findOne({email:req.params.email}) 
    if(data){
      if(data.verified=='No'){
data.verified='Yes'
data.idimage=req.params.nin
data.utilityimage=req.params.utility

  data.save()
  res.status(200).json(data)
      }else{
        res.status(409).json("Already Verified")
      }
  }
    else{
      res.status(400).json({error:'not found'})
    }
  }
  catch(e){
res.status(500).json({error:e})
  }

})




app.put('/api/socialpostdata/:email/:nin/:utility/:nin',async(req,res)=>{

  try{
    const data =await Social.findOne({email:req.params.email}) 
    if(data){
      if(data.verified=='No'){
data.verified='Yes'
data.idimage=req.params.email+"-"+req.params.nin
data.utilityimage=req.params.email+"-"+req.params.utility
data.nin=req.params.nin

  data.save()
  res.status(200).json(data)
      }else{
        res.status(409).json("Already Verified")
      }
  }
    else{
      res.status(400).json({error:'not found'})
    }
  }
  catch(e){
res.status(500).json({error:e})
  }

})
app.post('/api/userlogin', async (req, res) => {
  const det = await Userdetails.findOne({
    email: { $regex: new RegExp(req.body.email, 'i') }
  });

  if (!det) {
    res.json({ error: 'Wrong username' });
  } else if (!(await bcrypt.compare(req.body.password,det.password))) {
    res.json({ error: 'Wrong password' });
  } else {
    const token = jwt.sign({ userId: det._id }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  }
})



app.post('/api/carrequest/:email',async(req,res)=>{

  try{
    const message=new Messages({
      customerfullName:req.body.customerfullName,
      customeremail:req.body.customeremail,
      customerphone:req.body.customerphone,
      location:req.body.location,
      inspectoremail:req.params.email,
      requestno:req.body.requestno,
      inspectedBy:req.body.inspectedBy,
      images:req.body.images,
      price:req.body.price,
      make:req.body.make,
      mileage:req.body.mileage
    })
await message.save()
res.status(200).json({ok:'data saved'})
  }
  catch(e){
    console.log(e)
    res.status(500).json({e:e})
  }
})

app.put('/api/sold/:requestno', async (req, res) => {
  try {
    const { requestno } = req.params;
    
    // Use findOne instead of find
    const data = await Cars.findOne({ requestno: requestno });

    if (!data) {
      return res.status(404).json({ error: 'Car not found' });
    }

    await Messages.updateMany(
      { requestno },
      { $set: { decision: 'Sold' } }
    );

    // Update the state property of the found car
    data.state = 'Sold';

    // Save the updated car document
    await data.save();

    res.status(200).json({ ok: 'Car sold' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post("/email/:email", (req, res) => {

const tempParmas={
  from_name:'Abuja Car',
    to_name:'Ahmed',
    from_email:'ahmusa118@gmail.com',
    to_email:req.params.email,
    message:`fitsari`
}

emailjs
  .send('service_qxr4zxz', 'template_susux5c', tempParmas, {
    publicKey: 'MnDecPoP0PPy4RKQV',
    privateKey: 'IkkTm11TdjrhgGScDbVjJ', // optional, highly recommended for security reasons
  })
  .then(
    function (response) {
     res.status(200).json('SUCCESS!', response.status, response.text);
    },
    function (err) {
      res.status(500).json('FAILED...', err);
    })

 


})



app.post('/api/verify/:email', async (req, res) => {
  try {
    const email = req.params.email;
    // Find the user by email and update verification status
    await Individualdetails.findOneAndUpdate({ email }, { verified: 'yes' });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
})




app.post('/api/individualogin', async (req, res) => {
  try {
    const det = await Individualdetails.findOne({
      email: { $regex: new RegExp(req.body.em, 'i') }
    });

    if (!det) {
      return res.json({ error: 'Wrong username' });
    } 

    
    if (det.verified === 'No') {
      return res.json({ status: 'None',code:det.verification,email:det.email });
    }

    
    // Verify password if the account is verified
    if (await bcrypt.compare(req.body.pass, det.password)) {
      const token = jwt.sign({ userId: det._id }, secretKey, { expiresIn: '1h' });
      return res.json({ token });
    } else {
      return res.json({ error: 'Wrong password' });
    }
  } catch (error) {
    console.error('Error:', error);
    console.log(req.body)
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/getusermessages/:email', async(req,res)=>{
  try {
    const data=await Messages.find({customeremail:req.params.email})
    if(data){
      res.status(200).json(data)
    }
    else{
      res.status(404).json({err:'not found'})
    }
  } catch (error) {
    res.status(500).json({error:'Internal server error'})
  }
})





///improved search
const SIZE3 = 3; // Number of documents per page

app.get('/api/improvedcars', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const search = req.query.search; // Get the search query from request

    // Define the sort criteria to sort by 'subType' in ascending order
    const sortCriteria = { subType: 1 };

    // Define the search criteria
    const searchCriteria = {
      state: 'Pending',
      $or: [
        { make: { $regex: search, $options: 'i' } },
        { requestno: { $regex: search, $options: 'i' } }, // Case-insensitive regex search for receipt number
        { location: { $regex: search, $options: 'i' } }, // Case-insensitive regex search for full name
         { model: { $regex: search, $options: 'i' } },
      ]
    };

    // Fetch data based on search criteria, sort criteria, and pagination
    const data = await Cars.find(searchCriteria)
      .sort(sortCriteria)
      .skip((page - 1) * SIZE3)
      .limit(SIZE3);

    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/delete/:email/:reqno', async (req, res) => {
  try {
    const data = await Individualdetails.findOne({ email: req.params.email });

    if (data) {
      // Find the index of the item to delete in the saved array
      const indexToDelete = data.saved.findIndex(item => item.requestno === req.params.reqno);

      if (indexToDelete !== -1) {
        // If item found, remove it from the array
        data.saved.splice(indexToDelete, 1);
        await data.save();
        return res.status(200).json({ success: 'Item deleted from bookmarks' });
      } else {
        return res.status(404).json({ error: 'Item not found in bookmarks' });
      }
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/save/:email', async (req, res) => {
  try {
  // Get the user's data from the database
  const data = await Individualdetails.findOne({ email: req.params.email });

  // Check if user data is found
  if (data) {
    // Check if the request number is already in the saved array
    const isRequestNoPresent = data.saved.some(item => item.requestno === req.body.requestno);

    if (isRequestNoPresent) {
      // If reqno already exists in the array, return already bookmarked response
      return res.status(200).json({ alert: 'Already bookmarked' });
    } else {
      // If reqno doesn't exist, push it to the array and save the document
      data.saved.push(req.body);
      await data.save();
      return res.status(200).json({ success: 'Saved to bookmarks' });
    }
  } else {
    return res.status(404).json({ error: 'User not found' });
  }
} catch (error) {
  console.error('Error while saving data to bookmarks:', error);
  return res.status(500).json({ error: 'Internal server error' });
}

});




app.post('/api/getsavedata/:email', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;

    const data = await Individualdetails.findOne({ email: req.params.email });

    if (data) {
      const SIZE = 3; // Number of items per page
      const startIndex = (page - 1) * SIZE;
      const endIndex = startIndex + SIZE;

      const paginatedData = data.saved.slice(startIndex, endIndex);

      const totalResults = data.saved.length;

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalResults / SIZE),
        data: paginatedData
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/googlesignin/:email/:fullname',async(req,res)=>{
  try {
    const data=await Individualdetails.findOne({email:req.params.email})
    if(!data){
      const insert=new Individualdetails({email:req.params.email,fullName:req.params.fullname})
      await insert.save()
      res.status(200).json(insert)
    }
    else{
      res.status(200).json(data)
    }
  } catch (error) {
    res.status(500).json({error:'Internal server error'})
  }
})
app.get('/api/individualdashboard', authenticateToken, async (req, res) => {
  const userId = req.userId;
try {
  const house = await Individualdetails.findById(userId);
  if (!house) {
   
    res.status(404).json({ error: 'details not found' });
  }  else {
    const data={_id:house._id,  
      email: house.email,
    phone:house.phone,
    fullName:house.fullName,
    password:house.password,
       city: house.city,
    state:house.state,
    address: house.address,
    state:house.state,
    saved:house.saved
  
  }
res.status(200).json(data)
   
  }
} catch (error) {
console.log(error)
  res.status(500).json({error:`Internal server error `})
}
 


})


  
    


    app.get('/api/userdashboard', authenticateToken, async (req, res) => {
        const userId = req.userId;
      
        const house = await Userdetails.findById(userId);
      
        if (!house) {
          res.status(404).json({ error: 'details not found' });
        } else {
          res.json(house);
        }
      })


     



      app.get('/api/socialadmindashboard', authenticateToken, async (req, res) => {
        const userId = req.userId;
      
        const house = await Socialadmin.findById(userId);
      
        if (!house) {
          res.status(404).json({ error: 'details not found' });
        } else {
          res.json(house);
        }
      })






    app.get('/api/socialdashboard', authenticateToken, async (req, res) => {
      const userId = req.userId;
    
      const house = await Social.findById(userId);
    
      if (!house) {
        res.status(404).json({ error: 'details not found' });
      } else {
        res.json(house);
      }
    })
      app.post('/api/sociallogin', async (req, res) => {
        const det = await Social.findOne({
          email: { $regex: new RegExp(req.body.email, 'i') }
        });
      
        if (!det) {
          res.json({ error: 'Wrong username' });
        } else if (!(await bcrypt.compare(req.body.password,det.password))) {
          res.json({ error: 'Wrong password' });
        } else {
          const token = jwt.sign({ userId: det._id }, secretKey, { expiresIn: '1h' });
          res.json({ token });
        }
      })

app.post('/api/socialgooglesignin/:email/:fullname',async(req,res)=>{
  try {
    const data=await Social.findOne({email:req.params.email})
    if(!data){
      const insert=new Social({email:req.params.email,fullName:req.params.fullname,verified:'Yes',method:'google'})
      await insert.save()
      res.status(200).json(insert)
    }
    else{
      res.status(200).json(data)
    }
  } catch (error) {
    res.status(500).json({error:'Internal server error'})
  }
})


app.post('/api/socialemailsignin/:email',async(req,res)=>{
  try {
    const data=await Social.findOne({email:req.params.email})
    if(!data){
      const insert=new Social({email:req.params.email,verified:'Yes',method:'email'})
      await insert.save()
      res.status(200).json(insert)
    }
    else{
      res.status(200).json(data)
    }
  } catch (error) {
      console.log(error)
    res.status(500).json({error:'Internal server error'})
  }
})

      app.post('/api/socialadminlogin', async (req, res) => {
        const det = await Socialadmin.findOne({
          email: { $regex: new RegExp(req.body.email, 'i') }
        });
      
        if (!det) {
          res.json({ error: 'Wrong username' });
        } else if (!(await bcrypt.compare(req.body.password,det.password))) {
          res.json({ error: 'Wrong password' });
        } else {
          const token = jwt.sign({ userId: det._id }, secretKey, { expiresIn: '1h' });
          res.json({ token });
        }
      })

app.post('/api/postuserdetails', async(req,res)=>{
    const {
      email,
      phone,
      fullName,
      password,
      address,
      city,
      state
    } = req.body;




const hash= await bcrypt.hash(password,saltRounds)
    try{
      const user=new Userdetails({
        email,
        phone,
        fullName,
        password:hash,
        address,
        city,
        state
      })
      
      await user.save();
      res.status(200).json(user);
    }catch(error){
    console.log(error)
      res.status(500).json({ error: 'Internal server error' });
    }
  })

  const storage4 = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'carreport/'); // specify the folder where ID card images will be stored
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const newFilename = req.body.email + '-' + uniqueSuffix + path.extname(file.originalname);
      cb(null, newFilename);
    },
  });
  
  const upload4 = multer({ storage: storage4 }).array('images', 10);
  

  

//payments


const paystack = new PayStack(process.env.APIKEY, environment)
app.get('/api/chg/:email/:phone/:fullName/:location/:state/:address/:price/:make/:category/:mileage/:year/:vin/:color/:orderType/:charge/:nin', (req, res) => {
  try {
      const { email, phone, fullName, location, state, address, price, make, category, mileage, year, vin, color, orderType, charge,nin } = req.params;
      
      // Render the paystack template and pass the email and total variables as data
      res.render('paystack', { email, phone, fullName, location, state, address, price, make, category, mileage, year, vin, color, orderType, charge,nin });
  } catch (error) {
      console.error('Error rendering paystack template:', error);
      res.status(500).send('Internal Server Error'); // Send an error response to the client
  }
});

app.get('/api/charge/:email/:subType/:charge/:token',async(req,res)=>{
  try {
    const {charge,email,subType,token}=req.params
    res.render('paystack2',{charge,email,subType,token})
  } catch (error) {
    console.error('Error rendering paystack template:', error);
    res.status(500).send('Internal Server Error'); // Send an error response to the client

  }
})

app.post('/api/charge', async (req, res) => {
  // Log the payment details
try {
  const {nin,receiptNo,email,charge,fullName,phone,location,state,address,make,category,mileage,year,vin,color,orderType}=req.body
  const order=new Order({nin,requestno:receiptNo,email,fullName,charge,phone,location,state,address,make,category,mileage,year,vin,color,orderType,paid:'Yes'})
  await order.save();
  res.status(200).json({success:'Data Saved'});
} catch (error) {
  console.log(error)
  res.status(500).json({error:'Internal server error'})
}

})

app.post('/api/carreceiptcharge', async (req, res) => {
  // Log the payment details
try {
  const {amountInWords,model,currencyType,receiptNo,email,charge,fullName,phone,location,state,address,make,category,year,vin,color,orderType}=req.body
  const order=new Order({amountInWords,model,currencyType,requestno:receiptNo,email,fullName,charge,phone,location,state,address,make,category,year,vin,color,orderType,paid:'Yes'})
  await order.save();
  res.status(200).json({success:'Data Saved'});
} catch (error) {
  console.log(error)
  res.status(500).json({error:'Internal server error'})
}

})





async function connectToMongoDB() {
    try {
      await mongoose.connect(process.env.URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
      // Continue with your code after successful connection
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      // Handle error
    }
  }
  
  connectToMongoDB();
app.listen(4000,()=>console.log('connected'))