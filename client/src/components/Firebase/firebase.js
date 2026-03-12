// Import the functions needed from the Firebase SDKs
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    sendPasswordResetEmail,
    updatePassword,
    sendEmailVerification,
} from 'firebase/auth';
// Your web app's Firebase configuration
// Paste the config you copied in Step 1 here
const firebaseConfig = {
    apiKey: "AIzaSyC2no1ZahnLCjle21uVMZAlspByAilxdFM",
    authDomain: "mse342-team19.firebaseapp.com",
    projectId: "mse342-team19",
    storageBucket: "mse342-team19.firebasestorage.app",
    messagingSenderId: "1093070464055",
    appId: "1:1093070464055:web:a029d92ef25daebe998bb2",
    measurementId: "G-M8KCPCPSDW"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
class Firebase {
    constructor() {
        this.auth = getAuth(app);
        this.googleProvider = new GoogleAuthProvider();
    }
    // *** Auth API ***
    doCreateUserWithEmailAndPassword = (email, password) =>
        createUserWithEmailAndPassword(this.auth, email, password);
    doSignInWithEmailAndPassword = (email, password) =>
        signInWithEmailAndPassword(this.auth, email, password);
    doSignInWithGoogle = () =>
        signInWithPopup(this.auth, this.googleProvider);
    doSignOut = () => signOut(this.auth);
    doPasswordReset = email => sendPasswordResetEmail(this.auth, email);
    doPasswordUpdate = password =>
        updatePassword(this.auth.currentUser, password);
    doSendEmailVerification = () =>
        sendEmailVerification(this.auth.currentUser);
    // Function to get ID Token of the currently signed-in user
    doGetIdToken = () => {
        return new Promise((resolve, reject) => {
            const user = this.auth.currentUser;
            if (user) {
                user
                    .getIdToken()
                    .then(token => {
                        resolve(token);
                    })
                    .catch(error => {
                        reject(error);
                    });
            } else {
                reject(new Error('No user is signed in.'));
            }
        });
    };
}
export default Firebase;