import { Injectable, NgZone } from '@angular/core';
import { User } from "../services/user";
import { auth } from 'firebase/app';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from "@angular/router";

@Injectable ({ providedIn: 'root' })

export class AuthService
{
    userData: any;  // save logged in user data

    constructor
    (
        public afs: AngularFirestore,   // inject firestore service
        public afAuth: AngularFireAuth,  // inject firebase auth service
        public router: Router,
        public ngZone: NgZone           // NgZone service to remove outside scope warning
    )

    {
        // saving user data in localStorage when logged inn and setting up null when logged out
        this.afAuth.authState.subscribe (user =>
            {
                if (user)
                {
                    this.userData = user;
                    localStorage.setItem ('user', JSON.stringify (this.userData));
                    JSON.parse (localStorage.getItem ('user'));
                }
                else
                {
                    localStorage.setItem ('user', null);
                    JSON.parse (localStorage.getItem ('user'));
                }
            })
    }

    // login with email/password
    SignIn (email, password)
    {
        return this.afAuth.auth.signInWithEmailAndPassword (email, password)
        .then ((result) =>
        {
            this.ngZone.run (() =>
            {
                this.router.navigate (['dashboard']);
            });
            this.SetUserData (result.user);
        })
        .catch ((error) =>
        {
            window.alert (error.message)
        })
    }

    // sign up with email/password
    SignUp (email, password)
    {
        return this.afAuth.auth.createUserWithEmailAndPassword (email, password)
        .then ((result) =>
        {
            // call the SendVerificationMail() function when new user sign up and returns promise
            this.SendVerificationMail ();
            this.SetUserData (result.user);
        })
        .catch ((error) =>
        {
            window.alert (error.message)
        })
    }

    // send email verification when new user sign up
    SendVerificationMail ()
    {
        return this.afAuth.auth.currentUser.sendEmailVerification ()
        .then (() =>
        {
            this.router.navigate (['verify-email']);
        })
    }

    // reset forgot password
    ForgotPassword (passwordResetEmail)
    {
        return this.afAuth.auth.sendPasswordResetEmail (passwordResetEmail)
        .then (() =>
        {
            window.alert ('Password reset email sent, checck your inbox.');
        })
        .catch ((error) =>
        {
            window.alert (error)
        })
    }

    // returns true when user is logged in and email is verified
    get isLoggedIn (): boolean
    {
        const user = JSON.parse (localStorage.getItem ('user'));
        return (user !== null && user.emailVerified !== false) ? true:false;
    }

    // login with google
    GoogleAuth ()
    {
        return this.AuthLogin (new auth.GoogleAuthProvider ());
    }

    // auth logic to run auth providers
    AuthLogin (provider)
    {
        return this.afAuth.auth.signInWithPopup (provider)
        .then ((result) => 
        {
            this.ngZone.run (() =>
            {
                this.router.navigate (['dashboard']);
            })
            this.SetUserData (result.user);
        })
        .catch ((error) =>
        {
            window.alert (error)
        })
    }

    // setting up user data when login with username/password, signup with username/password and login with social auth provider in Firestore database using AngularFirestore + AngularFirestoreDocument service
    SetUserData (user)
    {
        const userRef: AngularFirestoreDocument <any> = this.afs.doc ('users/${user.uid}');
        const userData: User =
        {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified
        }
        return userRef.set (userData, {merge: true})
    }

    // signout
    SignOut ()
    {
        return this.afAuth.auth.signOut().then(() =>
        {
            localStorage.removeItem ('user');
            this.router.navigate (['login']);
        })
    }
}