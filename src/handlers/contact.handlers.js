export const contactHandlers = (bot, location) => {
return  bot.sendMessage(location.message.chat.id, "kontaktingizni ulashing", {
    reply_markup: JSON.stringify({
        keyboard: [
            [
                {
                    text: "Kontaktingizni ulashing 📲",
                    request_contact: true
                }
            ],
        ],
        resize_keyboard: true,
        one_time_keyboard: true
    })
})

}