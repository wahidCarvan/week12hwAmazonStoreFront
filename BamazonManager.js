//INITIALIZES THE NPM PACKAGES USED//
var mysql = require('mysql');
// inquirer lets user type in a response
var inquirer = require('inquirer');
// linking the password file
var password = require('./password.js')
console.log(password);
//INITIALIZES THE CONNECTION VARIABLE TO SYNC WITH A MYSQL DATABASE//
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", //Your username//
    // calling the password
    password: password.key, //Your password//
    database: "Bamazon"
})

//CREATES THE CONNECTION WITH THE SERVER AND MAKES THE TABLE UPON SUCCESSFUL CONNECTION//
connection.connect(function(err) {
    if (err) {
        console.error("error connecting: " + err.stack);
    }
    makeTable();
})

//FUNCTION TO GRAB THE PRODUCTS TABLE FROM THE DATABASE AND PRINT RESULTS TO CONSOLE//
var makeTable = function() {
    //SELECTS ALL OF THE DATA FROM THE MYSQL PRODUCTS TABLE - SELECT COMMAND!
    connection.query('SELECT * FROM products', function(err, res) {
        if (err) throw err;
        //PRINTS THE TABLE TO THE CONSOLE WITH MINIMAL STYLING// /t spaces it out
        var tab = "\t";
        console.log("ItemID\tProduct Name\tDepartment Name\tPrice\t# In Stock");
        console.log("--------------------------------------------------------");
        //FOR LOOP GOES THROUGH THE MYSQL TABLE AND PRINTS EACH INDIVIDUAL ROW ON A NEW LINE//
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].itemID + tab + res[i].productName + tab + res[i].departmentName + tab + res[i].price + tab + res[i].numberInStock);
        }
        console.log("--------------------------------------------------------");
        //RUNS THE CUSTOMER'S PROMPTS AFTER CREATING THE TABLE. SENDS res SO THE promptCustomer FUNCTION IS ABLE TO SEARCH THROUGH THE DATA//
        promptCustomer(res);
    });
};

//FUNCTION CONTAINING ALL CUSTOMER PROMPTS//
var promptCustomer = function(res) {
    //PROMPTS USER FOR WHAT THEY WOULD LIKE TO PURCHASE//
    inquirer.prompt([{
        type: 'input',
        name: 'choice',
        message: 'What would you like to purchase?'
    }]).then(function(val) {
        console.log(val.choice);
        var itemBuying = val.choice; //SET THE VAR correct TO FALSE SO AS TO MAKE SURE THE USER INPUTS A VALID PRODUCT NAME//
        var correct = false;
        // //LOOPS THROUGH THE MYSQL TABLE TO CHECK THAT THE PRODUCT THEY WANTED EXISTS//
        for (var i = 0; i < res.length; i++) {
            //connection connects to the databse query gives it a query 
            // the function talks to the database  
            if (val.choice == res[i].productName) {
                correct = true;
            }
        }
        // if customer enters the correct choice then will they be asked how many they want.
        inquirer.prompt([{
            type: 'input',
            name: 'choice',
            message: 'How many  would you like to purchase?'
        }]).then(function(val) {
            console.log(val.choice);
            console.log(itemBuying);
            // connects to the database
            connection.query('SELECT * FROM `Products` WHERE `ProductName` = ?', [itemBuying], function(err, res, fields) {
                console.log('----------------------' + res + "&&&&&&&&&&");
                console.log(res[0].numberInStock);
                if (val.choice <= res[0].numberInStock) {
                    console.log("There is enough in stock!")

                    var numberRemaining = res[0].numberInStock - val.choice;
                    console.log(numberRemaining);
                    // update the sql database with the remaining amount for the item.
                    //fix line 82 so the stock updates on the database
                    connection.query('UPDATE products SET numberInStock = ? WHERE productName = ?', ['a', itemBuying], function(err, results) {
                        console.log(results);
                    });


                } else if (val.choice > res[0].numberInStock) {
                    console.log("There is not enough in stock");

                }
            });

        });


    });



    // error will be an Error if one occurred during the query 
    // results will contain the results of the query 
    // fields will contain information about the returned results fields (if any) 
    //   //2. TODO: CHECK TO SEE IF THE AMOUNT REQUESTED IS LESS THAN THE AMOUNT THAT IS AVAILABLE//                       
    //   //3. TODO: UPDATE THE MYSQL TO REDUCE THE StockQuanaity by the THE AMOUNT REQUESTED  - UPDATE COMMAND!
    //   //4. TODO: SHOW THE TABLE again by calling the function that makes the table
    // }

    // //IF THE PRODUCT REQUESTED DOES NOT EXIST, RESTARTS PROMPT//
    // if (i == res.length && correct == false) {
    //     promptCustomer(res);
    // }
};

