const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
mongoose.connect("mongodb://127.0.0.1:27017/To-Do-List");



var today = new Date();
var options = {
                    weekday: "long",
                    day: "numeric",
                    month: "long"
              };
var day = today.toLocaleDateString("en-US", options);

// const itemarray =["wake Up", "Bathing"];
// const workarray = ["learn", "read"];

const itemSchema = {
                        name: String
                    };

const Item = mongoose.model(
                                "item",
                                itemSchema
                            );
const item1 = new Item({
                            name: "Wake Up"
                    });
const item2 = new Item({
                            name: "Bathing"
                    });

const defaultarray = [item1, item2];

const searchSchema = {
                        name: String,
                        items: [itemSchema]   
                    };

const customList = mongoose.model("custom", searchSchema);                    

app.get("/", function(req, res)
            {
                Item.find().then((items)=>{
                                            if(items.length===0)// it is just to stop repeteadly adding the default items while running through nodemon
                                            {
                                                Item.insertMany(defaultarray).then(function(err)
                                                                                    {
                                                                                        console.log("Sucess- check your database");   
                                                                                    })
                                                                            .catch(function(err)
                                                                                    {
                                                                                        console.log(err);
                                                                                    });
                                                res.redirect("/");
                                            }
                                            else
                                            {
                                                res.render("list", {
                                                                        kindOfDay: day,
                                                                        namr: "Mummineni",
                                                                        listitemarray: items
                                                                }
                                                            )
                                            }
                                        });
            }
        );


app.post("/", function(req, res)
            {
                const addeditem = req.body.newItem;
                const addedlistName = req.body.buttonlist;

                const addtoItem = new Item({
                                            name: addeditem
                                        });

                if(addedlistName === day)
                {
                    addtoItem.save();
                    res.redirect("/");
                }
                else
                {
                    customList.findOne({name: addedlistName}).then((foundlist)=>{
                                                                                    if(foundlist)
                                                                                    {
                                                                                        foundlist.items.push(addtoItem);
                                                                                        foundlist.save();
                                                                                        res.redirect("/"+ addedlistName);
                                                                                    }
                                                                                }
                                                                    )
                }
            }
        );

app.post("/delete", function(req, res)
                    {
                        // console.log(req.body);
                        const checkeditemId = req.body.checkBox;
                        const deletelistName = req.body.hiddenName;
                        if(deletelistName === day)
                        {
                            Item.findByIdAndDelete(checkeditemId).then(() =>{
                                                                                console.log("has been deleted");
                                                                                res.redirect("/");
                                                                            }
                                                                    )
                                                                    .catch(err=>{
                                                                                    console.log(err);
                                                                                }
                                                                        );
                        }
                        else
                        {
                            customList.findOneAndUpdate({name: deletelistName}, {$pull: {items: {_id: checkeditemId}}}).then((foundlist)=>{   //pull is used to remove list items
                                                                                                                                            res.redirect("/" + deletelistName);
                                                                                                                                        });
                        }
                    });


// app.get("/work", function(req, res)
//                 {
//                     res.render("list", {
//                                             kindOfDay: "Work List",
//                                             namr: "Mummineni",
//                                             listitemarray: workarray
//                                         }
//                                 );
//                 }
//         );


app.get("/check", function(req, res)
                {
                    res.render("checkLayouts");
                }
        );

app.get("/:newlist", function(req, res)
                    {
                        const searchedlistName = _.capitalize(req.params.newlist);
                        // console.log(searchedlistName);
                        customList.findOne({name: searchedlistName}).then((foundlist)=>{
                                                                                            if(!foundlist)
                                                                                            {
                                                                                                const searchedlsit = new customList({
                                                                                                                                        name: searchedlistName,
                                                                                                                                        items: defaultarray
                                                                                                                                    });
                                                                                                searchedlsit.save();
                                                                                                res.redirect("/"+ searchedlistName);
                                                                                            }
                                                                                            if(foundlist)
                                                                                            {
                                                                                                res.render("list", {
                                                                                                                        kindOfDay: foundlist.name,
                                                                                                                        namr: "Mummineni",
                                                                                                                        listitemarray: foundlist.items
                                                                                                                    }
                                                                                                        );
                                                                                            }
                                                                                        }
                                                                        )
                                                                    .catch((err)=>{
                                                                                        console.log("not found");
                                                                                    }
                                                                        )
                    }
        )

app.listen(3000, function()
                {
                    console.log("Server started Mummineni");
                }
            );