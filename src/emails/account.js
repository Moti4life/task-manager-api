// code for sending emails

const sgMail = require('@sendgrid/mail')

//set sgmail api key
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


//use backticks for injection

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'motifirebase@gmail.com',
        subject: 'Welcome to the App!',
        text: `welcome to the app, ${name}. Please enjoy the app`

    })

}

const subscriptionCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'motifirebase@gmail.com',
        subject: 'Cancellation email',
        text: `hello ${name}, please tell us why you are cancelling your subcription.`
    })


}

module.exports = {
    sendWelcomeEmail,
    subscriptionCancelEmail

}
