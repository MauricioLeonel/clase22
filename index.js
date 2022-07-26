const express = require('express');
const app = express()
const utils = require('util')
const {faker} = require('@faker-js/faker')
const server = require('http').createServer(app)
const mongoose = require('mongoose')
const path = require('path')
const io = require('socket.io')(server)
const {normalize,schema,denormalize} = require('normalizr')

const modelsChat = require('./models/modelsChat.js')
const DaoMongoChats = require('./dao/mongo')

//instanciamos los chats 
const chats = new DaoMongoChats(modelsChat)

//conectamos db
mongoose.connect('mongodb://localhost:27017/coderhouse')
.then(e=>{
	console.log('todo oki')
})
.catch(e=>{
	console.log(e)
})



app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))

app.get('/',(req,res)=>{
	sendFile('index.html')
})


app.get('/api/productos-test',(req,res)=>{
	const productos = []
	for(var i = 0; i < 5; i++){
		const result = {
			nombre:faker.commerce.product(),
			precio:faker.commerce.price(),
			foto:faker.image.technics()
		}
		productos.push(result)
	}
	res.send(productos)
})



io.on('connection',async function(cliente){
	cliente.on('mensajeChat',async(data)=>{
		const chat = await chats.saveData(data)
		const resultNewChat = await chats.getAll()
		const resultChatComplete = await dataChat(resultNewChat)
		io.sockets.emit('mensajesChat',resultChatComplete)

	})
	//solo recargo data
	const resultNewChat = await chats.getAll()
	cliente.emit('mensajesChat',await dataChat(resultNewChat))
})

const dataChat = async(data)=>{
	// porque convierto y luego parseo, porque sino me crea un objeto/entidad 
	// con muchas funciones propias de mongo, de esta forma limpio los elementos
	const datastringy = JSON.stringify(data)
	const dataParse = JSON.parse(datastringy)
	
	//definimos las entidades y los esquemas
	const autor = new schema.Entity('autores',{},{idAttribute:'email'})
	const mensaje = new schema.Entity('mensajes',{autor:autor},{idAttribute:'_id'})
	const userListSchema = [mensaje]
	//normalizamos con la data
	const normalizedData = normalize(dataParse, userListSchema);

	//sacamos el tamaño de los datos
	const sinComprimir = datastringy.length
	const comprimido = JSON.stringify(normalizedData).length
	//agregamos el procentaje de compresion 
	normalizedData.comprimido = Math.floor(((sinComprimir/comprimido)-1)*100)
	return normalizedData
}



server.listen(8080,()=>{
	console.log('todo oki')
})


























// const knex = require('knex')({
// 	client:'mysql',
// 	connection:{
// 		host:'127.0.0.1',
// 		user:'root',
// 		password:'root',
// 		database:'prueba'
// 	}
// })

// knex.schema.createTable('productos',table=>{
// 	// table.uuid('id').primary()
// 	table.string('nombre')
// 	table.string('codigo')
// 	table.float('precio')
// 	table.integer('stock')
// 	table.increments('id').primary()
// }).then(e=>{
// 	console.log('todo ok')
// }).catch(e=>{
// 	console.log('no se pudo',e)
// })

// knex('productos').insert([
// 	{
// 		nombre:'teclado',
// 		codigo:'baduw123Teclado',
// 		precio:123.20,
// 		stock:20
// 	},{
// 		nombre:'monitos',
// 		codigo:'baduw123Teclado',
// 		precio:123.20,
// 		stock:15
// 	},{
// 		nombre:'celular',
// 		codigo:'baduw123Teclado',
// 		precio:123.20,
// 		stock:30
// 	},{
// 		nombre:'platos',
// 		codigo:'baduw123Teclado',
// 		precio:123.20,
// 		stock:50
// 	},{
// 		nombre:'smartwatch',
// 		codigo:'baduw123Teclado',
// 		precio:123.20,
// 		stock:40
// 	}

// ]).then(e=>{
// 	console.log('todo ok')
// }).catch(e=>{
// 	console.log('todo mal',e)
// })


// knex('productos').select('nombre','codigo','precio')
// .then(e=>{
// 	console.log(e)
// }).catch(e=>{
// 	console.log('error')
// })

// knex('productos').where({id:'3'}).del().then(e=>{
// 	console.log('todo ok')
// }).catch(e=>{
// 	console.log('todo ok')
// })

// knex('productos').where({id:2}).update({stock:0})
// .then(e=>{
// 	console.log('todo oki')
// })
// .catch(e=>{
// 	console.log(e,'todo mal')
// })