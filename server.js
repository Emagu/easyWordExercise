const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 80;
const translatte = require('translatte');
const randomWords = require('random-words');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('Static'));
app.get('/random', (req, res) => {
    let to;
    try{
        to = req.query.to;   
    }catch{}
    
    if(to == null){
        to = 'zh-tw';
    }
    var rand = randomWords();
    translatte(rand, {from: 'en', to: to}).then(result => {
        res.send(result.text);
    }).catch(err=>{
        res.send('fail');
    });
});

function GetTransalte(parm, option, callback, failCallback){
    
}

app.get('/translate', (req, res) => {
    let from = req.query.from;
    let to = req.query.to;
    let parm = req.query.parm;
    let oldRecord = GetTransalteByKeyword(from, to, parm);
    if(oldRecord == null){
        GetTransalte
        translatte(parm, {from: from, to: to}).then(result => {
            res.send({
                parm: parm,
                from: from,
                to: to,
                ans: result.text
            });
        }).catch(err => {
            res.send("can not translate");
        });
    }else
    {
       res.send(GetTransalteByKeyword(from, to, parm));
    }
    
});
app.post('/translate', (req,res)=>{
    let from = req.body.from;
    let to = req.body.to;
    let parm = req.body.parm;
    let ans = req.body.ans;
    let oldRecord = GetTransalteByKeyword(from, to, parm);
    
    if(oldRecord == null){
        AddTransalte(from, to, req.body);
    }
    else if(oldRecord.ans != ans){
        UpdateTransalte(from, to, req.body);
    }
   
   res.send("success"); 
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

function AddTransalte(from, to, obj){
    var oldRecord = GetTransalte(from, to);
    oldRecord.push(obj);
    fs.writeFileSync(GetTransalteDBName(from, to), JSON.stringify(oldRecord), 'utf-8');
}

function UpdateTransalte(from, to, obj){
    var dbData = GetTransalte(from, to);
    for (i = 0; i < dbData.length; i++) {
        if (dbData[i].parm === keyword) {
            dbData[i] = obj;
        }
    }
    fs.writeFileSync(GetTransalteDBName(from, to), JSON.stringify(dbData), 'utf-8');
}

function GetTransalteDBName(from, to){
    return 'db_' + from + '_' + to;
}

function GetTransalte(from, to){
    try{
        var contentText = fs.readFileSync(GetTransalteDBName(from, to), 'utf-8');
        return JSON.parse(contentText);
    }catch{
        return [];
    }
}

function GetTransalteByKeyword(from, to, keyword){
    var dbData = GetTransalte(from, to);
    for (i = 0; i < dbData.length; i++) {
        if (dbData[i].parm === keyword) {
            return dbData[i];
        }
    }
    return null;
}