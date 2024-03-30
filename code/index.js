require('dotenv').config()

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore({
  projectId: "sp24-41200-eshwar-globaljags"
});

exports.helloFirestore = async (event, context) => {
  const resource = context.resource;
  console.log('Function triggered by change to: ' +  resource);
  const locations = event.value.fields.location?.arrayValue.values.map(value => value.stringValue);
  const headline = event.value.fields.headline.stringValue;
  console.log(locations);

  let subscribersQuery = firestore.collection('subscribers'); 
  let subscribers = await subscribersQuery.get();
  
  subscribers.forEach(subscriberDoc => {
    const subscriberData = subscriberDoc.data();
    const watchRegions = subscriberData.watch_regions;

    for (let i = 0; i < watchRegions.length; i++) {
      for (let j = 0; j < locations.length; j++) {
        if (watchRegions[i] === locations[j]) {

          const email = subscriberData.email_address;
          console.log("Matched Location - ", locations[j], "For email ID - ", email);
          const message = {
            to: email,
            from: "ebandi@iu.edu",
            subject: `${headline}`,
            text: `Location - ${locations[j]} Deal - ${headline}`
          };

          sgMail.send(message);
          console.log("Email sent!");

        }
      }
    }
  });
};
