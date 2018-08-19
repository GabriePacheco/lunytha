https://fcm.googleapis.com/fcm/send
Content-Type:application/json
Authorization:key=AIzaSyZ-1u...0GBYzPu7Udno5aA
{
  "to" : "/topics/foo-bar",
  "priority" : "high",
  "notification" : {
    "body" : "This is a Firebase Cloud Messaging Topic Message!",
    "title" : "FCM Message",
  }
}