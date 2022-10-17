import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"

import TelegramBot from "node-telegram-bot-api"
import { read, write } from "./utils/FS.js"
import keyboard from "./helpers/keyboards/keyboards.js"
import { geo } from "./utils/geofinder.js"
import fs from "fs"
import path from "path"
import { contactHandlers } from "./handlers/contact.handlers.js"
import { courseInfo } from "./handlers/courseInfo.js"
import { courseValidation } from "./validation/validation.js"
import { errorHandler } from "./middlewares/errorHandlers.js"
import { ErrorHandler } from "./errors/errorHandler.js"

const PORT = process.env.PORT || 9000

const userInfo = {}

const bot = new TelegramBot(process.env.TOKEN, { polling: true })

const app = express()

app.use(express.json())
app.use(cors())

bot.onText(/\/start/, msg => {
    const chatId = msg.chat.id
    bot.sendMessage(chatId, `Salom ${msg.from.first_name} bizning botga hush kelibsiz`, {
        reply_markup: {
            keyboard: keyboard.menu,
            resize_keyboard: true
        }
    })
})

bot.on('error', console.log)

bot.on('message', msg => {
    const chatId = msg.chat.id

    if (msg.text == "Bizning kurslar 👨🏻‍🎓") {
        bot.sendMessage(chatId, 'Bizning kurslar jadvali', {
            reply_markup: {
                keyboard: keyboard.courses,
                resize_keyboard: true
            }
        })
    }

    if (msg.text == "Asosiy menyu 🔙") {
        bot.sendMessage(chatId, "menyu", {
            reply_markup: {
                keyboard: keyboard.menu,
                resize_keyboard: true
            }
        })
    }
})

bot.on('message', msg => {
    const chatId = msg.chat.id

    const foundCourse = read('courses.json').find(e => e.name == msg.text)

    if (foundCourse) {
         courseInfo(bot, foundCourse, chatId)
    }
})

bot.on('callback_query', msg => {
    const foundCourse = read('courses.json').find(e => e.id == msg.data)
    if (foundCourse) {
        bot.sendMessage(msg.message.chat.id, 'Manzilingizni jonating', {
            reply_markup: JSON.stringify({
                keyboard: [
                    [
                        {
                            text: "Mazilingizni kiriting",
                            request_location: true
                        }
                    ]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            })
        })
    }
})

bot.on('location', async msg => {
    const { latitude, longitude } = msg.location
    const userLocation = await geo(latitude, longitude)
    
    if(userLocation) {
        console.log(typeof userLocation)
        bot.sendMessage(msg.chat.id, `${userLocation} - shu manzilni tasdiqlaysizmi`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Ha",
                            callback_data: "yes"
                        },
                        {
                            text: "Yo'q",
                            callback_data: "no"
                        }
                    ],
                ]
            }
        })
    }

    // console.log(msg);
})

bot.on('callback_query', async location => {
    console.log(location);
    const userLocation = location?.data.split('-')[1]
    const userStatus = location?.data.split('-')[0]

    if (userStatus == 'yes') {
        const userContact = await contactHandlers(bot, location,)
        bot.onReplyToMessage(userContact.chat.id, userContact.message_id, async msg => {

            const userName = await bot.sendMessage(msg.chat.id, 'Ismingizni yozing', {
                reply_markup: {
                    force_reply: true
                }
            })

            bot.onReplyToMessage(userName.chat.id, userName.message_id, async name => {
                const allUsers = read('users.json')
                
                allUsers.push({
                    phone: msg.contact.phone_number,
                    name: name.text,
                    location: location.message.text.split('-')
                })

                const newUser = await write('users.json', allUsers)

                if (newUser) {
                    bot.sendMessage(name.chat.id, `${name.text} siznig so'rovingiz qabul qilindi`, {
                        reply_markup: {
                            keyboard: keyboard.menu,
                            resize_keyboard: true
                        }
                    })
                }

            })
        })
    }
})

app.get('/courses', (req, res) => {
    const allCourses = read('courses.json')
    res.json(allCourses)
})

app.post('/courses', async(req, res, next) => {
    const {error, value } = courseValidation.validate(req.body) 
    const { describtion, name } = value
   
    if(error) {
        return next(new ErrorHandler(error.message, 400))
    }

    const allCourses = read('courses.json')

    allCourses.push({id: allCourses.at(-1)?.id + 1, name, describtion})

    const newCourse = await write('courses.json', allCourses)
    .catch(err => next( new ErrorHandler(err.message, 503)))

    if (newCourse) {
        res.json({
            message: "new course created"
        })
    }
    res.json("ok")
})

app.get("/courseRequest", async(req, res) => {
    const allCourses = read('courses.json')
    const allUsers = read('users.json')

})

app.use(errorHandler)

app.all('/*', (_, res) => res.sendStatus(404))

app.listen(PORT, () => {
    console.log(PORT);
})
