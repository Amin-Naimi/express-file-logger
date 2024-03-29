const express = require('express');
const fs = require('fs');
const xmlparser = require('express-xml-bodyparser');
const xmlbuilder = require('xmlbuilder');
const ExcelJS = require('exceljs');

const app = express();
const port = 3000

app.use(xmlparser());

app.post('/xml', function (req, res) {
    let xmlData = req.body;
    let xmlString = xmlbuilder.create(xmlData).end({ pretty: true});
    fs.appendFile('../xml_files/output.xml', xmlString, function(err) {
        if(err) {
            console.log(err);
            res.status(500).send('Erreur lors de l\'écriture du fichier XML');
        } else {
            let jsonData = JSON.stringify(xmlString)
            console.log(jsonData);
            // Création d'un nouveau workbook
            let workbook = new ExcelJS.Workbook();
            let worksheet = workbook.addWorksheet('Données XML');

            // Ajout des données dans le worksheet
            // Ici, je suppose que xmlData est un objet avec des clés et des valeurs
            let rowNumber = 1;
            for (let key in xmlData) {
                worksheet.getCell(`A${rowNumber}`).value = key;
                worksheet.getCell(`B${rowNumber}`).value = xmlData[key];
                rowNumber++;
            }

            // Sauvegarde du fichier Excel
            workbook.xlsx.writeFile('../excel_files/output.xlsx')
            .then(function() {
                res.status(200).send('Données XML reçues et stockées avec succès dans les fichiers XML et Excel');
            })
            .catch(function(err) {
                console.log(err);
                res.status(500).send('Erreur lors de l\'écriture du fichier Excel');
            });
        }
    });
});

app.listen(port,() => {
    console.log("***********__HTTP_SERVER__***************");
    console.log(`Server is running at : ${port}`);
    console.log("***********__HTTP_SERVER__***************");
});
