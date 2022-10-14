export const courseInfo = (bot, foundCourse, chatId) => {
    return bot.sendPhoto(chatId, "https://st3.depositphotos.com/5392356/13702/i/600/depositphotos_137026300-stock-photo-programmer-working-in-a-software.jpg", {
        caption: `<b>
    ${foundCourse.describtion}
    </b>`,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'havola',
                        callback_data: 'link',
                        url: 'https://kun.uz'
                    },
                    {
                        text: 'Royxatdan o`tish',
                        callback_data: foundCourse.id
                    }
                ]
            ]
        }
    })
} 