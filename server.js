const express = require('express');
const fs = require('fs');
const xmlparser = require('express-xml-bodyparser');
const xmlbuilder = require('xmlbuilder');

const app = express();
const port = 3000

app.use(xmlparser());

app.post('/xml', function (req, res) {
    let xmlData = req.body;
    let xmlString = xmlbuilder.create(xmlData).end({ pretty: true});
    fs.appendFile('output.xml', xmlString, function(err) {
        if(err) {
            console.log(err);
            res.status(500).send('Erreur lors de l\'écriture du fichier');
        } else {
            res.status(200).send('Données XML reçues et stockées avec succès');
        }
    });
});

app.listen(port,() => {
    console.log("***********__HTTP_SERVER__***************");
    console.log(`Server is running at : ${port}`);
    console.log("***********__HTTP_SERVER__***************");
});
