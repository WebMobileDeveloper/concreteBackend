const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const moment = require('moment')

const gmailEmail = "vladdragonsun@gmail.com";
const gmailPassword = "***";
const mailTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: gmailEmail,
        pass: gmailPassword,
    },
    port: 587,
    secure: true
});
const APP_NAME = 'Concrete Direct';
const adminEmail = 'andrei.nasic.golden@gmail.com';
const reminderScheduleMinute = 60  // unit is min
const app = admin.initializeApp();


// Sends an email confirmation when a user changes his mailing list subscription.
exports.sendOrderRequestEmail = functions.database.ref('/{OrderType}/{id}/history/{index}').onCreate((snapshot, context) => {
    let OrderType = context.params.OrderType;
    let id = context.params.id;
    let index = context.params.index;

    const action = snapshot.val();
    functions.database.ref(OrderType+"/"+id).once('value', (snap)=>{
        const item = snap.val();
        item.key = id;
        console.log(item)
        switch (action.action) {
            case 'Required':
                sendRequiredEmail(OrderType, item);
                sendRegisterEmail(OrderType, item);
                break;
            case 'Completed':
                sendCompleteEmail(OrderType, item);
                break;
            default:
                sendUpdateEmail(OrderType, item);
        }
    })
    return null;
});
const sendRequiredEmail = (OrderType, item) => {
    const subject = `New ${OrderType} Required`;

    const mailOptions = {
        from: `"${APP_NAME}" <no-reply@ConcreteDirect.com>`,
        to: adminEmail,
        subject: subject
    };
    const emailHeader = ` 
    <h1 class="header">New ${OrderType} Request</h1>
    <div>Hi, Chris. You receiced new ${OrderType} request!</div> `;
    const emailBody = getEmailBody(OrderType, item);
    const emailFooter = `<div><p>You can check more details and update order state on mobile apps.</p></div>`;
    mailOptions.html = createHTML(subject, emailHeader, emailBody, emailFooter);
    mailTransport.sendMail(mailOptions)
}
const sendRegisterEmail = (OrderType, item) => {
    const customerEmail = 'rohit.patel7@aol.com';
    // const customerEmail = item.email;
    const subject = `${OrderType} sent successfully!`;

    const mailOptions = {
        from: `"${APP_NAME}" <no-reply@ConcreteDirect.com>`,
        to: customerEmail,
        subject: subject
    };
    const emailHeader = ` 
    <h1 class="header">New ${OrderType} request sent successfully</h1>
    <div>Hi, ${item.customer_name}. Thanks for your join us. <br/>
    Your new request has been registered successfully. Below is your request details. 
    </div> `;
    const emailBody = getEmailBody(OrderType, item);
    const emailFooter = `<div><p>We will send new email if there is any state change from client.</p>
    And you can check request state on app too.<br/><br/>
    Kind regards,<br/>

    Chris Reitano<br/>
    CJR Concrete Pumping Pty Ltd<br/>
    Concrete Pumping & Shotcreting Specialists<br/>
    www.cjrconcretepumping.com.au <br/>
    0412 055 024<br/>
    </p>
    </div>`;
    mailOptions.html = createHTML(subject, emailHeader, emailBody, emailFooter);
    mailTransport.sendMail(mailOptions)
}
const sendCompleteEmail = (OrderType, item) => {
    const customerEmail = 'rohit.patel7@aol.com';
    // const customerEmail = item.email;
    const subject = `${OrderType} completed!`;

    const mailOptions = {
        from: `"${APP_NAME}" <no-reply@ConcreteDirect.com>`,
        to: customerEmail,
        subject: subject
    };
    const emailHeader = ` 
    <h1 class="header">${OrderType} Completed</h1>
    <div>Hi, ${item.customer_name}. Your request has been completed.<br/>
    Below is details of your request. 
    </div> `;
    const emailBody = getEmailBody(OrderType, item);
    const emailFooter = `<div><p>This request has been finished permanently.<br/>
    You have to create new request if you are going to new request.
    Thanks for your cooperation.
    Hope you will use our service again.<br/><br/>
    Kind regards,<br/>

    Chris Reitano<br/>
    CJR Concrete Pumping Pty Ltd<br/>
    Concrete Pumping & Shotcreting Specialists<br/>
    www.cjrconcretepumping.com.au <br/>
    0412 055 024<br/>
    </p>
    </div>`;
    mailOptions.html = createHTML(subject, emailHeader, emailBody, emailFooter);
    mailTransport.sendMail(mailOptions)
}
const sendUpdateEmail = (OrderType, item) => {
    const customerEmail = 'rohit.patel7@aol.com';
    // const customerEmail = item.email;
    const subject = `${OrderType} state changed!`;

    const mailOptions = {
        from: `"${APP_NAME}" <no-reply@ConcreteDirect.com>`,
        to: customerEmail,
        subject: subject
    };
    const emailHeader = ` 
    <h1 class="header">${OrderType} state changed</h1>
    <div>Hi, ${item.customer_name}. There is new state update on your request.<br/>
    Below is details of your request. 
    </div> `;
    const emailBody = getEmailBody(OrderType, item);
    const emailFooter = `<div><p>We will send new email if there is any state change from client.<br/>
    And you can check request state on app too.<br/><br/>
    Kind regards,<br/>

    Chris Reitano<br/>
    CJR Concrete Pumping Pty Ltd<br/>
    Concrete Pumping & Shotcreting Specialists<br/>
    www.cjrconcretepumping.com.au <br/>
    0412 055 024<br/>
    </p>
    </div>`;
    mailOptions.html = createHTML(subject, emailHeader, emailBody, emailFooter);
    mailTransport.sendMail(mailOptions)
}


const createHTML = (subject, emailHeader, emailBody, emailFooter) => {
    return `<!doctype html>
    <html>    

    <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${subject}</title>
        ${style}
    </head>    
    <body>
        <div class="container">           
            ${emailHeader}    
            ${emailBody}
            ${emailFooter}
        </div>
    </body>    
    </html>`
}
const getEmailBody = (OrderType, item) => {
    return `<h3 style="text-align: center">${item.title}</h3>
    <ul>
        <li class="section">
            <span class="section-title">- ${OrderType} Information</span>
            <ul class="section-content">
                <li><span class="sub-title">${OrderType} Title</span><span class="sub-value">${item.title}</span></li>
                <li><span class="sub-title">${OrderType} Id</span><span class="sub-value">${item.key}</span></li>
                <li><span class="sub-title">Current Status</span><span class="sub-value" style="color:crimson">${item.status}</span></li>
                <li><span class="sub-title">Request Time</span><span class="sub-value">${MomentFunc.toDate(item.requestTime)}</span></li>
                <li><span class="sub-title">Last Updated</span><span class="sub-value">${MomentFunc.fromNow(item.lastUpdateTime)}</span></li>
            </ul>
        </li>

        <li class="section">
            <span class="section-title">- Account history for this request</span>
            <ul class="section-content">
                ${getHistoryArray(item.history)}
            </ul>
        </li>

        <div class="hr"></div>

        <li class="section">
            <span class="section-title">- Delivery Details</span>
            <ul class="section-content">
                <li><span class="sub-title">Delivery Date</span><span class="sub-value">${item.delivery_date}</span></li>
                <li><span class="sub-title">Delivery Time</span><span class="sub-value">${item.delivery_time}</span></li>
                <li><span class="sub-title">Delivery Address</span><span class="sub-value">${item.delivery_address}</span></li>
                <li><span class="sub-title">Delivery Suburb</span><span class="sub-value">${item.suburb}</span></li>
            </ul>
        </li>
        <div class="hr"></div>

        <li class="section">
            <span class="section-title">- Customer Details</span>
            <ul class="section-content">
                <li><span class="sub-title">Company Name</span><span class="sub-value">${item.company_name}</span></li>
                <li><span class="sub-title">Customer Name</span><span class="sub-value">${item.customer_name}</span></li>
                <li><span class="sub-title">Phone Number</span><span class="sub-value">${item.phone}</span></li>
                <li><span class="sub-title">E-mail Address</span><span class="sub-value">${item.email}</span></li>
            </ul>
        </li>
        <div class="hr"></div>

        <li class="section">
            <span class="section-title">- Pump Options</span>
            <ul class="section-content">
                <li><span class="sub-title">Pump Required</span><span class="sub-value">${item.pumpRequired ? 'Yes' : 'No'}</span></li>
                ${getConditionalItem(item.pumpRequired, 'Quantity (m3)', item.quantity)}
                ${getConditionalItem(item.pumpRequired, 'Job Type', item.job_type)}
            </ul>
        </li>
        <div class="hr"></div>

        <li class="section">
            <span class="section-title">- Concrete Details</span>
            <ul class="section-content">
                <li><span class="sub-title">MPA - Strength</span><span class="sub-value">${item.mpa_strength}</span></li>
                <li><span class="sub-title">Stone Size - Milis</span><span class="sub-value">${item.stone_size}</span></li>
                <li><span class="sub-title">Slump - Wetness</span><span class="sub-value">${item.slump_wetness}</span></li>
            </ul>
        </li>
        <div class="hr"></div>

        <li class="section">
            <span class="section-title">- Other Options</span>
            <ul class="section-content">
                ${getConditionalItem(item.note, 'Note', item.note)}
            </ul>
        </li>
        <div class="hr"></div>
    </ul>`
}
const getOrderEmailBody1 = (item) => {
    return `<!doctype html>
    <html>    

    <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Order Required</title>
        <style>
            body {
                background-color: #d8dad9;
            }

            .container {
                background-color: white;
                width: 80%;
                margin: 0px auto;
                border-radius: 6px;
                padding: 20px;
            }
    
            .header {
                text-align: center;
            }
    
            ul,
            li {
                list-style-type: none;
            }
    
            .section-title {
                font-size: 18px;
                font-weight: 600;
            }
    
            .section-content>li {
                line-height: 30px;
            }
    
            .sub-title {
                display: inline-block;
                background-color: "#eeeecc";
                width: 200px;
                color: rgb(25, 25, 112);
            }
    
            .right-align {
                width: 150px;
                padding-left: 100px;
            }
    
            .hr {
                height: 1px;
                border-bottom: solid 1px #d5d5d5;
                width: 80%;
                margin: 10px auto;
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <h1 class="header">New Order Request</h1>
            <div>Hi, Chris. You receiced new order request!</div>
            <h3 style="text-align: center">${item.title}</h3>
    
            <ul>
                <li class="section">
                    <span class="section-title">- Order Information</span>
                    <ul class="section-content">
                        <li><span class="sub-title">Order Title</span><span class="sub-value">${item.title}</span></li>
                        <li><span class="sub-title">Order Id</span><span class="sub-value">${item.key}</span></li>
                        <li><span class="sub-title">Current Status</span><span class="sub-value" style="color:crimson">${item.status}</span></li>
                        <li><span class="sub-title">Order Time</span><span class="sub-value">${MomentFunc.toDate(item.requestTime)}</span></li>
                        <li><span class="sub-title">Last Updated</span><span class="sub-value">${MomentFunc.fromNow(item.lastUpdateTime)}</span></li>
                    </ul>
                </li>
    
                <li class="section">
                    <span class="section-title">- Account history for this request</span>
                    <ul class="section-content">
                        ${getHistoryArray(item.history)}
                    </ul>
                </li>
    
                <div class="hr"></div>
    
                <li class="section">
                    <span class="section-title">- Delivery Details</span>
                    <ul class="section-content">
                        <li><span class="sub-title">Delivery Date</span><span class="sub-value">${item.delivery_date}</span></li>
                        <li><span class="sub-title">Delivery Time</span><span class="sub-value">${item.delivery_time}</span></li>
                        <li><span class="sub-title">Delivery Address</span><span class="sub-value">${item.delivery_address}</span></li>
                        <li><span class="sub-title">Delivery Suburb</span><span class="sub-value">${item.suburb}</span></li>
                    </ul>
                </li>
                <div class="hr"></div>
    
                <li class="section">
                    <span class="section-title">- Customer Details</span>
                    <ul class="section-content">
                        <li><span class="sub-title">Company Name</span><span class="sub-value">${item.company_name}</span></li>
                        <li><span class="sub-title">Customer Name</span><span class="sub-value">${item.customer_name}</span></li>
                        <li><span class="sub-title">Phone Number</span><span class="sub-value">${item.phone}</span></li>
                        <li><span class="sub-title">E-mail Address</span><span class="sub-value">${item.email}</span></li>
                    </ul>
                </li>
                <div class="hr"></div>
    
                <li class="section">
                    <span class="section-title">- Pump Options</span>
                    <ul class="section-content">
                        <li><span class="sub-title">Pump Required</span><span class="sub-value">${item.pumpRequired ? 'Yes' : 'No'}</span></li>
                        ${getConditionalItem(item.pumpRequired, 'Quantity (m3)', item.quantity)}
                        ${getConditionalItem(item.pumpRequired, 'Job Type', item.job_type)}
                    </ul>
                </li>
                <div class="hr"></div>
    
                <li class="section">
                    <span class="section-title">- Concrete Details</span>
                    <ul class="section-content">
                        <li><span class="sub-title">MPA - Strength</span><span class="sub-value">${item.mpa_strength}</span></li>
                        <li><span class="sub-title">Stone Size - Milis</span><span class="sub-value">${item.stone_size}</span></li>
                        <li><span class="sub-title">Slump - Wetness</span><span class="sub-value">${item.slump_wetness}</span></li>
                    </ul>
                </li>
                <div class="hr"></div>
    
                <li class="section">
                    <span class="section-title">- Other Options</span>
                    <ul class="section-content">
                        ${getConditionalItem(item.note, 'Note', item.note)}
                    </ul>
                </li>
                <div class="hr"></div>
            </ul>
        </div>
        <div><p>You can check more details and update order state on mobile apps.</p></div>
        
    </body>
    
    </html>`
}
const MomentFunc = {
    fromNow: timestamp => moment(timestamp).fromNow(),
    toDate: timestamp => moment(timestamp).format("ddd, MMM/DD/YYYY, h:mm A")
}
const getHistoryArray = (array = []) => {
    let result = ``
    array.map(historyItem => {
        let history = `<li><span class="sub-title">${historyItem.action}</span><span class="sub-value">${MomentFunc.toDate(historyItem.time)}</span></li>`;
        if (history.more) {
            history += `<li><span class="sub-title right-align">*</span><span class="sub-value">${historyItem.more}</span></li>`;
        }
        result += history;
    })
    return result;
}
const getConditionalItem = (condition, title, value) => {
    if (!condition) return ``
    return `<li><span class="sub-title">${title}</span><span class="sub-value">${value}</span></li>`
}
const style = `<style>
body {
    background-color: #d8dad9;
}

.container {
    background-color: white;
    width: 80%;
    margin: 0px auto;
    border-radius: 6px;
    padding: 20px;
}

.header {
    text-align: center;
}

ul,
li {
    list-style-type: none;
}

.section-title {
    font-size: 18px;
    font-weight: 600;
}

.section-content>li {
    line-height: 30px;
}

.sub-title {
    display: inline-block;
    background-color: "#eeeecc";
    width: 200px;
    color: rgb(25, 25, 112);
}

.right-align {
    width: 150px;
    padding-left: 100px;
}

.hr {
    height: 1px;
    border-bottom: solid 1px #d5d5d5;
    width: 80%;
    margin: 10px auto;
}
</style>`;