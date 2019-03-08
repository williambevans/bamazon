var inquirer = require("inquirer");

var mysql = require("mysql");

var figlet = require('figlet');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "yourRootPassword",
    database: "bamazon_DB"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log('');
    console.log("You are connected as ID:" + connection.threadId + ". Please take a moment to view our inventory.");
    console.log('');
});

figlet('Welcome to Bamazon', function (err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data);
    afterConnection();
});


function afterConnection() {

    connection.query("SELECT * FROM products", function (err, res) {

        console.table(res);
        console.log("-----------------------------------");
        prompt();
    });
}

function prompt() {
    inquirer.prompt([{
        type: "input",
        message: "What is the ID of the product you would like to purchase?",
        name: "productId"

    }, {
        type: 'input',
        message: 'How many units would you like to purchase?',
        name: 'purchaseUnits'

    }]).then(function (inquirerResponse) {
        var userIdSelection = (inquirerResponse.productId);
        var userPurchaseUnits = (inquirerResponse.purchaseUnits);

        function purchaseItem() {
            var query = connection.query("SELECT * FROM products WHERE item_id=?", [userIdSelection], function (err, res) {
                var updateStockUnits = (res[0].stock_quantity - userPurchaseUnits);
                var salesPrice = (res[0].price * userPurchaseUnits);

                console.log('Your total is: $' + salesPrice);

                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [{
                            stock_quantity: updateStockUnits
                        },
                        {
                            item_id: userIdSelection
                        }
                    ],
                    function (error) {
                        if (error) throw err;
                        console.log("Your Order Has Been Placed!");
                    }
                );
            });
        }
        purchaseItem();
    });
}