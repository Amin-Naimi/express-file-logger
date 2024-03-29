const express = require('express');
const bodyParser = require('body-parser');
const excel = require('exceljs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');


const app = express();
app.use(bodyParser.json());
const port = 8090;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage });



app.get('/', async (request, response) => {
    try {
        const res = "Welcome to our HTTP Server";
        response.send(res);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
});

app.post('/upload', upload.single('file'), (request, response) => {
    try {
        const file = request.file; // Le fichier uploadé est accessible via request.file
        if (!file) {
            response.status(400).send('Aucun fichier n\'a été téléchargé.');
            return;
        }
        response.status(200).send('Fichier téléchargé avec succès.');
    } catch (error) {
        response.status(500).json({ Error_message: error.message });
    }
});

app.post('/logs', (request, response) => {
    try {
        let data;
        if (request.is('json')) {
            data = request.body;
        } else {
            data = JSON.parse(JSON.stringify(request.body));
            console.log("Sorry is not a valid type of data required only json");
        }

        const filePath = path.resolve(__dirname, '../files/logs.xlsx');

        const workbook = new excel.Workbook();
        //Charger le fichier Excel existant
        if (fs.existsSync(filePath)) {
            workbook.xlsx.readFile(filePath)
                .then(() => {
                    const keys = Object.keys(data); // En-têtes des champs
                    /*Si la feuille de calcul existe, elle est assignée à la variable sheet, sinon une nouvelle feuille de calcul est créée*/
                    let sheet = workbook.getWorksheet(keys.join('_')) || workbook.addWorksheet(keys.join('_'));
                    addDataToSheet(sheet, data);
                    saveWorkbook(workbook, filePath, response);
                })
                .catch(error => {
                    console.error('Error reading existing file:', error);
                    response.status(500).send('Error reading existing file');
                });
                //créer un nouveau fichier
        } else {
            const keys = Object.keys(data); // En-têtes des champs
            let sheet = workbook.addWorksheet(keys.join('_'));
            addDataToSheet(sheet, data);
            saveWorkbook(workbook, filePath, response);
        }
    } catch (error) {
        console.log("something was wrong ");
        console.log(error);
        response.status(500).json({ Error_message: error });
    }
});
function addDataToSheet(sheet, data) {
    const keys = Object.keys(data); // En-têtes des champs
    const values = Object.values(data); // Valeurs des champs

    // Vérifiez si les en-têtes existent déjà
    let headersExist = false;
    sheet.eachRow((row, rowNumber) => {
        if (row.values.includes(keys[0]) && row.values.includes(keys[1])) {
            headersExist = true;
        }
    });

    // Ajoutez les en-têtes s'ils n'existent pas encore
    if (!headersExist) {
        sheet.addRow(keys);
    }

    // Ajoutez les valeurs des données
    sheet.addRow(values);
}

function saveWorkbook(workbook, filePath, response) {
    workbook.xlsx.writeFile(filePath)
        .then(() => {
            console.log("success!");
            console.log('Logs saved to', filePath);
            response.status(200).send('Logs saved successfully');
        })
        .catch((error) => {
            console.log("failure!");
            if (error.code === 'EBUSY') {
                console.log('File is busy, retrying... if the file is open please close it');
                setTimeout(() => {
                    saveWorkbook(workbook, filePath, response); // Retry saving
                }, 1000);
            } else {
                console.error('Error saving logs:', error);
                response.status(500).send('Error saving logs');
            }
        });
}

app.listen(port, () => {
    console.log("***********__HTTP_SERVER__***************");
    console.log(`Server is running at port: ${port}`);
    console.log("***********__HTTP_SERVER__***************");
});
