const express = require('express');
const app = express();
const _ = require('lodash');

app.get('/es6', (req, res) => {

    var userData = {
        'id': '1',
        'name': 'Ak',
        'age': 23
    }

    //  BEFORE DESTRUCTING
    var name = userData.name;
    var age = userData.age;
    console.log(name, age);

    //  DESTRUCTING
    var { name, age } = userData;
    console.log(name, age);

    userDataFunc(userData);
    userDataFuncDestru(userData);
    
    function userDataFunc(userData) {
        var { name, age } = userData;
        console.log(name, age);
    }

    function userDataFuncDestru({ name = 'Ashok', age }) {
        console.log(name, age);
    };



    //  HIGHER ORDER FUNCTIONS
    //  CALL FUNCTION AS VALUE OR CALL FUNC INSIDE AN FUNCTION

    //  BEFORE
    function anyData(val) {
        return (val - 100);
    }

    let anyd = anyData(200);
    console.log(anyd);

    //  HOF

    let anyHof = ((val) => {
        return (val - 100)
    })
    var secondVariable = anyHof
    console.log(secondVariable(300));


    //  1.FILTER
    
    //  NORMAL METHOD
    var users = [
        { id: 1, name: 'Ak' },
        { id: 2, name: 'Ashok' },
        { id: 3, name: 'Pekka' }
    ]

    var todos = [
        { id: 1, todo: 'Todo 1' },
        { id: 2, todo: 'Todo 2' },
        { id: 3, todo: 'Todo 3' },
    ]

    for (var i = 0; i < users.length; i++) {
        if ((users[i].name) == 'Ashok') {
            console.log(users[i]);
        }
    }

    //  HOF FILTER FUNC

    var filterData = ((data) => {
        return data.name == 'Ashok'
    })

    let userFilter = users.filter(filterData);
    //  let todoFilter = todos.filter(filterData)
    console.log(userFilter);

//  2.MAP - STORE NAME DATA IN ONE OBJ/ARRAY

    //  BEFORE
    var names = [];
    for (var i = 0; i < users.length; i++){
        names.push(users[i].name);
    }
    console.log(names);

    //  MAP
    var namesMap = users.map((user) => {
        return user.name;
    })
    console.log(namesMap);

    //  RETURN & BRACES NOT REQUIRED - WHEN IT RETURNS ONLY ONE DATA
    var namesMap = users.map((user) => user.name);
    console.log(namesMap);


//  3.REDUCE - SUM DATA

    var orderList = [
        { id: 1, amount: 200 },
        { id: 2, amount: 100 },
        { id: 3, amount: 250 },
        { id: 4, amount: 300 },
    ]

    var forLoopTotalAmount = 0;
    for (var i = 0; i < orderList.length; i++){
        forLoopTotalAmount += orderList[i].amount;
    }
    console.log(forLoopTotalAmount);

    var reduceTotalAmount = orderList.reduce((sum, orderAmount) => {
        return sum + orderAmount.amount
        //  1st Iteration = orderAmount value added to sum 0 => 0 + 200 = 200
        //  2nd Iteration = orderAmount value added to sum 200 => 200 + 100 = 300
        //  .....
        //  nth Iteration
    }, 0)   //  O => SUM VALUE

    var reduceTotalAmount = orderList.reduce((sum, order) => sum + order.amount,0)
    console.log(reduceTotalAmount);

//  TEXT FILE TO ARRAY OF OBJECT
    //  var fileData = fs.readFileSync(testDataFile,'utf8');
    //  console.log(fileData);


//  4.CLOSURES
    //  USE OUTSIDE VARIABLE AT INSIDE FUNC 

    var x = 'x';
    function alphabets() {
        var y = x * 2;
        console.log(y);
    }
    x = 4;
    alphabets();
    
    //   PHP
/*
    //  $a = 100;
    $this->a = 100;
    public function testData(){
        //  dd($a);
        $this->a;
    }
*/
    
    
//  5.CURRYING
    
    //  BEFORE
    let userData1 = (name, exp, sal) => {
        return `${name} has ${exp} Exp with the salary of ${sal}`
    }

    let userData2 = userData1('Ashok', 2.5, 27000);
    console.log(userData2);


    //  CURRYING
    let user = name => exp => sal => {
        return `${name} has ${exp} Exp with the salary of ${sal}`
    }
    
    let UData = user('Ashok')(2.5)(27000);
    console.log(UData);

    let UDataName = user('Ashok');
    let UDataExp = UDataName(2.5);
    let UDataSal = UDataExp(27000);
    console.log(UDataSal);

    //  NON-CURRING INTO CURRYING

    let UDataCurry = _.curry(userData1);
    let UDataName1 = UDataCurry('Ashok');
    let UDataExp1 = UDataName1(2.5);
    let UDataSal1 = UDataExp1(27000);
    console.log(UDataSal1);


    //  REAL TIME NON-CURRYING TO CURRYING
    
    let hasUserName = (name,obj) => obj.name == name
    let userNameFilter = users.filter(u => hasUserName('Ashok', u));
    console.log(userNameFilter);

    let hasUserName1 = _.curry((name,obj) => obj.name == name)
    let userNameFilter1 = users.filter(hasUserName1('Ashok'));

    console.log(userNameFilter1);
    res.send('es6');
})

module.exports = app;