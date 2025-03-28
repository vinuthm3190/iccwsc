// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAKpu8ZOspBdgvT0OuMQ3UjPOQFJNb30Qg",
    authDomain: "iccwsc.firebaseapp.com",
    projectId: "iccwsc",
    storageBucket: "iccwsc.firebasestorage.app",
    messagingSenderId: "493299224859",
    appId: "1:493299224859:web:c28433ada539187b3a03be"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();