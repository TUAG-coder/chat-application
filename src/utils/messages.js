const generateMessage = (text) => {
    return {
        text: text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (link) => {
    return {
        url: link,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}