const express = require('express');
const router = express.Router();
const con = require('../mysqlConfig');

const symbol = require('currency-symbol-map') //usada para obtener el simbolo a partir del currency code
const curr = require('currency-codes') ///usada para obtener el longname de currency a partir del currency code
const countr = require("countries-code"); //usada para obtener el longname de country a partir del country code


//devuelve toda la info de Item, no use SELECT * debido a que hay columnas con el mismo nombre en las tablas, decidi renombrarlas en la consulta convenientemente para diferenciarlas
//Hubiera cambiado el nombre en la tabla? R:Si, pero queria respetar el modelo de la BDD lo mas posible.
//Es bueno que muestre la ID de las tablas en la consulta? R: Supongo que no pero en la observacion 1 decia todos los datos
router.get('/api/item/:id', async (req, res) => {   
  data = req.params
  const consulta = `SELECT Item.ID as ItemID, tittle, price, symbol, created_at, modified_at, 
                    category.ID as categoryID, name,
                    currency.ID as currencyID, currency.shortname as currencyShortname, currency.longname as currencyLongname,
                    country.ID as countryID, country.shortname as countryShortname, country.longname as countryLongname
                    FROM Item 
                    JOIN currency ON Item.currency_id = currency.ID
                    JOIN country ON Item.country_id = country.ID 
                    JOIN category ON Item.category_id = category.ID
                    WHERE Item.ID = ?`

  con.query(consulta, [data.id]) //encargado de realizar la consulta a la BDD
    .then((row) => {
      if (!row.length) { //mensaje adviertiendo que no se encuentra el Item al realizar la consulta
        res.send(`No existe un Item con ID: ${data.id}`)
      }
      else { 
        console.table(row)
        res.json(row) //enviar row en formato JSON
      }
    })
    .catch((errors) => { //mostrar posible error
      console.log(errors)
    })
});

router.post('/api/item', async (req, res) => {
  data = req.body;
  try {
    let selectCurrency = await con.query('SELECT ID from currency WHERE shortname = ? ', [data.currency])
    let selectCountry = await con.query('SELECT ID from country WHERE shortname = ? ', [data.country])
    if (!selectCurrency.length) { //hay que agregar currency a la tabla 
      selectCurrency = await con.query('INSERT INTO currency SET shortname = ?, longname = ? ', [data.currency, curr.code(data.currency).currency]);
      selectCurrency = selectCurrency.insertId
    }
    else { //guardar el ID de currency
      selectCurrency = selectCurrency[0].ID
    }
    if (!selectCountry.length) { //hay que agregar country a la tabla
      selectCountry = await con.query('INSERT INTO country SET shortname = ?, longname = ? ', [data.country, countr.getCountry(data.country)]);
      selectCountry = selectCountry.insertId
    }
    else { //guardar el ID de country
      selectCountry = selectCountry[0].ID
    }

    const insertItem = await con.query('INSERT INTO Item SET category_id = ?, currency_id = ?, country_id = ?, tittle = ?, price = ?, symbol = ?', [data.category_id, selectCurrency, selectCountry, data.tittle, data.price, symbol(data.currency)])
    
    res.json({  //Retorna el ID del Item creado
      "ID": insertItem.insertId
    })
  }
  catch (errores) {
    res.json(errores)
  }
})

//Modifica los elementos del ITEM a partir del ID y el archivo JSON enviado
router.put('/api/item/:id', async (req, res) => {
  let data = req.body;
  let modifId = req.params

  try {
    let selectCurrency = await con.query('SELECT ID from currency WHERE shortname = ? ', [data.currency])
    let selectCountry = await con.query('SELECT ID from country WHERE shortname = ? ', [data.country])
    if (!selectCurrency.length) { //hay que agregar currency a la tabla 
      selectCurrency = await con.query('INSERT INTO currency SET shortname = ?, longname = ? ', [data.currency, curr.code(data.currency).currency]);
      selectCurrency = selectCurrency.insertId
    }
    else { //guardar el ID de currency
      selectCurrency = selectCurrency[0].ID
    }
    if (!selectCountry.length) { //hay que agregar country a la tabla
      selectCountry = await con.query('INSERT INTO country SET shortname = ?, longname = ? ', [data.country, countr.getCountry(data.country)]);
      selectCountry = selectCountry.insertId
    }
    else { //guardar el ID de country
      selectCountry = selectCountry[0].ID
    }

    const update = await con.query('UPDATE Item SET currency_id = ?, country_id = ?, tittle = ?, price = ?, symbol = ? WHERE ID = ?', [selectCurrency, selectCountry, data.tittle, data.price, symbol(data.currency), modifId.id])
    
    res.send("listo") //No especificaba una respuesta ante el exito / fracaso del update
  }
  catch (errores) {
    console.log("entre a errores")
    console.log(errores)
    res.json(errores)
  }
})

//Borrar un Item a partir de la ID 
router.delete('/api/item/:id', async (req, res) => {
  data = req.params
  con.query('DELETE FROM Item WHERE ID = ?', [data.id])
    .then((resultado)=>{
      if(resultado.affectedRows ==1){
        res.json({ "exito": "true" }) //Json advirtiendo que el Item fue eliminado
      }
      else{
        res.json({ "exito": "false" }) //Json advirtiendo que el Item no fue eliminado
      }
    })
    .catch((errores)=>{
      console.log(errores)
      res.json(errores)
    })
    

})

module.exports = router;
