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
    console.log("You are connected as ID:" + connection.threadId + ". Please review with your General Manager before making any system changes.");
    console.log('');
});

figlet('Bamazon Manager Terminal', function (err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data);
    afterConnection();
});


function afterConnection() {
    inquirer
        .prompt([
            // Here we create a basic text prompt.
            {
                type: "input",
                message: "Enter employee ID number:",
                name: "username"
            },
            // Here we create a basic password-protected text prompt.
            {
                type: "password",
                message: "Enter password:",
                name: "password"
            },
            // Here we give the user a list to choose from.
            {
                type: "list",
                message: "Choose from the following:",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
                name: "managerPrompts"
            }
        ])
        .then(function (inquirerResponse) {
            // If the inquirerResponse confirms, we displays the inquirerResponse's username and pokemon from the answers.
            if (inquirerResponse.managerPrompts == "View Products for Sale") {
                console.log("\nWelcome Bamazon Employee: " + inquirerResponse.username);
                console.log('');
                productsForSale();
            } else if (inquirerResponse.managerPrompts == "View Low Inventory") {
                console.log("\nWelcome Bamazon Employee: " + inquirerResponse.username);
                console.log('');
                lowInventory();
            } else if (inquirerResponse.managerPrompts == "Add to Inventory") {
                console.log("\nWelcome Bamazon Employee: " + inquirerResponse.username);
                console.log('');
                itemsInStock();
            } else if (inquirerResponse.managerPrompts == "Add New Product") {
                console.log("\nWelcome Bamazon Employee: " + inquirerResponse.username);
                console.log('');
                addNewProduct();
            } else {
                console.log("Invalid input...please re-run manager options.")
            }
        });
}


function productsForSale() {
    console.log('');
    console.log('Current Product Inventory:')
    console.log('');
    connection.query("SELECT * FROM products", function (err, res) {
        console.table(res);
    });

}


function lowInventory() {
    console.log('');
    console.log('Stock is under 5 units for the following items, please place order asap: ');
    console.log('');
    connection.query("SELECT * FROM products", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            var lowProduct = (res[i]);
            var stockQuantity = (res[i].stock_quantity);
            if (stockQuantity < 5) {
                console.table(lowProduct);
            }
        }
    });
}

function itemsInStock() {
    connection.query("SELECT * FROM products", function (err, res) {
        console.table(res);
        addToInventory();
    });
}


function addToInventory() {

    inquirer.prompt([{
        type: "input",
        message: "What is the ID of the product you would like to order?",
        name: "productId"

    }, {
        type: 'input',
        message: 'How many units would you like to order?',
        name: 'managerUpdateUnits'

    }]).then(function (inquirerResponse) {
        var userIdSelection = (inquirerResponse.productId);
        var managerUpdateUnits = (inquirerResponse.managerUpdateUnits);
        var query = connection.query("SELECT * FROM products WHERE item_id=?", [userIdSelection], function (err, res) {
            var updateStockUnits = (res[0].stock_quantity + parseInt(managerUpdateUnits));
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
                    var query = connection.query("SELECT * FROM products WHERE item_id=?", [userIdSelection], function (err, res) {
                        var updatedProduct = (res[0]);
                        console.log('');
                        console.log(managerUpdateUnits + ' Units of ' + updatedProduct.product_name + ' have been ordered.')
                        console.log('');
                        console.log('Current Inventory After Order Processed:')
                        console.log('');
                        console.table(updatedProduct);
                    });
                }
            );
        });
    });
}


function addNewProduct() {

    inquirer.prompt([{
        type: "input",
        message: "What is the product name being added to inventory?",
        name: "productName"

    }, {
        type: 'input',
        message: 'What department is the item being added to?',
        name: 'productDepartment'

    }, {
        type: 'input',
        message: 'What is the price of the item being added to inventory?',
        name: 'productPrice'
    }, {
        type: 'input',
        message: 'How many units of the item are being added to inventory?',
        name: 'productUnits'
    }]).then(function (inquirerResponse) {
        var productName = (inquirerResponse.productName);
        var productDepartment = (inquirerResponse.productDepartment);
        var productPrice = (inquirerResponse.productPrice);
        var productUnits = (inquirerResponse.productUnits);
        var query = connection.query(
            "INSERT INTO products SET ?", {
                product_name: productName,
                department_name: productDepartment,
                price: productPrice,
                stock_quantity: productUnits
            },
            function (err, res) {
                var query = connection.query("SELECT * FROM products WHERE product_name=?", [productName], function (err, res) {
                    var updatedProductAddition = (res[0]);
                    console.log('');
                    console.log(productUnits + ' Units of ' + productName + ' have been added to department ' + productDepartment + ' at $' + productPrice + ' per unit.')
                    console.log('');
                    console.log('Item Added To Inventory:')
                    console.log('');
                    console.table(updatedProductAddition);
                });
            }
        );
    });
}